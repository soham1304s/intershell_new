import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["intern", "employer", "admin", "pending"], default: "intern" },
  phone: { type: String },
  companyName: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  subscription: {
    plan: { type: String, enum: ["free", "premium", "pro"], default: "free" },
    startDate: { type: Date },
    expiryDate: { type: Date },
    status: { type: String, enum: ["active", "cancelled", "paused"], default: "active" }
  },
  headline: { type: String },
  location: { type: String },
  bio: { type: String },
  education: [{ type: mongoose.Schema.Types.Mixed }],
  experience: [{ type: mongoose.Schema.Types.Mixed }],
  projects: [{ type: mongoose.Schema.Types.Mixed }],
  preferences: { type: mongoose.Schema.Types.Mixed },
  profileCompletion: { type: Number, default: 35 },
  avatar: { type: String },
  skills: [{ type: String }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", UserSchema);
