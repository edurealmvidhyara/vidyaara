import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Create axios instance for auth requests
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AUTH API ERROR:", error.response?.data || error.message);
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch {}
    }
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  // User Login
  login: async (credentials) => {
    try {
      const response = await authClient.post("/users/login", credentials);

      const { data } = response.data;
      const { token, user } = data;

      if (token && user) {
        // Store token in localStorage
        localStorage.setItem("token", token);
        return {
          success: true,
          data: { user, token },
          message: "Login successful",
        };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: authService.getErrorMessage(error, true),
        error: error.response?.data || error.message,
      };
    }
  },

  // User Signup
  signup: async (userData) => {
    try {
      const response = await authClient.post("/users/register", userData);
      const { data } = response.data || {};
      const { token, user } = data || {};
      if (token && user) {
        localStorage.setItem("token", token);
        return {
          success: true,
          data: { user, token },
          message: "Registration successful",
        };
      }
      return {
        success: false,
        message: "Invalid response from server",
        error: response.data,
      };
    } catch (error) {
      console.error("Signup init error:", error);
      return {
        success: false,
        message: authService.getErrorMessage(error, false),
        error: error.response?.data || error.message,
      };
    }
  },

  // OTP flow disabled: no-op to maintain UI compatibility
  completeRegistration: async () => {
    return {
      success: true,
      data: { success: true, message: "Registration completed" },
      message: "Registration completed",
    };
  },

  // Get User Profile
  getProfile: async () => {
    try {
      const response = await authClient.get("/users/profile");
      return {
        success: true,
        data: response.data,
        message: "Profile fetched successfully",
      };
    } catch (error) {
      console.error("❌ AUTH SERVICE - Profile fetch error:", error);

      return {
        success: false,
        message: "Failed to fetch profile",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update User Profile
  updateProfile: async (profileData) => {
    try {
      const response = await authClient.put("/users/profile", profileData);
      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        message: "Failed to update profile",
        error: error.response?.data || error.message,
      };
    }
  },

  // Change Password
  changePassword: async (passwordData) => {
    try {
      const response = await authClient.put(
        "/users/change-password",
        passwordData
      );
      return {
        success: true,
        data: response.data,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Password change error:", error);
      return {
        success: false,
        message: "Failed to change password",
        error: error.response?.data || error.message,
      };
    }
  },

  // Forgot Password - Send OTP
  forgotPassword: async (email) => {
    try {
      const response = await authClient.post("/users/forgot-password", {
        email,
      });
      return {
        success: true,
        data: response.data,
        message: "OTP sent to your email address",
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: authService.getErrorMessage(error, false),
        error: error.response?.data || error.message,
      };
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await authClient.post("/users/verify-otp", {
        email,
        otp,
      });
      return {
        success: true,
        data: response.data,
        message: "OTP verified successfully",
      };
    } catch (error) {
      console.error("Verify OTP error:", error);
      return {
        success: false,
        message: authService.getErrorMessage(error, false),
        error: error.response?.data || error.message,
      };
    }
  },

  // Reset Password
  resetPassword: async (resetData) => {
    try {
      const response = await authClient.post(
        "/users/reset-password",
        resetData
      );
      return {
        success: true,
        data: response.data,
        message: "Password reset successful",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: authService.getErrorMessage(error, false),
        error: error.response?.data || error.message,
      };
    }
  },

  // Verify Email
  verifyEmail: async (token) => {
    try {
      const response = await authClient.post("/users/verify-email", { token });
      return {
        success: true,
        data: response.data,
        message: "Email verified successfully",
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Failed to verify email",
        error: error.response?.data || error.message,
      };
    }
  },

  // Resend Verification Email
  resendVerificationEmail: async () => {
    try {
      const response = await authClient.post("/users/resend-verification");
      return {
        success: true,
        data: response.data,
        message: "Verification email sent",
      };
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        message: "Failed to send verification email",
        error: error.response?.data || error.message,
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      // Call logout endpoint if it exists
      await authClient.post("/users/logout");
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    } finally {
      // Token clearing is handled by Redux actions, not here

      return {
        success: true,
        message: "Logged out successfully",
      };
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  },

  // Get current user from token
  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
      };
    } catch (error) {
      console.error("Token parsing error:", error);
      return null;
    }
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Validation helpers
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password && password.length >= 6;
  },

  validateName: (name) => {
    return name && name.trim().length >= 2;
  },

  // Error message helper
  getErrorMessage: (error, isLogin = false) => {
    if (!error) return "Something went wrong. Please try again.";

    // Handle network errors
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      return "Unable to connect to the server. Please check your internet connection and try again.";
    }

    // Handle 404 errors (endpoint not found)
    if (error.response?.status === 404) {
      return "Service temporarily unavailable. Please try again later.";
    }

    // Handle 500 errors
    if (error.response?.status === 500) {
      return "Something went wrong on our end. Please try again later.";
    }

    const message = error.response?.data?.message || error.message || error;

    // Handle specific error cases with user-friendly messages
    switch (message.toLowerCase()) {
      case "invalid email or password":
        return "The email or password you entered is incorrect. Please check your credentials and try again.";

      case "user not found":
        return "No account found with this email address. Please check your email or sign up for a new account.";

      case "an account with this email already exists":
        return "An account with this email address already exists. Please try logging in instead.";

      case "email and password are required":
        return "Please fill in both email and password fields.";

      case "please provide a valid email address":
        return "Please enter a valid email address (e.g., user@example.com).";

      case "password must be at least 6 characters long":
        return "Password must be at least 6 characters long. Please choose a stronger password.";

      case "both first name and last name are required":
        return "Please provide both your first name and last name.";

      case "your account has been deactivated. please contact support.":
        return "Your account has been temporarily deactivated. Please contact our support team for assistance.";

      case "no account found with this email address":
        return "No account found with this email address. Please check your email or sign up for a new account.";

      case "otp has expired. please request a new one.":
        return "The OTP has expired. Please request a new one.";

      case "invalid otp. please check and try again.":
        return "Invalid OTP. Please check the code and try again.";

      case "no valid otp found. please request a new one.":
        return "No valid OTP found. Please request a new one.";

      case "email and otp are required":
        return "Please provide both email and OTP.";

      case "email, otp, and new password are required":
        return "Please fill in all required fields.";

      case "validation failed":
        return "Please check all fields and ensure they are filled out correctly.";

      case "internal server error":
      case "internal server error. please try again later.":
        return "We're experiencing technical difficulties. Please try again in a few moments.";

      case "network error":
        return "Unable to connect to our servers. Please check your internet connection and try again.";

      default:
        // If it's a validation error with specific field information
        if (message.includes("email") && message.includes("invalid")) {
          return "Please enter a valid email address.";
        }
        if (message.includes("password") && message.includes("short")) {
          return "Password is too short. Please use at least 6 characters.";
        }
        if (message.includes("name") && message.includes("required")) {
          return "Full name is required. Please enter your complete name.";
        }

        // Return the original message if it's already user-friendly
        return message;
    }
  },
};

// Export default for convenience
export default authService;
