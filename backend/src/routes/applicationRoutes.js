import { Router } from "express";
import { auth, roles } from "../auth.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Job.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { asyncRoute, fail, send } from "../utils.js";

export const applicationRoutes = Router();

const enrich = async (appObj) => {
  const job = await Job.findById(appObj.jobId).lean();
  const applicant = await User.findById(appObj.userId).lean();
  
  if (job) job.id = job._id.toString();
  if (applicant) applicant.id = applicant._id.toString();
  
  return {
    ...appObj,
    id: appObj._id.toString(),
    job,
    applicant
  };
};

applicationRoutes.get("/", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const user = await User.findById(userId);
  if (!user) return fail(res, "User not found", 404);

  let query = {};
  if (user.role === "intern") {
    query.userId = userId;
  } else if (user.role === "employer") {
    const jobs = await Job.find({ employerId: userId }).lean();
    const jobIds = jobs.map(j => j._id);
    query.jobId = { $in: jobIds };
  }

  const applications = await Application.find(query).sort({ appliedAt: -1 }).lean();
  
  const enrichedApps = await Promise.all(applications.map(enrich));
  send(res, enrichedApps);
}));

applicationRoutes.post("/", auth(), roles("intern"), asyncRoute(async (req, res) => {
  const job = await Job.findById(req.body.jobId);
  if (!job || job.status !== "Active") return fail(res, "This job is no longer available", 404);
  
  const userId = req.user.sub || req.user.id;
  
  const duplicate = await Application.findOne({ jobId: job._id, userId });
  if (duplicate) return fail(res, "You have already applied for this role", 409);
  
  const application = new Application({
    userId,
    jobId: job._id,
    status: "applied",
    coverLetter: req.body.coverLetter || "",
    resumeUrl: req.body.resumeUrl || "",
    atsScore: Math.min(96, 75 - Math.floor(Math.random() * 8)),
    timeline: [{ status: "applied", date: new Date() }]
  });
  
  await application.save();
  
  job.applicantCount = (job.applicantCount || 0) + 1;
  await job.save();
  
  const user = await User.findById(userId);
  
  const notification = new Notification({
    userId: job.employerId,
    type: "application",
    title: "New application",
    message: `${user ? user.name : "A user"} applied for ${job.title}.`
  });
  await notification.save();
  
  const notifObj = notification.toObject();
  notifObj.id = notification._id.toString();
  
  const enriched = await enrich(application.toObject());
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${job.employerId.toString()}`).emit("new_notification", notifObj);
    io.to(`user:${job.employerId.toString()}`).emit("new_application", enriched);
    io.to("admin").emit("new_application", enriched);
  }
  return send(res, enriched, "Application submitted", 201);
}));

applicationRoutes.patch("/:id/status", auth(), roles("employer", "admin"), asyncRoute(async (req, res) => {
  const allowed = ["applied", "shortlisted", "interview", "offered", "accepted", "rejected"];
  if (!allowed.includes(req.body.status)) return fail(res, "Invalid application status");
  
  const application = await Application.findById(req.params.id);
  if (!application) return fail(res, "Application not found", 404);
  
  const job = await Job.findById(application.jobId);
  const userId = req.user.sub || req.user.id;
  
  if (req.user.role !== "admin" && job?.employerId.toString() !== userId) return fail(res, "Not allowed", 403);
  
  application.status = req.body.status;
  application.timeline.push({ status: req.body.status, date: new Date() });
  await application.save();
  
  const notification = new Notification({
    userId: application.userId,
    type: "application",
    title: "Application updated",
    message: `Your application for ${job ? job.title : "a job"} is now ${req.body.status}.`
  });
  await notification.save();
  
  const notifObj = notification.toObject();
  notifObj.id = notification._id.toString();
  
  const enriched = await enrich(application.toObject());
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${application.userId.toString()}`).emit("new_notification", notifObj);
    io.to(`user:${application.userId.toString()}`).emit("application_updated", enriched);
    if (job && job.employerId) {
      io.to(`user:${job.employerId.toString()}`).emit("application_updated", enriched);
    }
    io.to("admin").emit("application_updated", enriched);
  }
  return send(res, enriched, "Application status updated");
}));

applicationRoutes.delete("/:id", auth(), asyncRoute(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return fail(res, "Application not found", 404);
  
  const userId = req.user.sub || req.user.id;
  if (application.userId.toString() !== userId && req.user.role !== "admin") return fail(res, "Not allowed", 403);
  
  await Application.findByIdAndDelete(application._id);
  
  const job = await Job.findById(application.jobId);
  if (job) {
    job.applicantCount = Math.max(0, (job.applicantCount || 1) - 1);
    await job.save();
  }
  
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${application.userId.toString()}`).emit("application_deleted", { id: application._id.toString() });
    if (job && job.employerId) {
      io.to(`user:${job.employerId.toString()}`).emit("application_deleted", { id: application._id.toString() });
    }
    io.to("admin").emit("application_deleted", { id: application._id.toString() });
  }
  
  return send(res, null, "Application withdrawn");
}));
