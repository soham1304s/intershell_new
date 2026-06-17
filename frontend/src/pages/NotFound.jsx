import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
export default function NotFound() { return <div className="not-found"><Logo/><span>404</span><h1>This path hasn’t been built yet.</h1><p>Let’s take you back to somewhere useful.</p><Link className="button primary" to="/"><ArrowLeft size={17}/>Back to Internshell</Link></div>; }
