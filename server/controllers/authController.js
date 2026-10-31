import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";

// registerUser function handles user registration
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields",
      success: false,
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
      success: false,
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User already exists", success: false });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: newUser.email,
    subject: "Welcome to Our Platform!",
    text: `Hello ${newUser.name},\n\nThank you for registering on our platform. We're excited to have you on board!\n\nBest regards,\nThe Team`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(201).json({
    message: "User registered successfully",
    success: true,
  });
};

// loginUser function handles user login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide all required fields",
      success: false,
    });
  }

  const findUser = await User.findOne({ email });
  if (!findUser) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password...",
    });
  }

  // --- NEW CHECK: Prevent bcrypt crash for Google users ---
  if (!findUser.password) {
    return res.status(400).json({
      success: false,
      message:
        "This account was created using Google. Please click 'Continue with Google' to log in.",
    });
  }
  // --------------------------------------------------------

  const isMatch = await bcrypt.compare(password, findUser.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: findUser.email,
    subject: "Welcome back to Our Platform!",
    text: `Hello ${findUser.name},\n\nWelcome back to our platform. We're glad to have you here!\n\nBest regards,\nThe Team`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({
    message: "User logged in successfully",
    success: true,
  });
};

// Add this at the bottom of your authController.js

export const googleAuthCallback = async (req, res) => {
  try {
    // Passport attaches the authenticated user to req.user
    const user = req.user;

    // Generate JWT just like in loginUser/registerUser
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect the user back to the frontend homepage
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(clientUrl);
  } catch (error) {
    console.error("Google Callback Error:", error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// Uses userAuth middleware
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // expires: new Date(0), // Forces browser deletion across all browsers
  });

  return res.status(200).json({
    message: "User logged out successfully",
    success: true,
  });
};

// Uses userAuth middleware
export const sendVerifyOtp = async (req, res) => {
  const userId = req.userId; // <-- Changed from req.body

  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
      success: false,
    });
  }

  const findUser = await User.findById(userId);

  if (!findUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (findUser.isAccountVerified) {
    return res.status(400).json({
      message: "Account is already verified",
      success: false,
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

  findUser.verifyOtp = otp;
  findUser.verifyOtpExpiresAt = otpExpiresAt;
  await findUser.save();

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: findUser.email,
    subject: "Verify Your Account",
    text: `Hello ${findUser.name},\n\nYour verification code is: ${otp}\n\nThis code will expire in 24 hours.\n\nBest regards,\nThe Team`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({
    message: "Verification code sent successfully",
    success: true,
  });
};

// Uses userAuth middleware
export const verifyAccount = async (req, res) => {
  const userId = req.userId; // <-- Changed from req.body
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      message: "Please provide all required fields",
      success: false,
    });
  }

  const findUser = await User.findById(userId);

  if (!findUser) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  if (findUser.verifyOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
      success: false,
    });
  }

  if (Date.now() > findUser.verifyOtpExpiresAt) {
    return res.status(400).json({
      message: "OTP has expired",
      success: false,
    });
  }

  findUser.isAccountVerified = true;
  findUser.verifyOtp = "";
  findUser.verifyOtpExpiresAt = 0;
  await findUser.save();

  return res.status(200).json({
    message: "Account verified successfully",
    success: true,
  });
};

export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
      success: false,
    });
  }

  const findUser = await User.findOne({ email });

  if (!findUser) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = Date.now() + 15 * 60 * 1000;

  findUser.passwordResetOtp = otp;
  findUser.passwordResetOtpExpiresAt = otpExpiresAt;
  await findUser.save();

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: findUser.email,
    subject: "Reset Your Password",
    text: `Hello ${findUser.name},\n\nYour password reset code is: ${otp}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nThe Team`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({
    message: "Password reset code sent successfully",
    success: true,
  });
};

export const verifyPasswordResetOtp = async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !password || !otp) {
    return res.status(400).json({
      message: "Please provide all required fields",
      success: false,
    });
  }

  const findUser = await User.findOne({ email });

  if (!findUser) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  if (findUser.passwordResetOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
      success: false,
    });
  }

  if (Date.now() > findUser.passwordResetOtpExpiresAt) {
    return res.status(400).json({
      message: "OTP has expired",
      success: false,
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  findUser.password = hashedPassword;
  findUser.passwordResetOtp = "";
  findUser.passwordResetOtpExpiresAt = 0;

  await findUser.save();

  return res.status(201).json({
    message: "Password has been reset successfully",
    success: true,
  });
};

export const isAuthenticated = async (req, res) => {
  return res.status(200).json({
    message: "User is authenticated",
    success: true,
  });
};
