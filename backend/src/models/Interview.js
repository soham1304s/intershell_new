import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true },
  type: { type: String, required: true },
  questions: [{ type: String }],
  answers: [{
    questionIndex: { type: Number },
    answer: { type: String },
    score: { type: Number },
    feedback: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now }
});

export const Interview = mongoose.model("Interview", InterviewSchema);
