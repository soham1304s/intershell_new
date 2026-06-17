import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { GoogleLogin } from "@react-oauth/google";

export default function AuthPage({ mode }) {
  const loginMode = mode === "login";
  const { login, register, google } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "intern", company: ""
  });

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = loginMode ? await login(form) : await register(form);
      showToast(loginMode ? "Welcome back" : "Your workspace is ready");
      navigate(user.role === "admin" ? "/admin" : location.state?.from || "/dashboard");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    try {
      const user = await google(response.credential, form.role);
      showToast(loginMode ? "Welcome back" : "Your workspace is ready");
      navigate(user.role === "admin" ? "/admin" : location.state?.from || "/dashboard");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <Link className="back-link" to="/"><ArrowLeft size={17} />Back home</Link>
        <div className="auth-brand-content">
          <Logo />
          <span className="section-kicker light-kicker"><Sparkles size={14} /> A calmer way forward</span>
          <h1>{loginMode ? "Keep building your next chapter." : "Start with clarity. Grow with intention."}</h1>
          <p>Opportunities, practical career tools, and every next step in one thoughtful workspace.</p>
          <div className="auth-points">
            <span><Check size={16} />Personalized role matches</span>
            <span><Check size={16} />ATS and interview feedback</span>
            <span><Check size={16} />A clear application journey</span>
          </div>
        </div>
        <div className="auth-shape shape-one" /><div className="auth-shape shape-two" />
      </div>
      <div className="auth-form-panel">
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-mobile-logo"><Logo /></div>
          <span className="eyebrow">{loginMode ? "Welcome back" : "Create your account"}</span>
          <h2>{loginMode ? "Sign in to Internshell" : "What would you like to build?"}</h2>
          <p>{loginMode ? "Your opportunities and progress are waiting." : "You can change these details later."}</p>
          {!loginMode && (
            <div className="role-toggle">
              <button type="button" className={form.role === "intern" ? "active" : ""} onClick={() => setForm({ ...form, role: "intern" })}>Find opportunities</button>
              <button type="button" className={form.role === "employer" ? "active" : ""} onClick={() => setForm({ ...form, role: "employer" })}>Hire talent</button>
            </div>
          )}
          <div className="google-auth-wrapper" style={{ margin: "10px 0 20px 0" }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => showToast("Google authentication failed", "error")} width="100%" />
          </div>
          <div className="auth-divider"><span>or continue with email</span></div>
          {!loginMode && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" required /></label>}
          {!loginMode && form.role === "employer" && <label>Company<input name="company" value={form.company} onChange={update} placeholder="Company name" required /></label>}
          <label>Email address<input type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required /></label>
          <label>Password<div className="password-field"><input type={visible ? "text" : "password"} name="password" value={form.password} onChange={update} placeholder="At least 6 characters" required /><button type="button" onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <button className="button primary full" disabled={loading}>{loading ? "Just a moment..." : loginMode ? "Sign in" : "Create free account"} <ArrowRight size={17} /></button>

          <p className="auth-switch">{loginMode ? "New to Internshell?" : "Already have an account?"} <Link to={loginMode ? "/register" : "/login"}>{loginMode ? "Create an account" : "Sign in"}</Link></p>
        </form>
      </div>
    </div>
  );
}
