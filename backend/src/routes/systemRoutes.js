import { Router } from "express";
import { auth, roles } from "../auth.js";
import { Job } from "../models/Job.js";
import { Application } from "../models/Application.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import crypto from "crypto";
import Razorpay from "razorpay";
import { Payment } from "../models/Payment.js";
import { Interview } from "../models/Interview.js";
import { asyncRoute, fail, publicUser, send } from "../utils.js";
import { config } from "../config.js";

export const systemRoutes = Router();

systemRoutes.get("/dashboard", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const user = await User.findById(userId);
  if (!user) return fail(res, "User not found", 404);

  if (user.role === "intern") {
    const mine = await Application.find({ userId }).populate("jobId").lean();
    const savedJobsCount = user.savedJobs ? user.savedJobs.length : 0;
    
    const recommendations = await Job.find({ status: "Active" }).sort({ createdAt: -1 }).limit(4).lean();
    const activity = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(5).lean();
    
    return send(res, {
      stats: {
        applications: mine.length,
        interviews: mine.filter((item) => item.status === "interview").length,
        savedJobs: savedJobsCount,
        profileViews: 126
      },
      recommendations: recommendations.map(j => ({ 
        ...j, 
        id: j._id.toString(),
        companyLogo: (j.company || "Co").substring(0, 2).toUpperCase(),
        companyColor: ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(j.company || "").length % 5]
      })),
      applications: mine.map((application) => ({
        ...application,
        id: application._id.toString(),
        job: application.jobId ? { 
          ...application.jobId, 
          id: application.jobId._id.toString(),
          companyLogo: (application.jobId.company || "Co").substring(0, 2).toUpperCase(),
          companyColor: ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(application.jobId.company || "").length % 5]
        } : null
      })),
      activity: activity.map(n => ({ ...n, id: n._id.toString() }))
    });
  }
  
  if (user.role === "employer") {
    const myJobs = await Job.find({ employerId: userId }).lean();
    const jobIds = myJobs.map(j => j._id);
    const mine = await Application.find({ jobId: { $in: jobIds } }).populate("jobId").populate("userId").lean();
    
    return send(res, {
      stats: {
        activeJobs: myJobs.filter((job) => job.status === "Active").length,
        applicants: mine.length,
        shortlisted: mine.filter((item) => item.status === "shortlisted").length,
        interviews: mine.filter((item) => item.status === "interview").length
      },
      jobs: myJobs.map(j => ({ 
        ...j, 
        id: j._id.toString(),
        companyLogo: (j.company || "Co").substring(0, 2).toUpperCase(),
        companyColor: ["#6558e8", "#149c95", "#f1a833", "#ec557b", "#4b5563"][(j.company || "").length % 5],
        applicantCount: mine.filter(a => a.jobId && a.jobId._id.toString() === j._id.toString()).length
      })),
      applications: mine.map((application) => ({
        ...application,
        id: application._id.toString(),
        job: application.jobId ? { ...application.jobId, id: application.jobId._id.toString() } : null,
        applicant: application.userId ? publicUser({ ...application.userId, id: application.userId._id.toString() }) : null
      }))
    });
  }
  
  // Admin logic
  const usersCount = await User.countDocuments();
  const jobsCount = await Job.countDocuments();
  const applicationsCount = await Application.countDocuments();
  const payments = await Payment.find().lean();
  const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return send(res, {
    stats: {
      users: usersCount,
      jobs: jobsCount,
      applications: applicationsCount,
      revenue
    }
  });
}));

systemRoutes.get("/notifications", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
  send(res, notifications.map(n => ({ ...n, id: n._id.toString() })));
}));

systemRoutes.put("/notifications/:id/read", auth(), asyncRoute(async (req, res) => {
  const userId = req.user.sub || req.user.id;
  const notification = await Notification.findOne({ _id: req.params.id, userId });
  if (!notification) return fail(res, "Notification not found", 404);
  
  notification.read = true;
  await notification.save();
  
  const notifObj = notification.toObject();
  notifObj.id = notification._id.toString();
  return send(res, notifObj);
}));

systemRoutes.get("/subscription", auth(), asyncRoute(async (req, res) => {
  const user = await User.findById(req.user.sub || req.user.id);
  if (!user) return fail(res, "User not found", 404);
  
  const plan = user.subscription?.plan || "free";
  
  send(res, {
    plan,
    credits: 0,
    renewalDate: user.subscription?.expiryDate || new Date(Date.now() + 24 * 86400000).toISOString(),
    autoRenew: plan !== "free"
  });
}));

systemRoutes.post("/subscription/order", auth(), asyncRoute(async (req, res) => {
  const plans = { premium: 299, pro: 699 };
  const plan = req.body.plan;
  if (!plans[plan]) return fail(res, "Choose a valid plan");
  
  const amount = req.body.cycle === "yearly" ? (plan === "premium" ? 2999 : 6999) : plans[plan];
  
  const rzp = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret
  });
  
  const options = {
    amount: amount * 100, // paise
    currency: "INR",
    receipt: `rcpt_${(req.user.sub || req.user.id).toString().substring(0,8)}_${Date.now()}`
  };
  
  const order = await rzp.orders.create(options);
  return send(res, { orderId: order.id, amount: order.amount });
}));

systemRoutes.post("/subscription", auth(), asyncRoute(async (req, res) => {
  const { plan, cycle, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const plans = { premium: 299, pro: 699 };
  if (!plans[plan]) return fail(res, "Choose a valid plan");
  
  const hmac = crypto.createHmac("sha256", config.razorpayKeySecret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const expectedSignature = hmac.digest("hex");
  
  if (expectedSignature !== razorpay_signature) {
    return fail(res, "Payment verification failed", 400);
  }
  
  const amount = cycle === "yearly" ? (plan === "premium" ? 2999 : 6999) : plans[plan];
  const userId = req.user.sub || req.user.id;
  
  const payment = new Payment({
    userId,
    plan,
    cycle: cycle || "monthly",
    amount,
    currency: "INR",
    status: "paid",
    method: "razorpay",
    transactionId: razorpay_payment_id
  });
  
  await payment.save();
  
  const user = await User.findById(userId);
  if (user) {
    user.subscription = {
      plan,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + (cycle === "yearly" ? 365 : 30) * 86400000),
      status: "active"
    };
    await user.save();
  }
  
  const payObj = payment.toObject();
  payObj.id = payment._id.toString();
  
  return send(res, { payment: payObj, plan }, "Subscription activated");
}));

systemRoutes.get("/admin/overview", auth(), roles("admin"), asyncRoute(async (_req, res) => {
  const users = await User.find().lean();
  const jobs = await Job.find().lean();
  const applications = await Application.find().populate("jobId").populate("userId").lean();
  const payments = await Payment.find().lean();
  const interviews = await Interview.find().populate("userId").sort({ createdAt: -1 }).lean();
  
  const mappedUsers = users.map(u => publicUser({ ...u, id: u._id.toString() }));
  
  send(res, {
    metrics: {
      users: users.length,
      activeJobs: jobs.filter((job) => job.status === "Active").length,
      applications: applications.length,
      revenue: payments.reduce((sum, payment) => sum + payment.amount, 0),
      interviews: interviews.length
    },
    users: mappedUsers,
    jobs: jobs.map(j => ({ 
      ...j, 
      id: j._id.toString(),
      applicantCount: applications.filter(a => a.jobId && a.jobId._id.toString() === j._id.toString()).length
    })),
    applications: applications.map((application) => ({
      ...application,
      id: application._id.toString(),
      job: application.jobId ? { ...application.jobId, id: application.jobId._id.toString() } : null,
      applicant: application.userId ? publicUser({ ...application.userId, id: application.userId._id.toString() }) : null
    })),
    payments: payments.map(p => ({ ...p, id: p._id.toString() })),
    interviews: interviews.map(i => ({
      ...i,
      id: i._id.toString(),
      userId: i.userId ? publicUser({ ...i.userId, id: i.userId._id.toString() }) : null
    }))
  });
}));

systemRoutes.patch("/admin/users/:id", auth(), roles("admin"), asyncRoute(async (req, res) => {
  const allowed = ["role", "isEmailVerified", "subscription"];
  const changes = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  
  const user = await User.findByIdAndUpdate(req.params.id, changes, { new: true });
  if (!user) return fail(res, "User not found", 404);
  
  const userObj = user.toObject();
  userObj.id = user._id.toString();
  
  return send(res, publicUser(userObj), "User updated");
}));
