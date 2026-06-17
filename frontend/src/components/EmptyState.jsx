import { Sparkles } from "lucide-react";

export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <span><Sparkles size={22} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
