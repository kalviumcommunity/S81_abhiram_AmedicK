const express = require("express");
const HospitalModel = require("../model/hospitalModel");
const DocterModel = require("../model/docterModel");
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

// Signup Page (GET)
userRouter.get("/signup", (req, res) => {
  res.status(200).send("Signup Page");
});



// Signup (POST)
userRouter.post(
  "/signup",
  catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

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

    const existinguser = await userModel.findOne({ email });
    if (existinguser) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user=new userModel({
      name,
      email,
      password:hashedPassword
    })
    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore.set(email, {
      otp,
      name,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });
    try {
      await sendOTP(email, otp);
    } catch (error) {
      return next(new ErrorHandler("Failed To Send OTP", 500));
    }
    await user.save()

    setTimeout(async () => {
      try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser && !existingUser.isActivated) {
          await userModel.deleteOne({ email });
          otpStore.delete(email); // <--- ADD THIS
          console.log(`Deleted unverified user and OTP: ${email}`);
        }
      } catch (err) {
        console.error(Error `deleting unverified user ${email}:`, err.message);
      }
    }, 5 * 60 * 1000);
    
    res.status(200).json({ success: true, message: "OTP sent to your email" });
  })
);

// Verify OTP (POST)
userRouter.post(
  "/verify-otp",
  catchAsyncError(async (req, res, next) => {
    const { otp, email } = req.body;

    if (!otp) {
      return next(new ErrorHandler("OTP is required", 400));
    }
    
    if (!email) {
      return next(new ErrorHandler("Email is required", 400));
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
    
    otpStore.delete(email);
    
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return next(new ErrorHandler("Please start signup from beginning", 400));
    }
    
    await userModel.findByIdAndUpdate(user._id, { isActivated: true });
    
    res.status(200).json({ success: true, message: "Signup successful" });
    
  })
);

// Login (POST)
userRouter.post(
  "/login",
  catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Email and password are required", 400));
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "30d", // 30 days
    });

    res.cookie("accesstoken", token, {
      httpOnly: true,
      secure:false,
      sameSite:"lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    });

    res.status(200).json({ status: true, message: "Login successful" ,token});
  })
);

//Get Routes added on may 7
userRouter.get(
  "/users",
  catchAsyncError(async (req, res, next) => {
    const users = await userModel.find({}, "-password"); // Exclude password field
    res.status(200).json({
      success: true,
      users,
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
    from: `AmedicK <${process.env.ADMIN_NAME}>`,
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP is: ${otp}. It is valid for 5 minutes.`,
  });
}

module.exports = userRouter;