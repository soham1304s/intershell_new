import { Shell } from "lucide-react";
import { Link } from "react-router-dom";

export default function Logo({ compact = false }) {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark"><Shell size={20} /></span>
      {!compact && <span>Internshell</span>}
    </Link>
  );
}
