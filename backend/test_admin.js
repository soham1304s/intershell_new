import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const admin = await db.collection("users").findOne({ email: "admin@internshell.dev" });
  
  const token = jwt.sign(
    { sub: admin._id, role: admin.role, email: admin.email }, 
    process.env.JWT_SECRET || "internshell-local-development-secret", 
    { expiresIn: "7d" }
  );
  
  console.log("TOKEN:", token);
  
  const res = await fetch("http://localhost:5001/api/admin/overview", {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const data = await res.text();
  console.log("RESPONSE:", res.status, data);
  process.exit();
}).catch(console.error);
