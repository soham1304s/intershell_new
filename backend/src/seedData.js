import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User.js";
import { Job } from "./models/Job.js";
import { Application } from "./models/Application.js";
import { Notification } from "./models/Notification.js";
import { id } from "./utils.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Find employer account or create one
    let employer = await User.findOne({ email: "employer@internshell.dev" });
    if (!employer) {
      employer = new User({
        name: "Acme Employer",
        email: "employer@internshell.dev",
        password: "Password@123",
        role: "employer",
        companyName: "Acme Corp",
        isEmailVerified: true
      });
      await employer.save();
    }

    // Find the intern account
    const intern = await User.findOne({ role: "intern" });
    if (!intern) {
        console.log("Could not find any intern user. Please register an account first.");
        process.exit(1);
    }

    // Create Jobs
    const jobs = await Job.insertMany([
      {
        title: "Frontend Engineer Intern",
        company: "Acme Corp",
        description: "Join our team to build scalable frontend applications using React and Redux.",
        location: "Remote",
        type: "Internship",
        requirements: ["React", "JavaScript", "HTML/CSS"],
        skills: ["React", "Redux"],
        salary: "₹20,000/mo",
        employerId: employer._id,
        status: "Active"
      },
      {
        title: "Product Designer",
        company: "Designify",
        description: "We are looking for a creative Product Designer to craft beautiful user experiences.",
        location: "Bengaluru",
        type: "Full-time",
        requirements: ["Figma", "UI/UX", "Prototyping"],
        skills: ["Figma", "Design Systems"],
        salary: "₹12,00,000/yr",
        employerId: employer._id,
        status: "Active"
      },
      {
        title: "Backend Developer Intern",
        company: "DataTech",
        description: "Help us build robust APIs and manage databases in a fast-paced environment.",
        location: "Mumbai",
        type: "Internship",
        requirements: ["Node.js", "MongoDB", "Express"],
        skills: ["Node.js", "MongoDB"],
        salary: "₹25,000/mo",
        employerId: employer._id,
        status: "Active"
      },
      {
        title: "Data Analyst",
        company: "MetricsLab",
        description: "Analyze complex datasets and provide actionable insights for our clients.",
        location: "Remote",
        type: "Contract",
        requirements: ["Python", "SQL", "Tableau"],
        skills: ["Python", "SQL"],
        salary: "₹50,000/mo",
        employerId: employer._id,
        status: "Active"
      }
    ]);
    console.log("Seeded jobs.");

    // Create Applications
    await Application.insertMany([
      {
        userId: intern._id,
        jobId: jobs[0]._id,
        employerId: employer._id,
        status: "applied",
        atsScore: 85,
        answers: { "Why do you want to join?": "I love frontend development." }
      },
      {
        userId: intern._id,
        jobId: jobs[2]._id,
        employerId: employer._id,
        status: "interview",
        atsScore: 92,
        answers: { "Why do you want to join?": "I want to learn backend systems." }
      }
    ]);
    console.log("Seeded applications.");

    // Create Notifications
    await Notification.insertMany([
      {
        userId: intern._id,
        type: "match",
        title: "New strong match",
        message: "You are an 85% match for Frontend Engineer Intern at Acme Corp.",
        read: false
      },
      {
        userId: intern._id,
        type: "application",
        title: "Application reviewed",
        message: "Your application for Backend Developer Intern is being reviewed.",
        read: true
      },
      {
        userId: intern._id,
        type: "interview",
        title: "Interview scheduled",
        message: "DataTech wants to schedule an interview with you.",
        read: false
      }
    ]);
    console.log("Seeded notifications.");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
