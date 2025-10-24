import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authFunction, clearError, AUTH } from "../../Redux/login/action";
import { Link, Navigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { authService } from "../../services/authService";

const Instructor = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    userType: "instructor",
    subscribe: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [signupLoading, setSignupLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [serverError, setServerError] = useState("");

  const otpRefs = useRef([]);

  const { user, loading, error } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters long";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCloseError = () => {
    dispatch(clearError());
    setServerError("");
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setSignupLoading(true);
    setServerError("");

    try {
      const result = await authService.signup({
        ...form,
        role: "instructor",
      });

      if (result.success) {
        // Immediately authenticate and navigate to onboarding
        const { user, token } = result.data || {};
        if (user && token) {
          localStorage.setItem("token", token);
          dispatch({ type: AUTH, payload: { user, token } });
        }
        window.location.href = "/instructor/onboarding";
      } else {
        setServerError(result.message);
      }
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next field
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setServerError("Please enter the complete 6-digit code");
      return;
    }

    setVerifying(true);
    setServerError("");

    try {
      const result = await authService.completeRegistration({
        email: form.email,
        otp: otpString,
      });

      if (result.success) {
        const { user, token } = result.data.data;
        localStorage.setItem("token", token);
        // Dispatch auth action directly instead of calling authFunction
        dispatch({ type: AUTH, payload: { user, token } });
      } else {
        setServerError(result.message);
      }
    } catch (error) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = () => {
    handleSignup();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  // Redirect if already logged in
  if (user?.user && localStorage.getItem("token")) {
    return <Navigate to="/instructor/onboarding" />;
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
          Come teach with us
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Become an instructor and change lives — including your own
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Message */}
          {(error || serverError) && (
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
              <AlertTitle>
                {showOtp ? "Verification Failed" : "Signup Failed"}
              </AlertTitle>
              {serverError || error}
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
              value={form.fullName}
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
              value={form.email}
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
          <div className="mb-4">
            <input
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
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
          </div>

          {/* OTP Input Section hidden (OTP disabled) */}

          {/* Subscribe Checkbox */}
          {!showOtp && (
            <div className="mb-6 flex items-start">
              <input
                type="checkbox"
                name="subscribe"
                checked={form.subscribe}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
              />
              <label className="ml-2 text-sm text-gray-600">
                Send me special offers, personalized recommendations, and
                learning tips.
              </label>
            </div>
          )}

          {/* Terms */}
          {!showOtp && (
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
          )}

          {/* Signup Button */}
          <button
            onClick={onSubmit}
            disabled={loading || signupLoading}
            className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
          >
            {loading || signupLoading || verifying ? (
              <CircularProgress size={24} style={{ color: "white" }} />
            ) : showOtp ? (
              "Verify Email"
            ) : (
              "Sign up"
            )}
          </button>

          {/* Already have account */}
          <div className="mt-6 text-center text-sm">
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

export default Instructor;
