const express = require("express");
const HospitalModel = require("../model/hospitalModel");
const DocterModel = require("../model/docterModel");
const userModel = require("../model/userModel");
const ErrorHandler = require("../utils/errorhadler");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { sendMail } = require("../utils/mail");
const { error } = require("console");

const userRouter = express.Router();

const otpStore = new Map();
require("dotenv").config();

userRouter.get("/signup", async (req, res) => {
  res.status(200).send("Signup Page");
});

userRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !name || !password) {
      res
        .status(400)
        .json({ success: true, message: "All fields are required" });
    }

    let user = await userModel.findOne({ email });
    if (user) {
      res.status(400).json({ success: true, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP with expiration time
    otpStore.set(email, {
      otp,
      name,
      hashedPassword,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendOTP(email, otp);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

async function sendOTP(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.ADMIN_NAME,
        pass: process.env.ADMIN_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `AmedicK <${process.env.ADMIN_NAME}>`,
      to: email,
      subject: "Your OTP for Signup",
      text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ErrorHandler("Failed to send OTP", 500);
  }
}

userRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res
        .status(400)
        .json({ success: true, message: "All fields are required" });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      res
        .status(400)
        .json({ success: true, message: "OTP expired or not requested" });
    }

    // Check if OTP has expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ success: true, message: "OTP has expired" });
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ success: true, message: "Invalid OTP" });
    }

    // Create new user
    const newUser = new userModel({
      name: storedData.name,
      email,
      password: storedData.hashedPassword,
    });
    await newUser.save();

    otpStore.delete(email);

    res.status(200).json({ success: true, message: "Signup successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: true, message: "Server Error" });
  }
});

userRouter.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res
        .status(400)
        .json({ success: true, message: "All fields are required" });
    }
    let user = await userModel.findOne({ email });
    if (!user) {
      res.status(400).json({ success: true, message: "Please Signup" });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        res.status(500).json({ success: true, message: "Server Error" });
      }
      if (!result) {
        res
          .status(400)
          .json({ success: true, message: "Password is incorrect" });
      }
      return next(new ErrorHandler(""));
    });
  } catch (error) {}
});

module.exports = userRouter;
