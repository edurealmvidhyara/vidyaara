import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authFunction, clearError, auth } from "../../Redux/login/action";
import authService from "../../services/authService";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const Signup = () => {
  const [userdata, setUser] = useState({
    fullName: "",
    email: "",
    password: "",
    userType: "student",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState("");
  const [signupError, setSignupError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const otpRefs = useRef([]);

  const { user, loading, error } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user?.user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...userdata, [name]: value });

    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }

    // Check password strength
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength("");
    } else if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("strong");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!userdata.fullName.trim() || userdata.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters long";
    }

    if (!userdata.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userdata.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!userdata.password) {
      errors.password = "Password is required";
    } else if (userdata.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    setSignupLoading(true);
    const res = await authService.signup({
      fullName: userdata.fullName,
      email: userdata.email,
      password: userdata.password,
      role: "student",
    });
    setSignupLoading(false);
    if (res.success) {
      setSignupError("");
      // Store user in Redux and redirect to home
      if (res.data?.user && res.data?.token) {
        dispatch(auth({ user: res.data.user, token: res.data.token }));
      }
      navigate("/");
    } else {
      setSignupError(res.message || "Signup failed. Please try again.");
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const clean = value.replace(/\D/g, "");
    const next = [...otp];
    next[index] = clean;
    setOtp(next);
    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData("text");
    const digits = (text || "").replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length) {
      const next = ["", "", "", "", "", ""];
      for (let i = 0; i < digits.length; i++) next[i] = digits[i];
      setOtp(next);
      const focusIndex = Math.min(digits.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    const code = otp.join("");
    if (code.length !== 6) {
      setSignupError("Enter the 6-digit code sent to your email");
      return;
    }
    setVerifying(true);
    const res = await authService.completeRegistration({
      email: userdata.email,
      otp: code,
    });
    setVerifying(false);
    if (res.success) {
      setSignupError("");
      // Store user in Redux like login does
      const token = res.data?.data?.token;
      const userResp = res.data?.data?.user;
      if (token && userResp) {
        dispatch(auth({ user: userResp, token }));
      }
      navigate("/");
    } else {
      setSignupError(res.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    // Re-init to resend OTP
    await handleSignup();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "strong":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  // Redirect if already logged in
  if (user?.user && localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img
            src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"
            alt="Vidhyara"
            className="h-10 mb-6"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign up and start learning
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Message (Redux) */}
          {error && (
            <Alert
              severity="error"
              className="mb-4"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleCloseError}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <AlertTitle>Signup Failed</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Error Message (Local) */}
          {signupError && (
            <Alert
              severity="error"
              className="mb-4"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setSignupError("")}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <AlertTitle>Signup Failed</AlertTitle>
              {signupError}
            </Alert>
          )}

          {/* Full Name Input */}
          <div className="mb-3">
            <input
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={userdata.fullName}
              disabled={signupLoading}
              className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
                fieldErrors.fullName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div className="mb-3">
            <input
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              name="email"
              type="email"
              placeholder="Email"
              value={userdata.email}
              disabled={signupLoading}
              className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <input
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              name="password"
              type="password"
              placeholder="Password"
              value={userdata.password}
              disabled={signupLoading}
              className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
            {passwordStrength && (
              <p className={`text-sm mt-1 ${getPasswordStrengthColor()}`}>
                Password strength: {passwordStrength}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="mb-4 text-xs text-gray-600">
            By signing up, you agree to our{" "}
            <Link to="#" className="text-purple-600 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link to="#" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </div>

          <button
            onClick={handleSignup}
            disabled={signupLoading}
            className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
          >
            {signupLoading ? (
              <CircularProgress size={24} style={{ color: "white" }} />
            ) : (
              "Sign up"
            )}
          </button>

          {/* Login Link */}
          <div className="mt-8 text-center text-sm">
            <p className="text-gray-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 hover:underline font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
