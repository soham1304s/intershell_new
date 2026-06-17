import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, required: true },
  cycle: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, required: true },
  method: { type: String, required: true },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Payment = mongoose.model("Payment", PaymentSchema);
