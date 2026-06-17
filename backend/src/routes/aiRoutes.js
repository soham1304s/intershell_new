import { Router } from "express";
import { auth } from "../auth.js";
import { analyzeResume, interviewQuestions, scoreAnswer } from "../ai.js";
import { ATSReport } from "../models/ATSReport.js";
import { Interview } from "../models/Interview.js";
import { CareerGuidance } from "../models/CareerGuidance.js";
import { asyncRoute, fail, send } from "../utils.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { User } from "../models/User.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const aiRoutes = Router();

aiRoutes.post("/ats/check", auth(), asyncRoute(async (req, res) => {
  const analysis = analyzeResume(req.body);
  const report = new ATSReport({
    userId: req.user.sub || req.user.id,
    targetRole: req.body.targetRole || "Target role",
    score: analysis.score || 0,
    keywordScore: analysis.keywordScore || 0,
    structureScore: analysis.structureScore || 0,
    matchedKeywords: analysis.matchedKeywords || [],
    missingKeywords: analysis.missingKeywords || [],
    suggestions: analysis.suggestions || []
  });
  
  await report.save();
  const reportObj = report.toObject();
  reportObj.id = report._id.toString();
  
  return send(res, reportObj, "ATS report is ready", 201);
}));

aiRoutes.get("/ats/history", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const reports = await ATSReport.find({ userId }).sort({ createdAt: -1 }).lean();
  send(res, reports.map(r => ({ ...r, id: r._id.toString() })));
}));

aiRoutes.post("/ats/improve", auth(), asyncRoute(async (req, res) => {
  const { resumeText, targetRole, jobDescription, missingKeywords } = req.body;
  if (!resumeText) return fail(res, "Resume text is required");

  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: "You are an expert resume writer and ATS optimizer. Rewrite the provided resume to better match the target role and job description. Incorporate the missing keywords naturally and effectively. Ensure strong action verbs, quantifiable outcomes, and clear formatting. Output ONLY the improved resume text. Do not include introductory or conversational text, and do not wrap it in markdown code blocks."
  });

  const prompt = `Target Role: ${targetRole}
Job Description: ${jobDescription}
Missing Keywords: ${(missingKeywords || []).join(', ')}

Original Resume:
${resumeText}

Please provide the completely rewritten, optimized resume.`;

  try {
    const result = await model.generateContent(prompt);
    return send(res, { improvedResume: result.response.text() }, "Resume optimized successfully", 200);
  } catch (error) {
    console.error("AI Assistant API Error:", error.message || error);
    return fail(res, "Failed to optimize resume with AI", 500);
  }
}));

aiRoutes.post("/interview/start", auth(), asyncRoute(async (req, res) => {
  const interview = new Interview({
    userId: req.user.sub || req.user.id,
    role: req.body.role || "Software Engineer",
    type: req.body.type || "behavioral",
    questions: interviewQuestions(req.body.role || "Software Engineer", req.body.type),
    answers: [],
    status: "active"
  });
  
  await interview.save();
  const interviewObj = interview.toObject();
  interviewObj.id = interview._id.toString();
  
  const user = await User.findById(req.user.sub || req.user.id).lean();
  const io = req.app.get("io");
  if (io) {
    const adminObj = { ...interviewObj, userId: user ? { ...user, id: user._id.toString() } : null };
    io.to("admin").emit("new_interview", adminObj);
  }
  
  return send(res, interviewObj, "Practice interview started", 201);
}));

aiRoutes.post("/interview/:id/answer", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const interview = await Interview.findOne({ _id: req.params.id, userId });
  if (!interview) return fail(res, "Interview not found", 404);
  
  const result = scoreAnswer(req.body.answer);
  const answer = { 
    questionIndex: req.body.questionIndex, 
    answer: req.body.answer, 
    score: result.score || 0,
    feedback: result.feedback || "",
    createdAt: new Date() 
  };
  
  interview.answers.push(answer);
  await interview.save();
  
  const updatedObj = interview.toObject();
  updatedObj.id = interview._id.toString();
  
  const user = await User.findById(userId).lean();
  const io = req.app.get("io");
  if (io) {
    const adminObj = { ...updatedObj, userId: user ? { ...user, id: user._id.toString() } : null };
    io.to("admin").emit("interview_updated", adminObj);
  }
  
  return send(res, { answer, interview: updatedObj }, "Answer reviewed");
}));

aiRoutes.post("/career-guidance", auth(), asyncRoute(async (req, res) => {
  const role = req.body.currentRole || "early-career professional";
  const interests = req.body.interests || "product and technology";
  
  const guidance = new CareerGuidance({
    userId: req.user.sub || req.user.id,
    title: `Your path from ${role}`,
    summary: `Build visible proof of work while deepening the skills that connect ${role} with ${interests}.`,
    nextRoles: ["Product-focused specialist", "Associate consultant", "Cross-functional analyst"],
    skillGaps: ["Structured communication", "Outcome measurement", "Domain depth"],
    roadmap: [
      { month: "Month 1–2", focus: "Choose a target role and complete one focused portfolio project." },
      { month: "Month 3–4", focus: "Build domain depth and publish weekly learning notes." },
      { month: "Month 5–6", focus: "Run a targeted application and networking sprint." }
    ]
  });
  
  await guidance.save();
  const guidanceObj = guidance.toObject();
  guidanceObj.id = guidance._id.toString();
  
  return send(res, guidanceObj, "Career roadmap created", 201);
}));



aiRoutes.post("/chat", auth(), asyncRoute(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return fail(res, "Message is required");

  const user = await User.findById(req.user.sub || req.user.id);
  const userName = user?.name || "a user";
  const userRole = user?.role || "intern";

  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: `You are the official AI Assistant for Internshell. You help users navigate the platform and provide career advice. The user talking to you is ${userName}, logged in as a ${userRole}. Keep responses concise, professional, and directly helpful. Do not use overly complex formatting.`
  });

  try {
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return send(res, { text: responseText, role: "model" });
  } catch (error) {
    console.error("AI Assistant API Error:", error.message || error);
    return send(res, { 
      text: "I'm currently undergoing maintenance to upgrade my AI brain! (It looks like the platform's Gemini API key is invalid or exhausted). Please update the GEMINI_API_KEY in the backend environment.", 
      role: "model" 
    });
  }
}));
