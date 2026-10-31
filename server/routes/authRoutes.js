import express from "express";
import passport from "passport"; // <-- Import passport
import { WrapAsync } from "../utils/WrapAsync.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

import {
  registerUser,
  loginUser,
  logoutUser,
  sendVerifyOtp,
  verifyAccount,
  isAuthenticated,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  googleAuthCallback, // <-- Import new controller
} from "../controllers/authController.js";

authRouter.post("/register", WrapAsync(registerUser));
authRouter.post("/login", WrapAsync(loginUser));
authRouter.post("/logout", logoutUser);
authRouter.post("/send-verify-otp", userAuth, WrapAsync(sendVerifyOtp));
authRouter.post("/verify-account", userAuth, WrapAsync(verifyAccount));
authRouter.get("/is-authenticated", userAuth, WrapAsync(isAuthenticated));
authRouter.post("/send-password-reset-otp", WrapAsync(sendPasswordResetOtp));
authRouter.post("/reset-password", WrapAsync(verifyPasswordResetOtp));

// --- ADD GOOGLE ROUTES HERE ---

// 1. Initiates the Google OAuth flow
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// 2. Google redirects here after successful authentication
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleAuthCallback,
);

export default authRouter;
