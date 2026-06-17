import { Check, Plus, Save, UserRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: user.name || "", headline: user.headline || "", location: user.location || "", phone: user.phone || "",
    bio: user.bio || "", skills: (user.skills || []).join(", "), education: user.education || "", experience: user.experience || "", projects: user.projects || ""
  });
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const updated = await api("/profile", { method: "PUT", body: { ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) } });
      setUser(updated); localStorage.setItem("internshell_user", JSON.stringify(updated)); showToast("Profile saved");
    } catch (error) { showToast(error.message, "error"); } finally { setSaving(false); }
  };
  return <div className="profile-page page-enter"><div className="page-heading"><span className="eyebrow">{user.role === "employer" ? "Company identity" : "Your professional story"}</span><h1>Profile</h1><p>Give people enough context to understand where you can make a difference.</p></div><div className="profile-grid"><aside className="panel profile-summary-card"><div className="profile-avatar">{user.avatar}</div><h2>{form.name}</h2><p>{form.headline}</p><div className="completion-bar"><span style={{ width: `${user.profileCompletion}%` }} /></div><strong>{user.profileCompletion}% complete</strong><div className="profile-checks"><span><Check size={16} />Core information</span><span><Check size={16} />Skills and strengths</span><span className={form.projects ? "" : "muted"}><Check size={16} />Portfolio project</span></div></aside><form className="panel profile-form" onSubmit={submit}><div className="form-section"><div><span className="form-icon"><UserRound size={19} /></span><h2>About you</h2></div><div className="form-grid"><label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label><label className="full">Headline<input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></label><label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label>Email<input value={user.email} disabled /></label><label className="full">Short introduction<textarea rows="4" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What kind of problems do you enjoy solving?" /></label></div></div><div className="form-section"><h2>Skills and experience</h2><label>Skills <small>Separate with commas</small><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label><label>Education<textarea rows="3" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} /></label><label>Experience<textarea rows="4" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label><label>Featured project<textarea rows="4" value={form.projects} onChange={(e) => setForm({ ...form, projects: e.target.value })} placeholder="What did you make, why did it matter, and what changed?" /></label></div><button className="button primary" disabled={saving}><Save size={17} />{saving ? "Saving..." : "Save profile"}</button></form></div></div>;
}
