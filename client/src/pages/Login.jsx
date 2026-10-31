import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, isLoggedIn, setIsLoggedIn, getUserData } =
    useContext(AppContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    console.log(`${state}, ${isLoggedIn}`);
  }, [state, isLoggedIn]);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      if (state === "Sign Up") {
        const { data } = await axios.post(
          backendUrl + "/api/auth/register",
          {
            name,
            email,
            password,
          },
          {
            withCredentials: true,
          },
        );

        if (data.success) {
          setIsLoggedIn(true);
          await getUserData(); // Fetch user data after successful registration
          navigate("/");
          toast.success("Account created successfully");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/auth/login",
          {
            email,
            password,
          },
          {
            withCredentials: true,
          },
        );

        if (data.success) {
          setIsLoggedIn(true);
          await getUserData(); // Fetch user data after successful login
          navigate("/");
          toast.success("Logged in successfully");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const googleAuthHandler = () => {
    // Redirects the browser directly to your backend's Google OAuth route.
    // This allows the backend to forward the user to the actual Google login screen.
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true }); // Redirect to home if already logged in
    }
  }, [isLoggedIn]);

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400">
      <img
        src={assets.logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-sm text-indigo-300">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>

        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create Your Account"
            : "Login To Your Account"}
        </p>

        <form action="" onSubmit={onSubmitHandler}>
          {/* Full Name */}
          {state === "Sign Up" && (
            <div className="flex items-center gap-3 mb-4 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
              <img src={assets.person_icon} alt="" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="bg-transparent outline-none"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
          )}

          {/* Email */}
          <div className="flex items-center gap-3 mb-4 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.mail_icon} alt="" />
            <input
              type="email"
              placeholder="Enter Email"
              required
              className="bg-transparent outline-none"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          {/* Password */}
          <div className="flex items-center gap-3 mb-4 w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.lock_icon} alt="" />
            <input
              type="password"
              placeholder="Enter Password"
              required
              className="bg-transparent outline-none"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          {/* Forgot Password */}
          {state === "Login" && (
            <p
              className="mb-4 text-indigo-500 cursor-pointer"
              onClick={() => navigate("/reset-password", { replace: true })}
            >
              Forgot Password?
            </p>
          )}
          <br />

          <button className="w-full py-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-900 hover:from-indigo-600 hover:to-indigo-950 text-white font-medium cursor-pointer">
            {state === "Sign Up" ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* --- Google Authentication Section --- */}
        <div className="mt-6 flex items-center justify-center space-x-2">
          <span className="h-px w-full bg-gray-600"></span>
          <span className="text-gray-400 font-medium text-xs uppercase">
            Or
          </span>
          <span className="h-px w-full bg-gray-600"></span>
        </div>

        <button
          onClick={googleAuthHandler}
          className="mt-4 w-full py-2.5 rounded-full bg-white text-gray-800 hover:bg-gray-100 font-medium flex items-center justify-center gap-3 cursor-pointer transition-colors"
        >
          {/* Inline SVG for Google Logo */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
        {/* --------------------------------------- */}

        {/* Already Have An Account */}
        {state === "Sign Up" && (
          <p className="text-gray-400 text-center text-sx mt-6">
            Already Have An Account?{" "}
            <span
              className="underline text-blue-400 cursor-pointer"
              onClick={() => setState("Login")}
            >
              Login Here
            </span>
          </p>
        )}
        {state === "Login" && (
          <p className="text-gray-400 text-center text-sx mt-6">
            Don't Have An Account?{" "}
            <span
              className="underline text-blue-400 cursor-pointer"
              onClick={() => setState("Sign Up")}
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
