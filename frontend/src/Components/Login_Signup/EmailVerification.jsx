import React, { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import CircularProgress from "@mui/material/CircularProgress";
import toast from "react-hot-toast";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (i, v) => {
    if (v.length > 1) return;
    const next = [...otp];
    next[i] = v.replace(/\D/g, "");
    setOtp(next);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (!email || code.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const res = await authService.completeRegistration({ email, otp: code });
    setLoading(false);
    if (res.success) {
      toast.success("Email verified. Welcome!");
      navigate("/");
    } else {
      toast.error(res.message || "Invalid code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center ">
          <img
            src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"
            alt="Vidhyara"
            className="h-10 mb-6"
          />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Verify your email
        </h1>
        <p className="text-gray-600 text-center">
          We sent a 6-digit code to {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={submit}>
            <div className="flex justify-center space-x-3 mb-6">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
            >
              {loading ? (
                <CircularProgress size={24} style={{ color: "white" }} />
              ) : (
                "Verify"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
