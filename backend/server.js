const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Indian Job Backend Running Successfully!");
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
