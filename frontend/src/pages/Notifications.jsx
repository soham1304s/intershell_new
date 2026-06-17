import { Bell, BriefcaseBusiness, CalendarClock, Check, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { api, timeAgo } from "../lib/api.js";
import Loading from "../components/Loading.jsx";

const icons = { interview: CalendarClock, match: Sparkles, application: BriefcaseBusiness, profile: UserRound };
export default function Notifications() {
  const [items, setItems] = useState(null);
  
  const load = () => api("/notifications").then(setItems);
  
  useEffect(() => { 
    load(); 
    
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
      auth: { token: localStorage.getItem("internshell_token") }
    });
    
    socket.on("new_notification", (notification) => {
      setItems(current => current ? [notification, ...current] : [notification]);
    });
    
    return () => socket.disconnect();
  }, []);
  
  if (!items) return <Loading />;
  
  const read = async (item) => { 
    if (!item.read) {
      await api(`/notifications/${item.id}/read`, { method: "PUT" }); 
      setItems(current => current.map(n => n.id === item.id ? { ...n, read: true } : n));
    }
  };
  
  return <div className="narrow-page page-enter"><div className="page-heading"><span className="eyebrow">Stay in the loop</span><h1>Notifications</h1><p>Updates that help you decide what to do next.</p></div><div className="notification-list">{items.map((item) => { const Icon = icons[item.type] || Bell; return <button className={`notification-item ${item.read ? "" : "unread"}`} onClick={() => read(item)} key={item.id}><span className={`notification-icon ${item.type}`}><Icon size={19} /></span><div><strong>{item.title}</strong><p>{item.message}</p><small>{timeAgo(item.createdAt || new Date())}</small></div>{!item.read && <span className="unread-dot" />}{item.read && <Check size={16} className="read-check" />}</button>; })}</div></div>;
}
