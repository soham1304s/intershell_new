import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { config } from "./config.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendWelcomeEmail = async (email, name, role) => {
  try {
    const isEmployer = role === "employer";
    
    const subject = isEmployer 
      ? "Welcome to Internshell! Start hiring top talent." 
      : "Welcome to Internshell! Your career journey starts here.";
      
    const content = isEmployer 
      ? `
        <h2 style="color: #1f2937;">Welcome to Internshell, ${name}!</h2>
        <p style="color: #4b5563; font-size: 16px;">We're thrilled to have you on board. Internshell is the premier platform to connect with ambitious, pre-vetted interns eager to contribute to your company's success.</p>
        <p style="color: #4b5563; font-size: 16px;">Here's what you can do next:</p>
        <ul style="color: #4b5563; font-size: 16px;">
          <li>Complete your company profile.</li>
          <li>Post your first internship or job opportunity.</li>
          <li>Review candidate applications and ATS scores.</li>
        </ul>
        <br/>
        <a href="${config.clientUrl}/dashboard" style="background-color: #6558e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      `
      : `
        <h2 style="color: #1f2937;">Welcome to Internshell, ${name}!</h2>
        <p style="color: #4b5563; font-size: 16px;">We're so excited to help you build your next chapter. Internshell is designed to give you clarity and intention in your career growth.</p>
        <p style="color: #4b5563; font-size: 16px;">Here's what you can do next:</p>
        <ul style="color: #4b5563; font-size: 16px;">
          <li>Complete your profile and upload your resume.</li>
          <li>Explore personalized role matches.</li>
          <li>Practice with our ATS checker and interview tools.</li>
        </ul>
        <br/>
        <a href="${config.clientUrl}/dashboard" style="background-color: #6558e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
      `;

    const html = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; border-top: 4px solid #6558e8; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6558e8; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Internshell</h1>
        </div>
        ${content}
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 14px;">
          <p>Thank you for joining our community.</p>
          <p>© ${new Date().getFullYear()} Internshell. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Internshell" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully to:", email, "Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // We return false rather than throwing so it doesn't crash the calling route
    return false;
  }
};
