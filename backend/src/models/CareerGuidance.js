import mongoose from "mongoose";

const CareerGuidanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  nextRoles: [{ type: String }],
  skillGaps: [{ type: String }],
  roadmap: [{
    month: { type: String },
    focus: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const CareerGuidance = mongoose.model("CareerGuidance", CareerGuidanceSchema);
