import { ArrowRight, CheckCircle2, FileSearch, Lightbulb, RotateCcw, Sparkles, Target, UploadCloud, XCircle } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";

const sampleResume = `SUMMARY
Frontend developer focused on accessible, responsive web products.
SKILLS
React, JavaScript, CSS, Git, REST APIs, Figma, Node.js
EXPERIENCE
Built a reusable React component library that reduced delivery time by 30%.
Improved page performance and accessibility across three customer workflows.
PROJECTS
Designed and shipped a job discovery platform with search and saved roles.
EDUCATION
Bachelor of Technology in Computer Science`;

export default function ATSChecker() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ targetRole: "Frontend Developer Intern", resumeText: sampleResume, jobDescription: "We are looking for a React developer with JavaScript, CSS, Git, accessibility, testing, teamwork, and REST API experience." });
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const analyze = async (event) => {
    event.preventDefault(); setLoading(true);
    try { setReport(await api("/ats/check", { method: "POST", body: form })); showToast("Your ATS report is ready"); }
    catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };
  return (
    <div className="page-enter">
      <div className="page-heading"><span className="eyebrow">Resume intelligence</span><h1>See what the system sees.</h1><p>Compare your resume with a real role and turn hidden gaps into clear edits.</p></div>
      {!report ? <div className="tool-grid">
        <form className="panel tool-form" onSubmit={analyze}>
          <label>Target role<input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })} /></label>
          <label>Your resume text<textarea rows="12" value={form.resumeText} onChange={(e) => setForm({ ...form, resumeText: e.target.value })} /></label>
          <label>Job description<textarea rows="9" value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} /></label>
          <button className="button primary full" disabled={loading}>{loading ? "Reading the details..." : "Analyze my resume"} <Sparkles size={17} /></button>
        </form>
        <aside className="panel tool-aside"><span className="feature-icon"><FileSearch size={24} /></span><h2>What we review</h2><ul><li><Target size={17} />Role-specific keywords</li><li><UploadCloud size={17} />ATS-friendly structure</li><li><CheckCircle2 size={17} />Section completeness</li><li><Lightbulb size={17} />High-impact improvements</li></ul><div className="privacy-note">Your text is used only to generate this report in your local workspace.</div></aside>
      </div> : <ATSReport report={report} form={form} reset={() => setReport(null)} />}
    </div>
  );
}

function ATSReport({ report, form, reset }) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvedDraft, setImprovedDraft] = useState(null);

  const matchedKeywords = report.matchedKeywords || [];
  const missingKeywords = report.missingKeywords || [];
  const suggestions = report.suggestions || [];
  const structureScore = report.structureScore || report.score || 0;
  const keywordScore = report.keywordScore || report.score || 0;
  
  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const response = await api("/ats/improve", {
        method: "POST",
        body: {
          resumeText: form?.resumeText,
          targetRole: form?.targetRole,
          jobDescription: form?.jobDescription,
          missingKeywords
        }
      });
      setImprovedDraft(response.improvedResume);
      showToast("Draft generated successfully", "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(improvedDraft);
    showToast("Copied to clipboard", "success");
  };
  
  return <div className="ats-report">
    <section className="panel score-hero"><div className="score-gauge" style={{ "--score": `${report.score * 3.6}deg` }}><div><strong>{report.score}</strong><small>out of 100</small></div></div><div><span className="eyebrow">Overall compatibility</span><h2>{report.score >= 80 ? "Strong foundation" : report.score >= 60 ? "Good, with clear room to improve" : "A focused rewrite will help"}</h2><p>Your structure scores {structureScore}% and your keyword alignment is {keywordScore}%.</p><button className="button outline" onClick={reset}><RotateCcw size={16} />Check another resume</button></div></section>
    <div className="report-grid">
      <section className="panel"><div className="panel-heading"><h2>Keyword alignment</h2></div><h3 className="report-subtitle good"><CheckCircle2 size={18} />Matched</h3><div className="skill-list">{matchedKeywords.length ? matchedKeywords.map((word) => <span key={word}>{word}</span>) : <p>No exact matches detected yet.</p>}</div><h3 className="report-subtitle missing"><XCircle size={18} />Worth adding naturally</h3><div className="skill-list missing">{missingKeywords.map((word) => <span key={word}>{word}</span>)}</div></section>
      <section className="panel">
        <div className="panel-heading"><h2>Focused improvements</h2></div>
        {!improvedDraft ? (
          <>
            <ol className="suggestion-list">{suggestions.map((tip, index) => <li key={tip}><span>{index + 1}</span><p>{tip}</p></li>)}</ol>
            <button className="button primary full" onClick={generateDraft} disabled={isGenerating}>
              {isGenerating ? "Rewriting with AI..." : "Create an improved draft"} <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <div className="improved-draft-container">
            <textarea className="draft-textarea" rows="14" readOnly value={improvedDraft} />
            <button className="button primary full" onClick={copyToClipboard}>Copy draft to clipboard</button>
          </div>
        )}
      </section>
    </div>
  </div>;
}
