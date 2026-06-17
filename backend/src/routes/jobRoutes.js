import { Router } from "express";
import { auth, roles } from "../auth.js";
import { Job } from "../models/Job.js";
import { User } from "../models/User.js";
import { asyncRoute, fail, paginate, send, slugify } from "../utils.js";

export const jobRoutes = Router();

jobRoutes.get("/", auth(false), asyncRoute(async (req, res) => {
  const { search = "", location = "", type = "", sort = "recommended", page = 1, limit = 10 } = req.query;
  
  const query = { status: "Active" };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }
  if (location) query.location = { $regex: location, $options: "i" };
  if (type) query.type = type;

  let sortOpt = {};
  if (sort === "newest") sortOpt = { createdAt: -1 };
  
  const jobs = await Job.find(query).sort(sortOpt).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).lean();
  const total = await Job.countDocuments(query);
  
  let savedIds = new Set();
  if (req.user) {
    const user = await User.findById(req.user.sub || req.user.id);
    if (user && user.savedJobs) {
      savedIds = new Set(user.savedJobs.map(id => id.toString()));
    }
  }

  const items = jobs.map(job => {
    job.id = job._id.toString();
    job.saved = savedIds.has(job.id);
    job.companyLogo = (job.company || "Co").substring(0, 2).toUpperCase();
    job.companyColor = ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(job.company || "").length % 5];
    return job;
  });

  const result = {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
  
  send(res, result);
}));

jobRoutes.get("/featured", asyncRoute(async (_req, res) => {
  const jobs = await Job.find({ status: "Active" }).sort({ createdAt: -1 }).limit(6).lean();
  send(res, jobs.map(j => ({ 
    ...j, 
    id: j._id.toString(),
    companyLogo: (j.company || "Co").substring(0, 2).toUpperCase(),
    companyColor: ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(j.company || "").length % 5]
  })));
}));

jobRoutes.get("/saved/list", auth(), asyncRoute(async (req, res) => {
  const user = await User.findById(req.user.sub || req.user.id).populate("savedJobs");
  if (!user) return fail(res, "User not found", 404);
  
  const jobs = user.savedJobs.map(job => {
    const j = job.toObject();
    j.id = j._id.toString();
    j.saved = true;
    j.companyLogo = (j.company || "Co").substring(0, 2).toUpperCase();
    j.companyColor = ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(j.company || "").length % 5];
    return j;
  });
  send(res, jobs);
}));

jobRoutes.get("/:id", auth(false), asyncRoute(async (req, res) => {
  const job = await Job.findById(req.params.id).lean().catch(() => null);
  if (!job) return fail(res, "Job not found", 404);
  job.id = job._id.toString();
  
  let saved = false;
  if (req.user) {
    const user = await User.findById(req.user.sub || req.user.id);
    if (user && user.savedJobs) {
      saved = user.savedJobs.some(id => id.toString() === job.id);
    }
  }
  
  job.companyLogo = (job.company || "Co").substring(0, 2).toUpperCase();
  job.companyColor = ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(job.company || "").length % 5];
  
  // Provide safe defaults for legacy database entries to prevent frontend crashes
  job.responsibilities = job.responsibilities || [];
  job.requirements = job.requirements || [];
  job.skills = job.skills || [];
  job.benefits = job.benefits || [];
  job.workplace = job.workplace || "Remote";
  job.openings = job.openings || 1;
  job.experience = job.experience || "Entry-level";
  job.companyAbout = job.companyAbout || "An innovative company building the future.";
  job.deadline = job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  job.match = job.match || Math.floor(Math.random() * 20) + 75; // Mock match percentage for the UI
  
  return send(res, { ...job, saved });
}));

jobRoutes.post("/", auth(), roles("employer", "admin"), asyncRoute(async (req, res) => {
  const required = ["title", "company", "location", "type", "description"];
  const missing = required.filter((key) => !req.body[key]);
  if (missing.length) return fail(res, `Missing fields: ${missing.join(", ")}`);
  
  const job = new Job({
    ...req.body,
    skills: req.body.skills || [],
    requirements: req.body.requirements || [],
    employerId: req.user.sub || req.user.id,
    status: "Active"
  });
  
  await job.save();
  const jobObj = job.toObject();
  jobObj.id = job._id.toString();
  jobObj.companyLogo = (jobObj.company || "Co").substring(0, 2).toUpperCase();
  jobObj.companyColor = ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(jobObj.company || "").length % 5];
  
  const io = req.app.get("io");
  if (io) io.emit("new_job", jobObj);
  
  return send(res, jobObj, "Job published", 201);
}));

jobRoutes.patch("/:id", auth(), roles("employer", "admin"), asyncRoute(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return fail(res, "Job not found", 404);
  
  const userId = req.user.sub || req.user.id;
  if (req.user.role !== "admin" && job.employerId.toString() !== userId) {
    return fail(res, "Not allowed", 403);
  }
  
  Object.assign(job, req.body);
  job.updatedAt = new Date();
  await job.save();
  
  const jobObj = job.toObject();
  jobObj.id = job._id.toString();
  return send(res, jobObj, "Job updated");
}));

jobRoutes.delete("/:id", auth(), roles("employer", "admin"), asyncRoute(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return fail(res, "Job not found", 404);
  
  const userId = req.user.sub || req.user.id;
  if (req.user.role !== "admin" && job.employerId.toString() !== userId) {
    return fail(res, "Not allowed", 403);
  }
  
  job.status = "Closed";
  await job.save();
  return send(res, null, "Job closed");
}));

jobRoutes.post("/:id/save", auth(), asyncRoute(async (req, res) => {
  const user = await User.findById(req.user.sub || req.user.id);
  if (!user) return fail(res, "User not found", 404);
  
  const jobId = req.params.id;
  const isSaved = user.savedJobs.some(id => id.toString() === jobId);
  
  if (isSaved) {
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();
    return send(res, { saved: false }, "Removed from saved jobs");
  } else {
    user.savedJobs.push(jobId);
    await user.save();
    return send(res, { saved: true }, "Job saved");
  }
}));
