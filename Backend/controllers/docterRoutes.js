const express = require("express");
// const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DocterModel = require("../model/docterModel");
const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhadler");
const e = require("express");

// Use env secret for JWT. Falls back to a safe default for local dev.
const JWT_SECRET = process.env.SECRET || process.env.JWT_SECRET || "your_jwt_secret";


const doctorRouter = express.Router();
// ──────────────────────────────────────
// SIGNUP
// ──────────────────────────────────────
doctorRouter.post("/signup", catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    const existingUser = await DocterModel.findOne({ email });
    if (existingUser) return next(new ErrorHandler("Doctor already exists", 400));

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new DocterModel({ name, email, password: hashedPassword });
    await newDoctor.save();

    res.status(201).json({ message: "Doctor registered successfully" });
}));

// ──────────────────────────────────────
// LOGIN
// ──────────────────────────────────────
doctorRouter.post("/login", catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    const doctor = await DocterModel.findOne({ email });
    if (!doctor) return next(new ErrorHandler("Doctor not found", 400));

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) return next(new ErrorHandler("Invalid credentials", 400));

  const token = jwt.sign({ id: doctor._id, email: doctor.email }, JWT_SECRET, { expiresIn: "1h" });

  // Set token as httpOnly cookie so middleware that expects cookies works
  // Cookie options: secure should be true in production when using HTTPS
  res.cookie("accesstoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json({
    message: "Login successful",
    token,
    doctor: {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      onDuty: doctor.onDuty,
    },
  });
}));


doctorRouter.get('/appointments/doctors', async (req, res) => {
  try {
    const doctors = await DocterModel.find({}, { name: 1 }); // return only name and _id
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: 'Server error fetching doctors' });
  }
});

module.exports = doctorRouter;
