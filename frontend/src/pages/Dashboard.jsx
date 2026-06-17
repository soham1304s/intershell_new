import {
  ArrowRight, Bookmark, BriefcaseBusiness, CalendarClock, CircleCheck, Eye, FileText,
  Plus, Sparkles, TrendingUp, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";
import { api, timeAgo } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import Loading from "../components/Loading.jsx";
import JobCard from "../components/JobCard.jsx";

const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const { showToast } = useToast();

  useEffect(() => { api("/dashboard").then(setData); }, []);

  useEffect(() => {
    if (user.role !== "intern") return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
      auth: { token: localStorage.getItem("internshell_token") }
    });
    socket.on("new_job", (job) => {
      showToast("A new opportunity was just posted: " + job.title, "success");
      setData(current => current ? {
        ...current,
        recommendations: [job, ...current.recommendations].slice(0, 4)
      } : current);
    });
    return () => socket.disconnect();
  }, [user.role, showToast]);

  if (!data) return <Loading />;
  if (user.role === "admin") return <AdminSummary data={data} />;
  if (user.role === "employer") return <EmployerDashboard data={data} user={user} />;
  return <InternDashboard data={data} user={user} />;
}

function InternDashboard({ data, user }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const cards = [
    ["Applications", data.stats.applications, BriefcaseBusiness, "violet"],
    ["Interviews", data.stats.interviews, CalendarClock, "teal"],
    ["Saved roles", data.stats.savedJobs, Bookmark, "amber"],
    ["Profile views", data.stats.profileViews, Eye, "blue"]
  ];
  return (
    <div className="dashboard-page page-enter">
      <div className="welcome-row">
        <div><span className="eyebrow">{greeting}</span><h1>{user.name.split(" ")[0]}, let’s keep moving.</h1><p>A few focused steps today can create real momentum.</p></div>
        <Link className="button primary" to="/jobs">Find opportunities <ArrowRight size={17} /></Link>
      </div>
      <div className="stats-grid">
        {cards.map(([label, value, Icon, tone]) => (
          <article className="stat-card" key={label}><span className={`stat-icon ${tone}`}><Icon size={20} /></span><div><strong>{value}</strong><span>{label}</span></div><TrendingUp size={16} className="trend" /></article>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel recommendations-panel">
          <div className="panel-heading"><div><span className="eyebrow">Chosen for you</span><h2>Strong matches</h2></div><Link to="/jobs">See all <ArrowRight size={15} /></Link></div>
          <div className="mini-job-list">
            {data.recommendations.map((job) => <JobCard key={job.id} job={job} compact />)}
          </div>
        </section>
        <aside className="panel progress-panel">
          <div className="panel-heading"><div><span className="eyebrow">Your profile</span><h2>{user.profileCompletion}% complete</h2></div></div>
          <div className="progress-ring" style={{ "--progress": `${user.profileCompletion * 3.6}deg` }}><span>{user.profileCompletion}%</span></div>
          <p>A complete profile helps thoughtful teams understand your potential.</p>
          <div className="progress-tasks">
            <span className="done"><CircleCheck size={17} />Core details</span>
            <span><CircleCheck size={17} />Add one project</span>
            <span><CircleCheck size={17} />Set job preferences</span>
          </div>
          <Link className="button soft full" to="/profile">Finish your profile</Link>
        </aside>
      </div>
      <div className="dashboard-grid lower">
        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">In motion</span><h2>Applications</h2></div><Link to="/applications">View all</Link></div>
          <div className="application-list">
            {data.applications.map((application) => (
              <div className="application-row" key={application.id}>
                <span className="company-logo" style={{ "--company": application.job.companyColor }}>{application.job.companyLogo}</span>
                <div><strong>{application.job.title}</strong><small>{application.job.company} · Applied {timeAgo(application.appliedAt)}</small></div>
                <span className={`status-badge ${application.status}`}>{statusLabel(application.status)}</span>
              </div>
            ))}
          </div>
        </section>
        <aside className="panel activity-panel">
          <div className="panel-heading"><div><span className="eyebrow">Latest</span><h2>Activity</h2></div></div>
          {data.activity.map((item) => <div className="activity-item" key={item.id}><span className={`activity-dot ${item.type}`} /><div><strong>{item.title}</strong><p>{item.message}</p><small>{timeAgo(item.createdAt)}</small></div></div>)}
        </aside>
      </div>
      <section className="insight-banner">
        <span><Sparkles size={21} /></span>
        <div><strong>Your resume is close to ready.</strong><p>Three focused edits could improve your average role match by around 12%.</p></div>
        <Link to="/ats">Review with ATS checker <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}

function EmployerDashboard({ data, user }) {
  const cards = [
    ["Active jobs", data.stats.activeJobs, BriefcaseBusiness, "violet"],
    ["Total applicants", data.stats.applicants, Users, "teal"],
    ["Shortlisted", data.stats.shortlisted, CircleCheck, "amber"],
    ["Interviews", data.stats.interviews, CalendarClock, "blue"]
  ];
  return (
    <div className="dashboard-page page-enter">
      <div className="welcome-row">
        <div><span className="eyebrow">Hiring workspace</span><h1>Good to see you, {user.name.split(" ")[0]}.</h1><p>Here’s how your open roles and candidates are moving.</p></div>
        <Link className="button primary" to="/employer/post-job"><Plus size={17} />Post a role</Link>
      </div>
      <div className="stats-grid">{cards.map(([label, value, Icon, tone]) => <article className="stat-card" key={label}><span className={`stat-icon ${tone}`}><Icon size={20} /></span><div><strong>{value}</strong><span>{label}</span></div></article>)}</div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading"><div><span className="eyebrow">Current openings</span><h2>Your jobs</h2></div><Link to="/employer/jobs">Manage all</Link></div>
          <div className="employer-job-list">
            {data.jobs.map((job) => <div className="employer-job-row" key={job.id}><span className="company-logo" style={{ "--company": job.companyColor }}>{job.companyLogo}</span><div><strong>{job.title}</strong><small>{job.location} · {job.type}</small></div><div className="job-row-stat"><strong>{job.applicantCount}</strong><small>Applicants</small></div><span className={`status-badge ${job.status}`}>{job.status}</span></div>)}
          </div>
        </section>
        <aside className="panel hiring-tip"><span className="feature-icon"><Sparkles size={22} /></span><span className="eyebrow">Hiring insight</span><h2>Clarity attracts stronger candidates.</h2><p>Roles with a clear first-90-days section receive 24% more relevant applications.</p><Link to="/employer/jobs">Improve job posts <ArrowRight size={16} /></Link></aside>
      </div>
      <section className="panel">
        <div className="panel-heading"><div><span className="eyebrow">Recent candidates</span><h2>Application pipeline</h2></div><Link to="/applications">Open pipeline</Link></div>
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Candidate</th><th>Role</th><th>ATS score</th><th>Status</th><th>Applied</th></tr></thead><tbody>
          {data.applications.map((item) => <tr key={item.id}><td><div className="table-person"><span className="avatar small">{item.applicant.avatar}</span><div><strong>{item.applicant.name}</strong><small>{item.applicant.headline}</small></div></div></td><td>{item.job.title}</td><td><strong>{item.atsScore}%</strong></td><td><span className={`status-badge ${item.status}`}>{statusLabel(item.status)}</span></td><td>{timeAgo(item.appliedAt)}</td></tr>)}
        </tbody></table></div>
      </section>
    </div>
  );
}

function AdminSummary({ data }) {
  return <div><h1>Platform overview</h1><p>{data.stats.users} users and {data.stats.jobs} roles are active across Internshell.</p></div>;
}
