import {
  Bell, BookOpenCheck, Bot, BriefcaseBusiness, ChevronDown, CreditCard, FileSearch,
  LayoutDashboard, LogOut, Menu, MessageSquareText, Plus, Search, Settings, UserRound, Users, X, Cpu
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "./Logo.jsx";
import AIAssistant from "./AIAssistant.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

const internLinks = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/jobs", "Find opportunities", Search],
  ["/applications", "My applications", BriefcaseBusiness],
  ["/ats", "ATS checker", FileSearch],
  ["/interview", "AI interview", Bot],
  ["/career", "Career roadmap", BookOpenCheck],
  ["/messages", "Messages", MessageSquareText],
  ["/pricing", "Plans", CreditCard],
  ["/profile", "My profile", UserRound]
];

const employerLinks = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/employer/jobs", "My jobs", BriefcaseBusiness],
  ["/employer/post-job", "Post a job", Plus],
  ["/applications", "Candidates", Users],
  ["/client/services", "Command Center", Cpu],
  ["/messages", "Messages", MessageSquareText],
  ["/profile", "Company profile", Settings]
];

const adminLinks = [
  ["/admin", "Platform overview", LayoutDashboard],
  ["/admin/users", "Users", Users],
  ["/admin/jobs", "Jobs", BriefcaseBusiness],
  ["/admin/applications", "Applications", FileSearch],
  ["/admin/interviews", "AI Interviews", Bot],
  ["/admin/payments", "Payments", CreditCard]
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const links = user.role === "admin" ? adminLinks : user.role === "employer" ? employerLinks : internLinks;

  useEffect(() => {
    api("/notifications").then(setNotifications).catch(() => {});
  }, []);

  const signOut = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="mobile-close icon-button" onClick={() => setMenuOpen(false)}><X size={19} /></button>
        </div>
        <nav className="sidebar-nav">
          <p className="nav-label">{user.role === "admin" ? "Administration" : "Workspace"}</p>
          {links.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="plan-mini">
            <span className="plan-orbit" />
            <div><small>Current plan</small><strong>{user.plan}</strong></div>
            <NavLink to="/pricing">View</NavLink>
          </div>
          <button className="sidebar-logout" onClick={signOut}><LogOut size={17} />Sign out</button>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}
      <div className="app-main">
        <header className="app-header">
          <button className="menu-button icon-button" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div className="header-search">
            <Search size={17} />
            <input placeholder="Search jobs, people, or skills" onKeyDown={(event) => {
              if (event.key === "Enter") navigate(`/jobs?search=${encodeURIComponent(event.currentTarget.value)}`);
            }} />
            <kbd>⌘ K</kbd>
          </div>
          <div className="header-actions">
            <NavLink to="/notifications" className="icon-button notification-button">
              <Bell size={19} />
              {notifications.some((item) => !item.read) && <span />}
            </NavLink>
            <div className="profile-menu">
              <button onClick={() => setProfileOpen(!profileOpen)}>
                <span className="avatar">{user.avatar}</span>
                <span className="profile-summary"><strong>{user.name}</strong><small>{user.role}</small></span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <NavLink to="/profile" onClick={() => setProfileOpen(false)}><UserRound size={16} />Profile</NavLink>
                  <button onClick={signOut}><LogOut size={16} />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="page-wrap"><Outlet /></main>
      </div>
      <AIAssistant />
    </div>
  );
}
