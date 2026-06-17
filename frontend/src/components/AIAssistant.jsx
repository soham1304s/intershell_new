import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([
    {
      role: "model",
      parts: [{ text: `Hi ${user?.name?.split(" ")[0] || "there"}! I'm your Internshell AI guide. How can I help you today?` }]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isOpen]);

  if (!user) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");
    
    const newHistory = [...history, { role: "user", parts: [{ text: userMessage }] }];
    setHistory(newHistory);
    setLoading(true);

    try {
      // We pass the history excluding the first welcome message and the newly added message
      // Actually, Gemini history needs strictly alternating user/model or just the proper format.
      // We can just pass the whole valid history minus the new message.
      const apiHistory = newHistory.slice(1, -1).map(h => ({
        role: h.role,
        parts: h.parts
      }));

      const res = await api("/chat", {
        method: "POST",
        body: { message: userMessage, history: apiHistory }
      });

      setHistory([...newHistory, { role: "model", parts: [{ text: res.text }] }]);
    } catch (error) {
      setHistory([...newHistory, { role: "model", parts: [{ text: "Sorry, I encountered an error connecting to my brain. Please try again later." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className={`ai-fab ${isOpen ? "hidden" : ""}`} 
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <Bot size={24} />
      </button>

      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <Bot size={18} />
              <span>Internshell Guide</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="icon-button"><X size={18} /></button>
          </div>
          
          <div className="ai-chat-messages">
            {history.map((msg, idx) => (
              <div key={idx} className={`ai-message-wrapper ${msg.role}`}>
                <div className="ai-avatar">
                  {msg.role === "model" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="ai-message">
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-message-wrapper model">
                <div className="ai-avatar"><Bot size={14} /></div>
                <div className="ai-message loading">
                  <Loader2 size={14} className="spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input" onSubmit={handleSend}>
            <input 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Ask me anything..." 
              autoFocus
            />
            <button type="submit" disabled={!message.trim() || loading} className="icon-button">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
