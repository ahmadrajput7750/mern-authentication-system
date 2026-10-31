import React, { useContext, useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendVerificationOtp = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp",
        {},
        {
          withCredentials: true,
        },
      );
      if (data.success) {
        navigate("/verify-email");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img
        src={assets.logo}
        alt="Logo"
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />
      {userData ? (
        <div className="relative" ref={dropdownRef}>
          {/* Avatar Button (Triggers dropdown on click) */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            // Added overflow-hidden so the image respects the rounded full shape
            className="w-10 h-10 flex justify-center items-center bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 select-none overflow-hidden"
          >
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              userData.name[0].toUpperCase()
            )}
          </button>

          {/* Styled Unordered List Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden py-1 transition-all">
              <ul className="list-none m-0 p-0 text-sm text-gray-700">
                {!userData.isAccountVerified ? (
                  <li
                    className="px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer flex items-center transition-colors"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      sendVerificationOtp();
                    }}
                  >
                    Verify Email
                  </li>
                ) : (
                  <li className="px-4 py-2.5 text-emerald-600 font-medium bg-emerald-50/50 flex items-center gap-1.5 cursor-default">
                    Verified Account ✓
                  </li>
                )}

                <hr className="border-gray-100 my-1" />

                <li
                  className="px-4 py-2.5 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Login <img src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
