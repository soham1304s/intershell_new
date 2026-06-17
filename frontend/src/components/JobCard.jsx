import { Bookmark, BriefcaseBusiness, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function JobCard({ job, onSave, compact = false }) {
  return (
    <article className={`job-card ${compact ? "compact" : ""}`}>
      <div className="job-card-head">
        <div className="company-logo" style={{ "--company": job.companyColor }}>{job.companyLogo}</div>
        <button className={`icon-button ${job.saved ? "active" : ""}`} onClick={() => onSave?.(job)} aria-label="Save job">
          <Bookmark size={18} fill={job.saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div>
        <p className="eyebrow company-name">{job.company} {job.companyVerified && <ShieldCheck size={14} />}</p>
        <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
      </div>
      <div className="job-meta">
        <span><MapPin size={15} />{job.location}</span>
        <span><BriefcaseBusiness size={15} />{job.workplace}</span>
      </div>
      {!compact && <p className="job-description">{job.description}</p>}
      <div className="skill-list">
        {job.skills.slice(0, compact ? 2 : 4).map((skill) => <span key={skill}>{skill}</span>)}
      </div>
      <div className="job-card-foot">
        <div>
          <strong>{job.salary}</strong>
          <small>{job.type}</small>
        </div>
        <span className="match-pill">{job.match}% match</span>
      </div>
    </article>
  );
}
