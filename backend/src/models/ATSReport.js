import mongoose from "mongoose";

const ATSReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetRole: { type: String, required: true },
  score: { type: Number, required: true },
  keywordScore: { type: Number, default: 0 },
  structureScore: { type: Number, default: 0 },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  suggestions: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const ATSReport = mongoose.model("ATSReport", ATSReportSchema);
