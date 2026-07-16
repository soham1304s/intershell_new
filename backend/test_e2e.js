import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("Password123!", salt);
  await db.collection("users").updateOne({ email: "admin@internshell.dev" }, { $set: { password } });
  
  const loginRes = await fetch("http://localhost:5001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@internshell.dev", password: "Password123!" })
  });
  
  const loginData = await loginRes.json();
  console.log("LOGIN:", loginRes.status, loginData);
  
  if (loginData.data?.token) {
    const apiRes = await fetch("http://localhost:5001/api/admin/overview", {
      headers: { Authorization: `Bearer ${loginData.data.token}` }
    });
    
    const apiData = await apiRes.text();
    console.log("OVERVIEW:", apiRes.status, apiData.substring(0, 200));
  }
  process.exit();
}).catch(console.error);
