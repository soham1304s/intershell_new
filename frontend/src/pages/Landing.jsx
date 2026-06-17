import {
  ArrowRight, BarChart3, Bot, BriefcaseBusiness, Check, FileSearch, Menu, MessageSquareText,
  Search, ShieldCheck, Sparkles, Star, Target, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import JobCard from "../components/JobCard.jsx";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { api("/jobs/featured").then(setJobs).catch(() => {}); }, []);

  const submit = (event) => {
    event.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="landing">
      <nav className="public-nav container">
        <Logo />
        <div className={`public-links ${mobileOpen ? "open" : ""}`}>
          <a href="#opportunities" onClick={() => setMobileOpen(false)}>Opportunities</a>
          <a href="#tools" onClick={() => setMobileOpen(false)}>Career tools</a>
          <a href="#employers" onClick={() => setMobileOpen(false)}>For employers</a>
          <Link to="/pricing">Pricing</Link>
        </div>
        <div className="public-actions">
          {user ? <Link className="button primary small" to="/dashboard">Dashboard <ArrowRight size={16} /></Link> : (
            <>
              <Link className="text-link" to="/login">Sign in</Link>
              <Link className="button primary small" to="/register">Get started</Link>
            </>
          )}
          <button className="mobile-nav-toggle icon-button" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </nav>

      <header className="hero container">
        <div className="hero-copy reveal">
          <div className="announcement"><Sparkles size={15} /> Your career deserves more than a job board</div>
          <h1>Find work that helps you <em>become.</em></h1>
          <p>Discover meaningful opportunities, understand where you stand, and build the confidence to take your next step.</p>
          <form className="hero-search" onSubmit={submit}>
            <Search size={20} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Role, skill, or company" />
            <button className="button primary">Explore roles <ArrowRight size={17} /></button>
          </form>
          <div className="trust-row">
            <div className="avatar-stack"><span>NK</span><span>AR</span><span>MS</span><span>+</span></div>
            <p><strong>12,000+</strong> students building their next chapter</p>
          </div>
        </div>
        <div className="hero-visual reveal delay-1">
          <div className="hero-glow" />
          <div className="floating-note note-top"><Target size={16} /><span><strong>96% match</strong> for your skills</span></div>
          <div className="hero-job-card">
            <div className="hero-company"><span>NL</span><div><small>Northstar Labs</small><strong>Frontend Developer Intern</strong></div></div>
            <div className="hero-job-meta"><span>Remote</span><span>₹25k–35k</span><span>3 months</span></div>
            <div className="hero-skills"><span>React</span><span>JavaScript</span><span>Design systems</span></div>
            <div className="match-line"><span style={{ width: "96%" }} /></div>
            <button className="button primary full">View opportunity</button>
          </div>
          <div className="floating-note note-bottom"><Check size={16} /><span>Application moved to <strong>Shortlisted</strong></span></div>
          <span className="orbit-dot one" /><span className="orbit-dot two" />
        </div>
      </header>

      <section className="logo-strip">
        <div className="container">
          <p>Thoughtful teams hiring on Internshell</p>
          <div><strong>northstar</strong><strong>FINORA</strong><strong>pixelmint</strong><strong>CloudKite</strong><strong>GREENGRID</strong></div>
        </div>
      </section>

      <section className="section container" id="opportunities">
        <div className="section-heading split">
          <div><span className="section-kicker">Fresh opportunities</span><h2>Work worth showing up for.</h2></div>
          <Link to="/jobs" className="arrow-link">Browse all roles <ArrowRight size={17} /></Link>
        </div>
        <div className="jobs-grid">
          {jobs.slice(0, 6).map((job) => <JobCard job={job} key={job.id} />)}
        </div>
      </section>

      <section className="feature-section" id="tools">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-kicker">Built around your growth</span>
            <h2>Clarity at every step.</h2>
            <p>Practical tools that turn uncertainty into focused, confident action.</p>
          </div>
          <div className="feature-grid">
            {[
              [FileSearch, "Know your resume", "See how recruiters and ATS systems read your resume, then improve the details that matter.", "Check your ATS score"],
              [Bot, "Practice with purpose", "Prepare for real interviews with role-specific questions and constructive, instant feedback.", "Start a practice round"],
              [Target, "Find your direction", "Map a realistic next step based on your skills, interests, and the kind of work you want.", "Build your roadmap"],
              [BarChart3, "Track real momentum", "See every application, interview, and learning milestone in one calm workspace.", "Open your dashboard"]
            ].map(([Icon, title, text, link], index) => (
              <article className={`feature-card feature-${index + 1}`} key={title}>
                <span className="feature-icon"><Icon size={22} /></span>
                <h3>{title}</h3><p>{text}</p><Link to="/register">{link} <ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="employer-section container" id="employers">
        <div className="employer-panel">
          <div className="employer-copy">
            <span className="section-kicker">For hiring teams</span>
            <h2>Meet people, not piles of resumes.</h2>
            <p>Share the real story behind the role, discover candidates with relevant potential, and move together through a clear hiring process.</p>
            <ul>
              <li><ShieldCheck size={18} />Verified candidate profiles</li>
              <li><Sparkles size={18} />Thoughtful match recommendations</li>
              <li><MessageSquareText size={18} />Direct, human communication</li>
            </ul>
            <Link className="button dark" to="/register">Start hiring <ArrowRight size={17} /></Link>
          </div>
          <div className="candidate-stack">
            {[
              ["AN", "Ananya Nair", "Product designer", "94%"],
              ["RV", "Rohan Verma", "Frontend engineer", "91%"],
              ["SK", "Sara Khan", "Data analyst", "87%"]
            ].map(([initials, name, role, score], index) => (
              <div className="candidate-card" style={{ "--i": index }} key={name}>
                <span>{initials}</span><div><strong>{name}</strong><small>{role}</small></div><em>{score}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="container testimonial">
          <div className="quote-mark">“</div>
          <blockquote>Internshell helped me stop applying everywhere and start applying with intention. I understood what was missing, rebuilt my story, and found a team where I could genuinely grow.</blockquote>
          <div className="quote-person"><span>DM</span><div><strong>Dev Malhotra</strong><small>Product intern at Finora</small></div><div className="stars">{[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="currentColor" />)}</div></div>
        </div>
      </section>

      <section className="cta-section container">
        <div>
          <span className="cta-orb" />
          <h2>Your next chapter can start today.</h2>
          <p>Join thousands of students and early-career professionals moving forward with clarity.</p>
          <Link className="button light" to="/register">Create your free account <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div><Logo /><p>Meaningful work. Clearer paths. Better beginnings.</p></div>
          <div><strong>Explore</strong><Link to="/jobs">Opportunities</Link><Link to="/pricing">Plans</Link><a href="#tools">Career tools</a></div>
          <div><strong>Company</strong><a href="#employers">For employers</a><a href="#">About us</a><a href="#">Contact</a></div>
          <div><strong>Stay curious</strong><p>A short monthly note on careers, craft, and finding work that fits.</p><div className="newsletter"><input placeholder="Your email" /><button><ArrowRight size={17} /></button></div></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 Internshell</span><div><a href="#">Privacy</a><a href="#">Terms</a></div></div>
      </footer>
    </div>
  );
}
