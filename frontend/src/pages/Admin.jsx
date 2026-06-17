import { BriefcaseBusiness, CreditCard, IndianRupee, Search, ShieldCheck, TrendingUp, Users, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { api, formatDate } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import Loading from "../components/Loading.jsx";

export default function Admin({ section }) {
  const [data, setData] = useState(null);
  const loadData = () => api("/admin/overview").then(setData);
  useEffect(() => { 
    loadData();
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
      auth: { token: localStorage.getItem("internshell_token") }
    });
    
    socket.on("application_updated", (app) => {
      setData(curr => curr ? { ...curr, applications: curr.applications.map(i => i.id === app.id ? app : i) } : curr);
    });
    
    socket.on("application_deleted", ({ id }) => {
      setData(curr => curr ? { ...curr, applications: curr.applications.filter(i => i.id !== id) } : curr);
    });
    
    socket.on("new_application", (app) => {
      setData(curr => curr ? { ...curr, applications: [app, ...curr.applications] } : curr);
    });
    
    socket.on("new_interview", (interview) => {
      setData(curr => curr ? { ...curr, interviews: [interview, ...curr.interviews] } : curr);
    });
    
    socket.on("interview_updated", (interview) => {
      setData(curr => curr ? { ...curr, interviews: curr.interviews.map(i => i.id === interview.id ? interview : i) } : curr);
    });
    
    return () => socket.disconnect();
  }, []);
  if (!data) return <Loading label="Loading platform operations" />;
  const titles = { overview: ["Platform overview", "A clear view of growth, quality, and activity."], users: ["Users", "Manage access, roles, and account health."], jobs: ["Job moderation", "Keep every public opportunity accurate and trustworthy."], applications: ["Applications", "Review movement across the complete hiring funnel."], interviews: ["AI Interviews", "Monitor candidate practice sessions in real-time."], payments: ["Payments", "Subscription activity and platform revenue."] };
  return <div className="page-enter"><div className="page-heading"><span className="eyebrow">Internshell operations</span><h1>{titles[section][0]}</h1><p>{titles[section][1]}</p></div>{section === "overview" && <Overview data={data} />}{section === "users" && <UsersTable data={data} />}{section === "jobs" && <JobsTable data={data} />}{section === "applications" && <ApplicationsTable data={data} reload={loadData} />}{section === "interviews" && <InterviewsTable data={data} />}{section === "payments" && <PaymentsTable data={data} />}</div>;
}
function Overview({ data }) { const cards = [["Users",data.metrics.users,Users,"violet"],["Active jobs",data.metrics.activeJobs,BriefcaseBusiness,"teal"],["Applications",data.metrics.applications,TrendingUp,"amber"],["Revenue",`₹${data.metrics.revenue}`,IndianRupee,"blue"]]; return <><div className="stats-grid">{cards.map(([l,v,I,t]) => <article className="stat-card" key={l}><span className={`stat-icon ${t}`}><I size={20}/></span><div><strong>{v}</strong><span>{l}</span></div></article>)}</div><div className="dashboard-grid"><section className="panel admin-chart"><div className="panel-heading"><div><span className="eyebrow">Last 8 weeks</span><h2>Platform activity</h2></div></div><div className="bar-chart">{[38,52,44,68,62,79,74,92].map((v,i)=><div key={i}><span style={{height:`${v}%`}}/><small>W{i+1}</small></div>)}</div></section><aside className="panel platform-health"><ShieldCheck size={28}/><h2>Platform health</h2><p>All core systems are operating normally.</p><div><span>API availability <strong>99.98%</strong></span><span>Average response <strong>124 ms</strong></span><span>Moderation queue <strong>3 items</strong></span></div></aside></div></>; }
function UsersTable({ data }) { return <TableSearch><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Plan</th><th>Verified</th><th>Joined</th></tr></thead><tbody>{data.users.map(u=><tr key={u.id}><td><div className="table-person"><span className="avatar small">{u.avatar}</span><div><strong>{u.name}</strong><small>{u.email}</small></div></div></td><td><span className="role-badge">{u.role}</span></td><td>{u.subscription?.plan || "free"}</td><td>{u.isEmailVerified?"Yes":"No"}</td><td>{formatDate(u.createdAt)}</td></tr>)}</tbody></table></TableSearch>; }
function JobsTable({ data }) { return <TableSearch actions={<Link className="button primary" to="/admin/post-job" style={{ marginRight: '10px' }}><Plus size={16} />Post a role</Link>}><table className="data-table"><thead><tr><th>Job</th><th>Company</th><th>Status</th><th>Applicants</th><th>Posted</th></tr></thead><tbody>{data.jobs.map(j=><tr key={j.id}><td><strong>{j.title}</strong></td><td>{j.company}</td><td><span className={`status-badge ${j.status}`}>{j.status}</span></td><td>{j.applicantCount}</td><td>{formatDate(j.createdAt)}</td></tr>)}</tbody></table></TableSearch>; }
function ApplicationsTable({ data, reload }) {
  const { showToast } = useToast();
  const updateStatus = async (id, status) => {
    try { await api(`/applications/${id}/status`, { method: "PATCH", body: { status } }); showToast(`Application moved to ${status}`); reload(); }
    catch (error) { showToast(error.message, "error"); }
  };
  const withdraw = async (id) => {
    if (!confirm("Are you sure you want to withdraw/delete this application?")) return;
    try { await api(`/applications/${id}`, { method: "DELETE" }); showToast("Application withdrawn"); reload(); }
    catch (error) { showToast(error.message, "error"); }
  };
  return <TableSearch><table className="data-table"><thead><tr><th>Candidate</th><th>Role</th><th>ATS</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{data.applications.map(a=><tr key={a.id}><td>{a.applicant?.name}</td><td>{a.job?.title}</td><td>{a.atsScore}%</td><td><select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>{["applied","shortlisted","interview","offered","accepted","rejected"].map((stage) => <option key={stage}>{stage}</option>)}</select></td><td>{formatDate(a.appliedAt)}</td><td><button className="icon-button" onClick={() => withdraw(a.id)} title="Delete Application"><Trash2 size={17} /></button></td></tr>)}</tbody></table></TableSearch>; 
}
function PaymentsTable({ data }) { return <TableSearch>{data.payments.length?<table className="data-table"><thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Status</th><th>Transaction ID</th><th>Date</th></tr></thead><tbody>{data.payments.map(p=><tr key={p.id}><td>{data.users.find(u=>u.id===p.userId)?.email}</td><td>{p.plan}</td><td>₹{p.amount}</td><td><span className="status-badge active">{p.status}</span></td><td style={{ fontFamily: "monospace", fontSize: "0.85em" }}>{p.transactionId || "demo_tx"}</td><td>{formatDate(p.createdAt)}</td></tr>)}</tbody></table>:<div className="empty-state"><CreditCard/><h3>No transactions yet</h3><p>Subscription payments will appear here.</p></div>}</TableSearch>; }
function TableSearch({ children, actions }) { return <div className="panel data-table-wrap"><div className="table-toolbar"><div><Search size={16}/><input placeholder="Search records"/></div><div style={{ display: "flex" }}>{actions}<button className="button outline">Export CSV</button></div></div>{children}</div>; }

function InterviewsTable({ data }) {
  return <TableSearch>
    {data.interviews && data.interviews.length ? (
      <table className="data-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Target Role</th>
            <th>Type</th>
            <th>Progress</th>
            <th>Avg Score</th>
            <th>Started</th>
          </tr>
        </thead>
        <tbody>
          {data.interviews.map(i => {
            const numQuestions = i.questions ? i.questions.length : 0;
            const numAnswers = i.answers ? i.answers.length : 0;
            const avgScore = numAnswers > 0 ? Math.round(i.answers.reduce((acc, curr) => acc + (curr.score || 0), 0) / numAnswers) : "-";
            return (
              <tr key={i.id}>
                <td>{i.userId?.name || "Unknown"}</td>
                <td>{i.role}</td>
                <td><span className="role-badge" style={{textTransform: "capitalize"}}>{i.type}</span></td>
                <td>{numAnswers} / {numQuestions}</td>
                <td><strong>{avgScore}</strong></td>
                <td>{formatDate(i.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <div className="empty-state">
        <Bot />
        <h3>No practice interviews</h3>
        <p>Candidates haven't started any AI interviews yet.</p>
      </div>
    )}
  </TableSearch>;
}
