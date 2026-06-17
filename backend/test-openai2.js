import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.chatgpt });
async function run() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "hello" }],
    });
    console.log("chatgpt key:", completion.choices[0].message.content);
  } catch (e) {
    console.error("chatgpt ERROR:", e.status, e.message);
  }
}
run();
