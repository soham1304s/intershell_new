import { Router } from "express";
import { auth } from "../auth.js";
import { User } from "../models/User.js";
import { asyncRoute, publicUser, send } from "../utils.js";

export const profileRoutes = Router();

profileRoutes.get("/", auth(), asyncRoute(async (req, res) => {
  const user = await User.findById(req.user.sub || req.user.id);
  if (!user) return send(res, null, "User not found", 404);
  const userObj = user.toObject();
  userObj.id = user._id.toString();
  send(res, publicUser(userObj));
}));

profileRoutes.put("/", auth(), asyncRoute(async (req, res) => {
  const allowed = ["name", "headline", "location", "phone", "skills", "bio", "education", "experience", "projects", "preferences"];
  const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const completionSignals = ["headline", "location", "phone", "skills", "bio", "education", "experience", "projects"];
  
  const user = await User.findById(req.user.sub || req.user.id);
  if (!user) return send(res, null, "User not found", 404);
  
  const merged = { ...user.toObject(), ...changes };
  
  changes.profileCompletion = Math.min(100, 30 + completionSignals.filter((key) => {
    const value = merged[key];
    return Array.isArray(value) ? value.length : Boolean(value);
  }).length * 9);
  
  Object.assign(user, changes);
  user.updatedAt = new Date();
  await user.save();
  
  const userObj = user.toObject();
  userObj.id = user._id.toString();
  
  return send(res, publicUser(userObj), "Profile updated");
}));
