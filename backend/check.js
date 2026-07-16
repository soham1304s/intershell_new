import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}, { projection: { email: 1, role: 1 } }).toArray();
  console.log(JSON.stringify(users, null, 2));
  process.exit();
}).catch(console.error);
