import { Edit3, Eye, MoreHorizontal, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate } from "../lib/api.js";
import Loading from "../components/Loading.jsx";

export default function EmployerJobs() {
  const [data, setData] = useState(null);
  useEffect(() => { api("/dashboard").then(setData); }, []);
  if (!data) return <Loading />;
  return <div className="page-enter"><div className="page-heading split"><div><span className="eyebrow">Opportunity management</span><h1>Your jobs</h1><p>Keep every opening accurate, active, and easy to understand.</p></div><Link className="button primary" to="/employer/post-job"><Plus size={17} />Post a role</Link></div><div className="panel data-table-wrap"><table className="data-table"><thead><tr><th>Opportunity</th><th>Status</th><th>Applicants</th><th>Views</th><th>Posted</th><th /></tr></thead><tbody>{data.jobs.map((job) => <tr key={job.id}><td><div className="table-person"><span className="company-logo small" style={{ "--company": job.companyColor }}>{job.companyLogo}</span><div><strong>{job.title}</strong><small>{job.location} · {job.type}</small></div></div></td><td><span className={`status-badge ${job.status}`}>{job.status}</span></td><td><strong>{job.applicantCount}</strong></td><td>{job.views || 0}</td><td>{formatDate(job.createdAt)}</td><td><div className="table-actions"><Link className="icon-button" to={`/jobs/${job.id}`}><Eye size={17} /></Link><button className="icon-button"><Edit3 size={17} /></button><button className="icon-button"><MoreHorizontal size={17} /></button></div></td></tr>)}</tbody></table></div></div>;
}
