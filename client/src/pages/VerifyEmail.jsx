import React, { useContext, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  // 1. Pull in isAuthLoading
  const { backendUrl, isLoggedIn, userData, getUserData, isAuthLoading } =
    useContext(AppContext);
  const inputRefs = useRef([]);

  const navigate = useNavigate();

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

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otp = inputRefs.current.map((input) => input.value).join("");

      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-account",
        { otp },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    // 2. Guard Clause: Wait for the initial authentication check to complete
    if (isAuthLoading) {
      return;
    }

    // 3. Not logged in (Safely executes now that we know loading is done)
    if (!isLoggedIn) {
      toast.info("You need to be logged in to verify your email.");
      navigate("/login", { replace: true });
      return;
    }

    // 4. Logged in and ALREADY verified
    // Check that userData actually exists first, then check isAccountVerified
    if (isLoggedIn && userData && userData.isAccountVerified) {
      toast.info("Your account is already verified.");
      navigate("/", { replace: true });
      return;
    }
  }, [isLoggedIn, userData, isAuthLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />
      <form
        className="bg-slate-900 rounded-lg p-8 shadow-lg w-96 text-sm"
        onSubmit={onSubmitHandler}
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the verification code sent to your email.
        </p>
        <div className="flex justify-between mb-8">
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
        <button className="w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:opacity-90 transition-all cursor-pointer font-medium">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;
