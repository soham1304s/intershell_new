import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { processMessage } from "../chatbot/chatbotEngine.js";
import { loadHistory, saveHistory, clearHistory } from "../chatbot/conversationManager.js";

export default function AIAssistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const savedHistory = loadHistory();
      if (savedHistory.length > 0) {
        setHistory(savedHistory);
      } else {
        setHistory([
          {
            role: "model",
            parts: [{ text: `Hi ${user?.name?.split(" ")[0] || "there"}! I'm your local Internshell AI guide. How can I help you today?` }],
            suggestedQuestions: ["What services do you offer?", "How do I request a service?"]
          }
        ]);
      }
    }
  }, [user]);

  useEffect(() => {
    if (history.length > 0) {
      saveHistory(history);
    }
  }, [history]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [history, isOpen, loading]);

  if (!user) return null;

  const handleSend = async (textToSend) => {
    const userMessage = typeof textToSend === 'string' ? textToSend.trim() : message.trim();
    if (!userMessage || loading) return;

    if (typeof textToSend !== 'string') {
      setMessage("");
    }
    
    const newHistory = [...history, { role: "user", parts: [{ text: userMessage }] }];
    setHistory(newHistory);
    setLoading(true);

    // Simulate a brief delay to feel like a real chatbot (even though it's local and fast)
    setTimeout(() => {
      const response = processMessage(userMessage);
      
      const botMessage = {
        role: "model",
        parts: [{ text: response.text }],
        action: response.action,
        suggestedQuestions: response.suggestedQuestions
      };

      setHistory([...newHistory, botMessage]);
      setLoading(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    clearHistory();
    setHistory([
      {
        role: "model",
        parts: [{ text: "Chat history cleared. How can I help you today?" }],
        suggestedQuestions: ["What services do you offer?", "What is Internshell?"]
      }
    ]);
  };

  const handleAction = (action) => {
    if (action.type === "navigate" && action.path) {
      navigate(action.path);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
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
              <span>Internshell Guide (Local)</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleClearChat} className="icon-button" aria-label="Clear Chat" title="Clear Chat">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="icon-button" aria-label="Close Chat">
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="ai-chat-messages">
            {history.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={`ai-message-wrapper ${msg.role}`}>
                  <div className="ai-avatar">
                    {msg.role === "model" ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="ai-message">
                    {msg.parts[0].text}
                    
                    {/* Render action button if present */}
                    {msg.action && (
                      <button 
                        className="btn btn-primary" 
                        style={{ marginTop: '10px', fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleAction(msg.action)}
                      >
                        {msg.action.label} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Render suggested questions for the latest bot message */}
                {msg.role === "model" && msg.suggestedQuestions && idx === history.length - 1 && !loading && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px 12px 16px', marginLeft: '32px' }}>
                    {msg.suggestedQuestions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSuggestionClick(q)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
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

          <form className="ai-chat-input" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <textarea 
              ref={inputRef}
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... (Shift+Enter for new line)" 
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary, #fff)',
                outline: 'none',
                resize: 'none',
                height: '40px',
                padding: '10px 0',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
            />
            <button type="submit" disabled={!message.trim() || loading} className="icon-button" style={{ alignSelf: 'flex-end', marginBottom: '8px' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
