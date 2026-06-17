import { ArrowRight, Check, Clock3, ExternalLink, FileText, MoreHorizontal, X, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { api, formatDate } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";

const stages = ["applied", "shortlisted", "interview", "offered", "accepted"];
const capitalize = (value) => value[0].toUpperCase() + value.slice(1);

export default function Applications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  const load = () => api("/applications").then(setItems);
  useEffect(() => {
    load();
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
      auth: { token: localStorage.getItem("internshell_token") }
    });
    
    socket.on("application_updated", (app) => setItems(curr => curr ? curr.map(i => i.id === app.id ? app : i) : curr));
    socket.on("application_deleted", ({ id }) => setItems(curr => curr ? curr.filter(i => i.id !== id) : curr));
    socket.on("new_application", (app) => setItems(curr => curr ? [app, ...curr] : curr));
    
    return () => socket.disconnect();
  }, []);
  if (!items) return <Loading />;
  const filtered = filter === "all" ? items : items.filter((item) => item.status === filter);

  if (user.role !== "intern") return <CandidatePipeline items={filtered} filter={filter} setFilter={setFilter} reload={load} showToast={showToast} />;
  const withdraw = async (id) => {
    if (!confirm("Withdraw this application?")) return;
    await api(`/applications/${id}`, { method: "DELETE" }); showToast("Application withdrawn"); load();
  };
  return (
    <div className="page-enter">
      <div className="page-heading split"><div><span className="eyebrow">Your journey</span><h1>Applications</h1><p>Every application, update, and next step in one place.</p></div><Link className="button primary" to="/jobs">Explore more roles <ArrowRight size={17} /></Link></div>
      <FilterTabs value={filter} setValue={setFilter} items={items} />
      {filtered.length ? <div className="application-cards">
        {filtered.map((application) => {
          const currentIndex = stages.indexOf(application.status);
          return <article className="application-card" key={application.id}>
            <div className="application-card-top"><div className="company-logo" style={{ "--company": application.job.companyColor }}>{application.job.companyLogo}</div><div><h2>{application.job.title}</h2><p>{application.job.company} · {application.job.location}</p></div><span className={`status-badge ${application.status}`}>{capitalize(application.status)}</span><button className="icon-button" onClick={() => withdraw(application.id)} title="Withdraw"><X size={17} /></button></div>
            <div className="application-progress">{stages.map((stage, index) => <div className={`${index <= currentIndex ? "complete" : ""} ${stage === application.status ? "current" : ""}`} key={stage}><span>{index < currentIndex ? <Check size={13} /> : index + 1}</span><small>{capitalize(stage)}</small></div>)}</div>
            <div className="application-card-foot"><span><Clock3 size={15} />Applied {formatDate(application.appliedAt)}</span><span><FileText size={15} />ATS score <strong>{application.atsScore}%</strong></span><Link to={`/jobs/${application.job.id}`}>View role <ExternalLink size={14} /></Link></div>
          </article>;
        })}
      </div> : <EmptyState title="Nothing in this stage" text="Your matching applications will appear here." />}
    </div>
  );
}

function FilterTabs({ value, setValue, items }) {
  const tabs = ["all", "applied", "shortlisted", "interview", "offered"];
  return <div className="filter-tabs">{tabs.map((tab) => <button className={value === tab ? "active" : ""} onClick={() => setValue(tab)} key={tab}>{capitalize(tab)} <span>{tab === "all" ? items.length : items.filter((item) => item.status === tab).length}</span></button>)}</div>;
}

function CandidatePipeline({ items, filter, setFilter, reload, showToast }) {
  const update = async (id, status) => {
    try { await api(`/applications/${id}/status`, { method: "PATCH", body: { status } }); showToast(`Candidate moved to ${status}`); reload(); }
    catch (error) { showToast(error.message, "error"); }
  };
  return <div className="page-enter"><div className="page-heading"><span className="eyebrow">Hiring pipeline</span><h1>Candidates</h1><p>Review relevant context and keep every candidate moving with clarity.</p></div><FilterTabs value={filter} setValue={setFilter} items={items} /><div className="panel data-table-wrap"><table className="data-table"><thead><tr><th>Candidate</th><th>Opportunity</th><th>Match</th><th>Current stage</th><th>Move to</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="table-person"><span className="avatar small">{item.applicant.avatar}</span><div><strong>{item.applicant.name}</strong><small>{item.applicant.headline}</small></div></div></td><td><strong>{item.job.title}</strong><small className="table-sub">{item.job.location}</small></td><td><span className="score-circle">{item.atsScore}</span></td><td><span className={`status-badge ${item.status}`}>{capitalize(item.status)}</span></td><td><select value={item.status} onChange={(e) => update(item.id, e.target.value)}>{["applied","shortlisted","interview","offered","accepted","rejected"].map((stage) => <option key={stage}>{stage}</option>)}</select></td><td><div style={{ display: "flex", gap: "0.5rem" }}><Link className="icon-button" to={`/messages?compose=${item.applicant.id}`} title="Message Candidate"><MessageSquareText size={17} /></Link><button className="icon-button"><MoreHorizontal size={17} /></button></div></td></tr>)}</tbody></table></div></div>;
}
