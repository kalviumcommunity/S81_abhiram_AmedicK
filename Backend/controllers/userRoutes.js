const express = require("express");
const HospitalModel = require("../model/hospitalModel");
const DoctorModel = require("../model/docterModel");
const userModel = require("../model/userModel");
const ErrorHandler = require("../utils/errorhadler");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMail } = require("../utils/mail");
const catchAsyncError = require("../middleware/catchAsyncError");

const userRouter = express.Router();
const otpStore = new Map();
require("dotenv").config();

// GET: Signup page
userRouter.get("/signup", (req, res) => {
  res.status(200).send("Signup Page");
});

// POST: Signup
userRouter.post(
  "/signup",
  catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    console.log(password)

    if (!email || !name || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      return next(new ErrorHandler("Invalid email format", 400));
    }

    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)) {
      return next(
        new ErrorHandler(
          "Password must be at least 8 characters long and contain at least one letter and one number",
          400
        )
      );
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    otpStore.set(email, {
      otp,
      name,
      hashedPassword,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    try {
      await sendOTP(email, otp);
    } catch (error) {
      otpStore.delete(email);
      return next(new ErrorHandler("Failed to send OTP", 500));
    }

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  })
);

// POST: Verify OTP
userRouter.post(
  "/verify-otp",
  catchAsyncError(async (req, res, next) => {
    const { otp, email } = req.body;

    if (!otp || !email) {
      return next(new ErrorHandler("Email and OTP are required", 400));
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return next(new ErrorHandler("OTP expired or not requested", 400));
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return next(new ErrorHandler("OTP has expired", 400));
    }

    if (storedData.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    const user = new userModel({
      name: storedData.name,
      email,
      password: storedData.hashedPassword,
      isActivated: true,
    });

    await user.save();
    otpStore.delete(email);

    res.status(200).json({ success: true, message: "Signup successful" });
  })
);

// POST: Login
userRouter.post(
  "/login",
  catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Email and password are required", 400));
    }

    const user = await userModel.findOne({ email });

    if (!user || !user.isActivated) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "30d",
    });

    res.cookie("accesstoken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: true,
      message: "Login successful",
      token,
    });
  })
);

// Helper: Send OTP Email
async function sendOTP(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.ADMIN_NAME,
      pass: process.env.ADMIN_PASSWORD,
    },
  });

  await transporter.sendMail({
    from:` AmedicK <${process.env.ADMIN_NAME}>`,
    to: email,
    subject: "Your OTP for Signup",
    text:` Your OTP is: ${otp}. It is valid for 5 minutes.`,
  });
}

module.exports = userRouter;