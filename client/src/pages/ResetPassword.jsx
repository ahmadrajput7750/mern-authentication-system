import React, { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { backendUrl, isLoggedIn, isAuthLoading } = useContext(AppContext);
  const navigate = useNavigate();

  // State management for the two-step form
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  // References for the 6-digit OTP input
  const inputRefs = useRef([]);

  // OTP Input Handlers
  const handleInput = (e, index) => {
    if (e.target.value.length === 1 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && e.target.value === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const pasteArray = pasteData.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  // Step 1: Submit Email to get the OTP
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-password-reset-otp",
        { email },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true); // Switch to the OTP & New Password form
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Step 2: Submit OTP and New Password
  const onSubmitOTPAndNewPassword = async (e) => {
    e.preventDefault();
    try {
      const otp = inputRefs.current.map((input) => input.value).join("");

      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        {
          email,
          otp,
          password: newPassword, // Successfully mapped to backend req.body
        },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // PROTECTED ROUTE LOGIC
  useEffect(() => {
    // 1. Wait for the initial authentication check to complete
    if (isAuthLoading) {
      return;
    }

    // 2. If the user is ALREADY logged in, they shouldn't be here. Kick them to home.
    if (isLoggedIn) {
      toast.info("You are already logged in. Logout to reset your password.");
      navigate("/", { replace: true });
      return;
    }

    // If they are NOT logged in, do nothing! Let them reset their password.
  }, [isLoggedIn, isAuthLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* Conditionally render Form 1 or Form 2 based on isEmailSent state */}
      {!isEmailSent ? (
        // FORM 1: SEND EMAIL
        <form
          className="bg-slate-900 rounded-lg p-8 shadow-lg w-96 text-sm"
          onSubmit={onSubmitEmail}
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your registered email address to receive a verification code.
          </p>

          <div className="mb-8">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#333a5c] text-white rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:opacity-90 transition-all cursor-pointer font-medium">
            Send Verification Code
          </button>
        </form>
      ) : (
        // FORM 2: VERIFY OTP AND SET NEW PASSWORD
        <form
          className="bg-slate-900 rounded-lg p-8 shadow-lg w-96 text-sm"
          onSubmit={onSubmitOTPAndNewPassword}
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Create New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your email and your new password.
          </p>

          {/* 6-Digit OTP Inputs */}
          <div className="flex justify-between mb-6">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  required
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-12 bg-[#333a5c] text-white text-center text-xl rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ))}
          </div>

          {/* Email Input (Disabled/Read-Only Context) */}
          <div className="mb-8">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
              className="w-full px-4 py-3 bg-[#333a5c] text-slate-400 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 cursor-not-allowed"
            />
          </div>

          {/* New Password Input */}
          <div className="mb-8">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#333a5c] text-white rounded-md outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:opacity-90 transition-all cursor-pointer font-medium">
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
