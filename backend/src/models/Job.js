import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract"], required: true },
  requirements: [{ type: String }],
  skills: [{ type: String }],
  responsibilities: [{ type: String }],
  benefits: [{ type: String }],
  workplace: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "Remote" },
  deadline: { type: Date },
  openings: { type: Number, default: 1 },
  experience: { type: String, default: "Entry-level" },
  companyAbout: { type: String },
  salary: { type: String },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Active", "Closed", "Drafted"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Job = mongoose.model("Job", JobSchema);
