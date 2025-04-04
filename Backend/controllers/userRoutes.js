const express = require("express");
const HospitalModel = require("../model/hospitalModel");
const DocterModel = require("../model/docterModel");
const userModel = require("../model/userModel");
const ErrorHandler = require("../utils/errorhadler");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt=require("jsonwebtoken")
const crypto = require("crypto");
const { sendMail } = require("../utils/mail");
const catchAsyncError = require("../middleware/catchAsyncError");
const { rejects } = require("assert");

const userRouter = express.Router();
       
const otpStore = new Map();
require("dotenv").config();



userRouter.get("/signup", async (req, res) => {
    res.status(200).send("Signup Page");    

    
});

userRouter.post("/signup",catchAsyncError( async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !name || !password) {
            return next(new ErrorHandler("All fields are required", 400));
        }
        if (email) {
            if(!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
                return next(new ErrorHandler("Invalid email format", 400));
            }
        }
        if (password) {
            if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)) {
                return next(new ErrorHandler("Password must be at least 8 characters long and contain at least one letter and one number", 400));
            }
        }

        let user = await userModel.findOne({ email});
        if (user) {
            return next(new ErrorHandler("User already exists", 400));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store OTP with expiration time
        otpStore.set(email, { otp, name, hashedPassword, expiresAt: Date.now() + 5 * 60 * 1000 });

        await sendOTP(email, otp);

        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
}));

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

userRouter.post("/verify-otp",catchAsyncError( async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return next(new ErrorHandler("All fields are required", 400));
        }



        

        const storedData = otpStore.get(email);
        if (!storedData) {
            return next(new ErrorHandler("OTP expired or not requested", 400));
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email);
            return next(new ErrorHandler("OTP has expired", 400));
        }

        if (storedData.otp !== otp) {
            return next(new ErrorHandler("Invalid OTP", 400));
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
       return next(new ErrorHandler("Server Error", 500));
    }
}));

userRouter.post("/login",catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email)
    if(!email){
        return next(new ErrorHandler("Email is required", 400));
    }
    if(!password){
        return next(new ErrorHandler("Password is required", 400));
    }
    

    let user = await UserModel.findOne({ email });
    console.log(user,"9999999999999")

    if (!user) {
      return next(new ErrorHandler("Please Signup", 400));
    }

    if(!user.isActivated){
      return next(new ErrorHandler("Please Signup", 400));
    }

    await bcrypt.compare(password, user.password, function(err, result) {
      if(err){
        return next(new Errorhadler("internal server error", 500));
      }
      if(!result){
        return next(new Errorhadler("password is incorrect", 400));
      }
      let token = jwt.sign({ id: user._id }, process.env.SECRET, {
        expiresIn: 60 * 60 * 60 * 24 * 30,
      });
      res.cookie("accesstoken", token, {
        httpOnly: true,
        MaxAge: "5d",
      });
      res.status(200).json({status:true,message:"login successful"})

      
    });
  }));

module.exports = userRouter;


