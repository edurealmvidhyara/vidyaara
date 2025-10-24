import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authFunction, clearError } from "../../Redux/login/action";
import CircularProgress from "@mui/material/CircularProgress";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const [userdata, setUserdata] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((store) => store.auth);

  // Clear errors when component mounts or when navigating from signup
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserdata({ ...userdata, [name]: value });

    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!userdata.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userdata.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!userdata.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      const URL = "/api/users/login";
      dispatch(authFunction(userdata, URL));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleCloseError = () => {
    dispatch(clearError());
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
          Log in to your Vidhyara account
        </h1>
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
              <AlertTitle>Login Failed</AlertTitle>
              {error}
            </Alert>
          )}

          {/* Email Input */}
          <div className="mb-3">
            <input
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              name="email"
              type="email"
              placeholder="Email"
              value={userdata.email}
              className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                fieldErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6 relative">
            <input
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={userdata.password}
              className={`w-full border rounded px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                fieldErrors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
          >
            {loading ? (
              <CircularProgress size={24} style={{ color: "white" }} />
            ) : (
              "Log in"
            )}
          </button>

          {/* Sign up */}
          <div className="mt-8 text-center text-sm">
            <p className="text-gray-700">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-purple-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
            <Link
              to="/forgot-password"
              className="text-purple-600 hover:underline font-medium block mt-2"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
