import { Router } from "express";
import { auth, createToken } from "../auth.js";
import { User } from "../models/User.js";
import { asyncRoute, fail, send, publicUser } from "../utils.js";
import { sendWelcomeEmail } from "../mailer.js";
import { OAuth2Client } from "google-auth-library";

export const authRoutes = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

authRoutes.post("/register", asyncRoute(async (req, res) => {
  const { name, email, password, role = "intern", company = "" } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    return fail(res, "Name, email, and password are required");
  }
  if (password.length < 6) return fail(res, "Password must be at least 6 characters");
  if (!["intern", "employer"].includes(role)) return fail(res, "Choose a valid account type");
  
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return fail(res, "An account with this email already exists", 409);
  }
  
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // will be hashed by pre-save hook
    role,
    companyName: role === "employer" ? company.trim() : ""
  });
  
  await user.save();
  
  // Dispatch welcome email asynchronously (don't block the response)
  sendWelcomeEmail(user.email, user.name, user.role);
  
  // Create a plain object representation for backwards compatibility in responses
  const userObj = user.toObject();
  userObj.id = user._id.toString();
  
  return send(res, { token: createToken(userObj), user: publicUser(userObj) }, "Welcome to Internshell", 201);
}));

authRoutes.post("/login", asyncRoute(async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const user = await User.findOne({ email });
  
  if (!user || !(await user.matchPassword(req.body.password || ""))) {
    return fail(res, "Email or password is incorrect", 401);
  }
  
  const userObj = user.toObject();
  userObj.id = user._id.toString();
  
  return send(res, { token: createToken(userObj), user: publicUser(userObj) }, "Welcome back");
}));

authRoutes.post("/google", asyncRoute(async (req, res) => {
  const { credential, role = "intern" } = req.body;
  if (!credential) return fail(res, "Missing Google credential");

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  
  const payload = ticket.getPayload();
  if (!payload || !payload.email) return fail(res, "Invalid Google token");

  const email = payload.email.toLowerCase().trim();
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      name: payload.name,
      email,
      password: Math.random().toString(36).slice(-10) + "A1!",
      role: ["intern", "employer"].includes(role) ? role : "intern",
      avatar: payload.picture || payload.name.charAt(0),
      isEmailVerified: payload.email_verified || true
    });
    await user.save();
    
    // Dispatch welcome email asynchronously for new Google users
    sendWelcomeEmail(user.email, user.name, user.role);
  }

  const userObj = user.toObject();
  userObj.id = user._id.toString();

  return send(res, { token: createToken(userObj), user: publicUser(userObj) }, "Welcome to Internshell");
}));

authRoutes.get("/me", auth(), asyncRoute(async (req, res) => {
  // `req.user` comes from `auth()` middleware, but might just be JWT payload
  const user = await User.findById(req.user.sub || req.user.id);
  if (!user) return fail(res, "User not found", 404);
  
  const userObj = user.toObject();
  userObj.id = user._id.toString();
  send(res, publicUser(userObj));
}));

authRoutes.get("/verify", auth(), asyncRoute(async (req, res) => {
  const user = await User.findById(req.user.sub || req.user.id);
  if (!user) return fail(res, "User not found", 404);
  
  const userObj = user.toObject();
  userObj.id = user._id.toString();
  send(res, { valid: true, user: publicUser(userObj) });
}));

authRoutes.post("/logout", auth(false), (_req, res) => send(res, null, "Signed out"));
