import { ArrowRight, Bot, CheckCircle2, MessageSquareQuote, Mic, RotateCcw, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Interview() {
  const { showToast } = useToast();
  const [setup, setSetup] = useState({ role: "Frontend Developer", type: "behavioral" });
  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState([]);
  const start = async () => { try { setSession(await api("/interview/start", { method: "POST", body: setup })); } catch (e) { showToast(e.message, "error"); } };
  const submit = async () => {
    if (!answer.trim()) return;
    const result = await api(`/interview/${session.id}/answer`, { method: "POST", body: { questionIndex: index, answer } });
    setFeedback([...feedback, result.answer]);
    setAnswer("");
    if (index < session.questions.length - 1) setIndex(index + 1);
    showToast("Answer reviewed");
  };
  if (!session) return <div className="page-enter"><div className="page-heading"><span className="eyebrow">AI practice room</span><h1>Practice until it feels like you.</h1><p>Thoughtful questions, private rehearsal, and feedback you can actually use.</p></div><div className="tool-grid"><section className="panel interview-setup"><span className="feature-icon"><Bot size={24} /></span><h2>Shape your practice round</h2><label>Role<input value={setup.role} onChange={(e) => setSetup({ ...setup, role: e.target.value })} /></label><label>Interview focus<select value={setup.type} onChange={(e) => setSetup({ ...setup, type: e.target.value })}><option value="behavioral">Behavioral</option><option value="technical">Technical</option><option value="hr">HR conversation</option></select></label><button className="button primary full" onClick={start}>Begin practice <ArrowRight size={17} /></button></section><aside className="panel tool-aside"><span className="eyebrow">A gentle reminder</span><h2>Good answers are specific, not perfect.</h2><p>Use one real situation, explain what you did, and close with what changed or what you learned.</p><div className="star-framework"><span>S</span><div><strong>Situation</strong><small>Set the scene briefly</small></div><span>T</span><div><strong>Task</strong><small>Name your responsibility</small></div><span>A</span><div><strong>Action</strong><small>Explain what you did</small></div><span>R</span><div><strong>Result</strong><small>Show the outcome</small></div></div></aside></div></div>;
  const latest = feedback.at(-1);
  const complete = feedback.length === session.questions.length;
  return <div className="page-enter"><div className="practice-header"><div><span className="eyebrow">{session.type} practice</span><h1>{session.role}</h1></div><div className="question-count">Question {Math.min(index + 1, session.questions.length)} of {session.questions.length}</div></div>{complete ? <section className="panel interview-complete"><span className="feature-icon"><Sparkles size={25} /></span><h2>Practice round complete.</h2><p>Your average readiness score is <strong>{Math.round(feedback.reduce((sum, item) => sum + item.score, 0) / feedback.length)}%</strong>. The biggest gains will come from making outcomes more measurable.</p><button className="button primary" onClick={() => { setSession(null); setFeedback([]); setIndex(0); }}><RotateCcw size={16} />Start another round</button></section> : <div className="practice-grid"><section className="panel question-panel"><span className="question-number">0{index + 1}</span><MessageSquareQuote size={25} /><h2>{session.questions[index]}</h2><label>Your answer<textarea rows="10" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Take a breath, then answer in your own words..." /></label><div className="answer-actions"><button className="button outline" type="button"><Mic size={16} />Record instead</button><button className="button primary" onClick={submit}>Submit answer <Send size={16} /></button></div></section><aside className="panel feedback-panel">{latest ? <><div className="feedback-score"><strong>{latest.score}</strong><span>Readiness score</span></div><h2>What’s working</h2>{latest.feedback.map((item) => <p key={item}><CheckCircle2 size={16} />{item}</p>)}</> : <><span className="feature-icon"><Bot size={23} /></span><h2>Feedback will appear here.</h2><p>We’ll look at clarity, relevance, evidence, and whether your answer lands on a meaningful result.</p></>}</aside></div>}</div>;
}
