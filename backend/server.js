const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const adminAuth = require("./middleware/adminAuth");
const User = require("./models/User");
const Job = require("./models/Job");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Indian Job Backend Running Successfully!");
});

// GET ALL JOBS
app.get("/api/jobs", async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET SINGLE JOB
app.get("/api/jobs/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        res.json(job);
    } catch (err) {
        res.status(400).json({ message: "Invalid job ID" });
    }
});

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields required" });

        const existing = await User.findOne({ email });

        if (existing)
            return res.status(400).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashed });

        res.status(201).json({ message: "Signup successful!" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN LOGIN
app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            email !== process.env.ADMIN_EMAIL ||
            password !== process.env.ADMIN_PASSWORD
        ) {
            return res.status(401).json({
                message: "Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            { role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Admin login successful",
            token
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ADMIN ADD JOB
app.post("/api/admin/jobs", adminAuth, async (req, res) => {
    try {
        const job = await Job.create(req.body);

        res.status(201).json({
            message: "Job added successfully",
            job
        });

    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// DELETE JOB - ADMIN ONLY
app.delete("/api/admin/jobs/:id", adminAuth, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.json({
            message: "Job deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting job"
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ message: "Login successful!", token, name: user.name });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.log("MongoDB Error:", err.message));

app.listen(process.env.PORT || 5000, () => {
    console.log("Indian Job Backend Running on Port 5000");
});
