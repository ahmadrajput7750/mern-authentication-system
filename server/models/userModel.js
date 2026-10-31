import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    // REMOVED required, minlength, and default: ""
  },
  googleId: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  verifyOtp: {
    type: String,
    default: "",
  },
  verifyOtpExpiresAt: {
    type: Number,
    default: 0,
  },
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  passwordResetOtp: {
    type: String,
    default: "",
  },
  passwordResetOtpExpiresAt: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
