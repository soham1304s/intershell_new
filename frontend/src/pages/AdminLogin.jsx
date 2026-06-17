import { ArrowLeft, ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", role: "admin"
  });

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      if (user.role !== "admin") {
        logout();
        showToast("Unauthorized: Admin access required", "error");
      } else {
        showToast("Welcome to the Admin Portal");
        navigate("/admin");
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-page admin-theme">
      <div className="auth-brand-panel">
        <Link className="back-link" to="/"><ArrowLeft size={17} />Back home</Link>
        <div className="auth-brand-content">
          <Logo />
          <span className="section-kicker light-kicker"><Shield size={14} /> Secure Access</span>
          <h1>Admin Portal</h1>
          <p>Manage users, oversee operations, and monitor platform health.</p>
        </div>
        <div className="auth-shape shape-one admin-shape-one" /><div className="auth-shape shape-two admin-shape-two" />
      </div>
      <div className="auth-form-panel">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-mobile-logo"><Logo /></div>
          <span className="eyebrow">Restricted Area</span>
          <h2>Sign in to Admin Dashboard</h2>
          <p>Please enter your administrative credentials.</p>
          
          <label>Email address<input type="email" name="email" value={form.email} onChange={update} placeholder="admin@internshell.dev" required /></label>
          <label>Password<div className="password-field"><input type={visible ? "text" : "password"} name="password" value={form.password} onChange={update} placeholder="Enter your password" required /><button type="button" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          
          <button className="button primary full" disabled={loading}>{loading ? "Authenticating..." : "Access Dashboard"} <ArrowRight size={17} /></button>
          

        </form>
      </div>
    </div>
  );
}
