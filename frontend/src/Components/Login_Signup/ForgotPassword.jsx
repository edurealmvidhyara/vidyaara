import React, { useState } from "react";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { authService } from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleCloseError = () => {
    setError("");
  };

  if (success) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Check Your Email
          </h1>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Alert severity="success" className="mb-6">
              <AlertTitle>OTP Sent Successfully</AlertTitle>
              We've sent a 6-digit OTP to <strong>{email}</strong>. Please check
              your email and enter the OTP to reset your password.
            </Alert>

            <div className="text-center">
              <Link
                to={`/verify-otp?email=${encodeURIComponent(email)}`}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded font-medium hover:bg-purple-700 transition-colors duration-200 inline-block"
              >
                Enter OTP
              </Link>
            </div>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-700">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Try again
                </button>
              </p>
              <Link
                to="/login"
                className="text-purple-600 hover:underline font-medium block mt-2"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Forgot Password?
        </h1>
        <p className="text-gray-600 text-center">
          Enter your email address and we'll send you a 6-digit OTP to reset
          your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Message */}
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
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="mb-6">
              <input
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                className="w-full border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
            >
              {loading ? (
                <CircularProgress size={24} style={{ color: "white" }} />
              ) : (
                "Send OTP"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center text-sm">
            <Link
              to="/login"
              className="text-purple-600 hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
