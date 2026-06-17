import { ArrowLeft, MoreHorizontal, Paperclip, Search, Send, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api, timeAgo } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(null);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottom = useRef();
  const [searchParams, setSearchParams] = useSearchParams();
  const composeId = searchParams.get("compose");

  const load = () => api("/messages").then((items) => { 
    setConversations(items); 
    if (composeId) {
      const existing = items.find(c => c.participant.id === composeId);
      if (existing) setActive(existing);
      else setActive({ id: "new", participant: { id: composeId, name: "Candidate", avatar: "👤" }, unread: 0 });
    } else if (active && active.id === "new") {
      const real = items.find(c => c.participant.id === active.participant.id);
      if (real) setActive(real);
    } else if (!active && items[0]) {
      setActive(items[0]); 
    }
  });
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!active) return;
    if (active.id === "new") {
      setMessages([]);
      return;
    }
    api(`/messages/${active.id}`).then(setMessages);
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { auth: { token: localStorage.getItem("internshell_token") } });
    socket.emit("join_conversation", active.id);
    socket.on("receive_message", (message) => { if (message.conversationId === active.id) setMessages((current) => [...current, message]); load(); });
    return () => socket.disconnect();
  }, [active?.id]);
  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  if (!conversations) return <Loading />;
  const send = async (event) => {
    event.preventDefault(); if (!text.trim()) return;
    const body = { recipientId: active.participant.id, content: text };
    if (active.id !== "new") body.conversationId = active.id;
    const message = await api("/messages", { method: "POST", body });
    setMessages([...messages, message]); 
    setText(""); 
    if (active.id === "new") {
      searchParams.delete("compose");
      setSearchParams(searchParams);
    }
    load();
  };
  return <div className="messages-page page-enter">
    <aside className={`conversation-list ${active ? "mobile-hidden" : ""}`}><div className="conversation-head"><div><span className="eyebrow">Inbox</span><h1>Messages</h1></div></div><div className="conversation-search"><Search size={16} /><input placeholder="Search conversations" /></div>{conversations.length ? conversations.map((conversation) => <button key={conversation.id} className={active?.id === conversation.id ? "active" : ""} onClick={() => setActive(conversation)}><span className="avatar">{conversation.participant.avatar}</span><div><strong>{conversation.participant.name}</strong><p>{conversation.lastMessage.content}</p></div><small>{timeAgo(conversation.lastMessage.createdAt)}</small>{conversation.unread > 0 && <em>{conversation.unread}</em>}</button>) : <EmptyState title="Your inbox is quiet" text="Messages from candidates and hiring teams will appear here." />}</aside>
    <section className={`chat-panel ${!active ? "mobile-hidden" : ""}`}>{active ? <><header><button className="icon-button chat-back" onClick={() => setActive(null)}><ArrowLeft size={18} /></button><span className="avatar">{active.participant.avatar}</span><div><strong>{active.participant.name}</strong><small>{active.participant.headline}</small></div><button className="icon-button"><Video size={18} /></button><button className="icon-button"><MoreHorizontal size={18} /></button></header><div className="message-stream"><div className="conversation-date">Conversation</div>{messages.map((message) => <div className={`message-bubble ${message.senderId === user.id ? "mine" : ""}`} key={message.id}><p>{message.content}</p><small>{timeAgo(message.createdAt)}</small></div>)}<div ref={bottom} /></div><form className="message-composer" onSubmit={send}><button type="button"><Paperclip size={18} /></button><textarea rows="1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a thoughtful message..." /><button className="send-button"><Send size={18} /></button></form></> : <div className="chat-placeholder"><span><Send size={24} /></span><h2>Choose a conversation</h2><p>Your messages will appear here.</p></div>}</section>
  </div>;
}
