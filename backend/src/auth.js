import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { fail } from "./utils.js";
import { User } from "./models/User.js";

export const createToken = (user) =>
  jwt.sign({ sub: user.id || user._id, role: user.role, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpire || "7d"
  });

export const auth = (required = true) => async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    if (!required) return next();
    return fail(res, "Authentication required", 401);
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return fail(res, "Account not found", 401);
    
    // Convert to plain object and set id to string for compatibility
    const userObj = user.toObject();
    userObj.id = user._id.toString();
    
    req.user = userObj;
    return next();
  } catch {
    return fail(res, "Your session has expired. Please sign in again.", 401);
  }
};

export const roles = (...allowed) => (req, res, next) => {
  console.log("ROLES MIDDLEWARE: req.user.role =", req.user?.role, "allowed =", allowed);
  if (!req.user || !allowed.includes(req.user.role)) {
    return fail(res, "You do not have permission for this action", 403);
  }
  return next();
};
