import { ArrowLeft, Bookmark, BriefcaseBusiness, CalendarDays, Check, Clock3, MapPin, Send, Share2, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatDate } from "../lib/api.js";
import Loading from "../components/Loading.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { api(`/jobs/${id}`).then(setJob).catch(() => navigate("/jobs")); }, [id]);
  if (!job) return <Loading label="Opening opportunity" />;
  const save = async () => {
    const result = await api(`/jobs/${job.id}/save`, { method: "POST" });
    setJob({ ...job, saved: result.saved });
    showToast(result.saved ? "Saved for later" : "Removed from saved jobs");
  };
  const apply = async (event) => {
    event.preventDefault(); setSubmitting(true);
    try {
      await api("/applications", { method: "POST", body: { jobId: job.id, coverLetter } });
      showToast("Application submitted");
      navigate("/applications");
    } catch (error) { showToast(error.message, "error"); } finally { setSubmitting(false); }
  };
  return (
    <div className="job-detail-page page-enter">
      <Link to="/jobs" className="back-link muted"><ArrowLeft size={17} />Back to opportunities</Link>
      <div className="job-detail-grid">
        <article className="job-detail-main">
          <div className="job-title-block">
            <div className="company-logo large" style={{ "--company": job.companyColor }}>{job.companyLogo}</div>
            <div><p className="eyebrow company-name">{job.company} <ShieldCheck size={14} /></p><h1>{job.title}</h1><div className="job-meta"><span><MapPin size={16} />{job.location}</span><span><BriefcaseBusiness size={16} />{job.workplace}</span><span><Clock3 size={16} />{job.type}</span></div></div>
          </div>
          <div className="match-card"><div><strong>{job.match}%</strong><span>Profile match</span></div><div className="match-line"><span style={{ width: `${job.match}%` }} /></div><p>Your React and interface design experience align especially well.</p></div>
          <section><h2>About the opportunity</h2><p>{job.description}</p></section>
          <section><h2>What you’ll do</h2><ul className="detail-list">{job.responsibilities.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></section>
          <section><h2>What will help you thrive</h2><ul className="detail-list">{job.requirements.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></section>
          <section><h2>Skills</h2><div className="skill-list large">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
          <section><h2>What’s included</h2><div className="benefit-grid">{job.benefits.map((benefit) => <span key={benefit}><Check size={16} />{benefit}</span>)}</div></section>
          <section className="company-about"><div className="company-logo" style={{ "--company": job.companyColor }}>{job.companyLogo}</div><div><h2>About {job.company}</h2><p>{job.companyAbout}</p></div></section>
        </article>
        <aside className="job-apply-card">
          <div><small>Compensation</small><strong>{job.salary}</strong></div>
          <dl><div><dt><CalendarDays size={16} />Apply by</dt><dd>{formatDate(job.deadline, { year: "numeric" })}</dd></div><div><dt><Users size={16} />Openings</dt><dd>{job.openings}</dd></div><div><dt><BriefcaseBusiness size={16} />Experience</dt><dd>{job.experience}</dd></div></dl>
          {user.role === "intern" ? <button className="button primary full" onClick={() => setApplyOpen(true)}>Apply now <Send size={16} /></button> : <button className="button soft full" disabled>Intern accounts can apply</button>}
          <button className={`button outline full ${job.saved ? "saved" : ""}`} onClick={save}><Bookmark size={17} fill={job.saved ? "currentColor" : "none"} />{job.saved ? "Saved" : "Save for later"}</button>
          <button className="share-button" onClick={() => { navigator.clipboard?.writeText(location.href); showToast("Job link copied"); }}><Share2 size={16} />Share opportunity</button>
          <p><ShieldCheck size={15} />Verified employer · Posted directly</p>
        </aside>
      </div>
      {applyOpen && <div className="modal-backdrop" onMouseDown={() => setApplyOpen(false)}><form className="modal" onSubmit={apply} onMouseDown={(e) => e.stopPropagation()}><span className="eyebrow">One thoughtful step</span><h2>Apply to {job.company}</h2><p>Your profile will be shared with the hiring team. Add a short note about why this work interests you.</p><label>Cover note<textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows="7" placeholder="What draws you to this role, and what would you bring?" required /></label><div className="modal-actions"><button type="button" className="button outline" onClick={() => setApplyOpen(false)}>Cancel</button><button className="button primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit application"} <Send size={16} /></button></div></form></div>}
    </div>
  );
}
