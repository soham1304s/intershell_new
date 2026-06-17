import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("hello");
    console.log("1.5-flash-latest:", result.response.text());
  } catch (e) {
    console.error("1.5-flash-latest ERROR:", e.status);
  }
  try {
    const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result2 = await model2.generateContent("hello");
    console.log("gemini-pro:", result2.response.text());
  } catch (e) {
    console.error("gemini-pro ERROR:", e.status);
  }
  try {
    const model3 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result3 = await model3.generateContent("hello");
    console.log("gemini-1.5-flash:", result3.response.text());
  } catch (e) {
    console.error("gemini-1.5-flash ERROR:", e.status);
  }
}
run();
