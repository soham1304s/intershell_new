import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["applied", "shortlisted", "interview", "offered", "rejected", "accepted"], default: "applied" },
  resumeUrl: { type: String },
  coverLetter: { type: String },
  atsScore: { type: Number },
  timeline: [{
    status: { type: String },
    date: { type: Date, default: Date.now }
  }],
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Application = mongoose.model("Application", ApplicationSchema);
