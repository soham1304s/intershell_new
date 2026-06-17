import { Router } from "express";
import { auth } from "../auth.js";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";
import { asyncRoute, fail, id, publicUser, send } from "../utils.js";

export const messageRoutes = Router();

messageRoutes.get("/", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const mine = await Message.find({
    $or: [{ senderId: userId }, { recipientId: userId }]
  }).lean();
  
  const grouped = new Map();
  mine.forEach((message) => {
    const existing = grouped.get(message.conversationId) || [];
    existing.push(message);
    grouped.set(message.conversationId, existing);
  });
  
  const participantIds = new Set();
  mine.forEach(msg => {
    participantIds.add(msg.senderId.toString());
    participantIds.add(msg.recipientId.toString());
  });
  
  const users = await User.find({ _id: { $in: Array.from(participantIds) } }).lean();
  const userMap = new Map(users.map(u => [u._id.toString(), { ...u, id: u._id.toString() }]));
  
  const conversations = [...grouped.entries()].map(([conversationId, messages]) => {
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const lastMessage = messages[messages.length - 1];
    
    // Ensure ids are strings for response
    lastMessage.id = lastMessage._id.toString();
    const senderStr = lastMessage.senderId.toString();
    const recipientStr = lastMessage.recipientId.toString();
    lastMessage.senderId = senderStr;
    lastMessage.recipientId = recipientStr;
    
    const participantId = senderStr === userId ? recipientStr : senderStr;
    return {
      id: conversationId,
      participant: userMap.has(participantId) ? publicUser(userMap.get(participantId)) : null,
      lastMessage,
      unread: messages.filter((message) => message.recipientId.toString() === userId && !message.read).length
    };
  }).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));
  
  send(res, conversations);
}));

messageRoutes.get("/:conversationId", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const messages = await Message.find({
    conversationId: req.params.conversationId,
    $or: [{ senderId: userId }, { recipientId: userId }]
  }).sort({ createdAt: 1 }).lean();
  
  send(res, messages.map(m => ({
    ...m,
    id: m._id.toString(),
    senderId: m.senderId.toString(),
    recipientId: m.recipientId.toString()
  })));
}));

messageRoutes.post("/", auth(), asyncRoute(async (req, res) => {
  const recipient = await User.findById(req.body.recipientId).lean();
  if (!recipient) return fail(res, "Recipient not found", 404);
  
  const content = req.body.content?.trim();
  if (!content) return fail(res, "Message cannot be empty");
  
  const userId = req.user.sub || req.user.id;
  
  const message = new Message({
    conversationId: req.body.conversationId || id("convo"),
    senderId: userId,
    recipientId: recipient._id,
    content: content,
    read: false
  });
  
  await message.save();
  
  const msgObj = message.toObject();
  msgObj.id = message._id.toString();
  msgObj.senderId = msgObj.senderId.toString();
  msgObj.recipientId = msgObj.recipientId.toString();
  
  req.app.get("io")?.to(`user:${recipient._id.toString()}`).emit("receive_message", msgObj);
  return send(res, msgObj, "Message sent", 201);
}));

messageRoutes.put("/:id/read", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const message = await Message.findOne({ _id: req.params.id, recipientId: userId });
  if (!message) return fail(res, "Message not found", 404);
  
  message.read = true;
  message.readAt = new Date();
  await message.save();
  
  const msgObj = message.toObject();
  msgObj.id = message._id.toString();
  msgObj.senderId = msgObj.senderId.toString();
  msgObj.recipientId = msgObj.recipientId.toString();
  
  return send(res, msgObj);
}));
