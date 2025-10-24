require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { profileImageUpload } = require("../middlewares/upload");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const PendingUser = require("../models/pendingUser.model");
const { authenticate } = require("../middlewares/authenticate");
const emailService = require("../utils/emailService");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

// Test endpoint for forgot password routes
router.get("/forgot-password-test", (req, res) => {
  res.json({
    message: "Forgot password routes are working",
    timestamp: new Date(),
  });
});

// Register new user (student or instructor)
router.post("/register", async (req, res) => {
  // Keep existing immediate register for backward compatibility
  try {
    const { fullName, name, email, password, role = "student" } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Handle name field - support both fullName and name object
    let firstName = "";
    let lastName = "";

    if (name && name.first && name.last) {
      // New format: { name: { first: "John", last: "Doe" } }
      firstName = name.first.trim();
      lastName = name.last.trim();
    } else if (fullName) {
      // Legacy format: { fullName: "John Doe" }
      const nameParts = fullName.trim().split(" ");
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    } else {
      return res.status(400).json({
        success: false,
        message:
          "Name is required. Please provide either 'name' object with 'first' and 'last' properties, or 'fullName' string",
      });
    }

    // Validate name fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Both first name and last name are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user data with new schema structure
    const userData = {
      name: {
        first: firstName,
        last: lastName,
      },
      email: email.toLowerCase(),
      passwordHash,
      role: role,
    };

    // Add role-specific initial data
    if (role === "instructor") {
      userData.instructorProfile = {
        headline: "",
        expertise: [],
        payoutEmail: null,
        totalStudents: 0,
        totalCourses: 0,
        averageRating: 0,
        totalReviews: 0,
        totalEarnings: 0,
        isVerified: false,
        verificationDate: null,
      };
    } else {
      userData.enrolledCourses = [];
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data without sensitive information
    const userResponse = {
      _id: user._id,
      name: user.name,
      fullName: user.fullName, // Virtual field
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      instructorProfile: user.instructorProfile,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

// New: Begin signup with OTP (create pending user and send OTP)
/*
router.post("/register-init", async (req, res) => {
  // OTP-based registration disabled temporarily: direct registration via /register is enabled for all roles
  try {
    const { fullName, name, email, password, role = "student" } = req.body;
    // ... existing code was here ...
  } catch (error) {
    // ... existing error handling ...
  }
});
*/

// Complete signup after OTP verification
/*
router.post("/register-complete", async (req, res) => {
  // OTP-based registration disabled temporarily: direct registration via /register is enabled for all roles
  try {
    const { email, otp } = req.body;
    // ... existing code was here ...
  } catch (error) {
    // ... existing error handling ...
  }
});
*/

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data without sensitive information
    const userResponse = {
      _id: user._id,
      name: user.name,
      fullName: user.fullName, // Virtual field
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      instructorProfile: user.instructorProfile,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

// Get user profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    // The authenticated user object IS the user, so just return it
    // No need to query again since authenticate middleware already fetched the user
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// (moved lower) Public profile by id

// Update user profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    console.log("reached profile page");
    const authedUser = req?.user;
    const userId = authedUser?._id;

    const {
      name,
      userProfile,
      socialLinks,
      privacySettings,
      bio, // legacy support
      profileImage, // legacy support
    } = req.body || {};

    const updateData = {};

    // Name
    if (name?.first !== undefined) updateData["name.first"] = name.first;
    if (name?.last !== undefined) updateData["name.last"] = name.last;

    // Simple/legacy fields
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // User profile
    if (userProfile) {
      if (userProfile.headline !== undefined)
        updateData["userProfile.headline"] = userProfile.headline;
      if (userProfile.language !== undefined)
        updateData["userProfile.language"] = userProfile.language;
      if (userProfile.biography) {
        if (userProfile.biography.content !== undefined)
          updateData["userProfile.biography.content"] =
            userProfile.biography.content;
        if (userProfile.biography.format !== undefined)
          updateData["userProfile.biography.format"] =
            userProfile.biography.format;
      }
    }

    // Social links
    if (socialLinks) {
      const linkKeys = [
        "website",
        "facebook",
        "instagram",
        "linkedin",
        "tiktok",
        "x",
        "youtube",
      ];
      linkKeys.forEach((k) => {
        if (socialLinks[k] !== undefined) {
          updateData[`socialLinks.${k}`] = socialLinks[k];
        }
      });
    }

    // Privacy settings
    if (privacySettings) {
      if (privacySettings.showProfileToLoggedIn !== undefined)
        updateData["privacySettings.showProfileToLoggedIn"] =
          privacySettings.showProfileToLoggedIn;
      if (privacySettings.showCoursesOnProfile !== undefined)
        updateData["privacySettings.showCoursesOnProfile"] =
          privacySettings.showCoursesOnProfile;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all instructors (for student browsing)
router.get("/instructors", async (req, res) => {
  try {
    const instructors = await User.find({
      role: "instructor",
      isActive: true,
    }).select("fullName bio profileImage instructorProfile");

    res.json({ instructors });
  } catch (error) {
    console.error("Get instructors error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get instructor profile by ID
router.get("/instructor/:id", async (req, res) => {
  try {
    const instructor = await User.findOne({
      _id: req.params.id,
      role: "instructor",
      isActive: true,
    }).select("-password");

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    res.json({ instructor });
  } catch (error) {
    console.error("Get instructor error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark instructor as onboarded
router.put("/onboard", authenticate, async (req, res) => {
  try {
    const userId = req.user?._id;
    const { onboardingAnswers } = req.body;

    // Update user with onboarding data
    const updateData = {
      isOnBoarded: true,
      "instructorProfile.onboardingAnswers": onboardingAnswers,
    };

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Onboarding completed successfully",
      user,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Wishlist endpoints
router.post("/wishlist/:courseId", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId).select("_id status");
    if (!course || course.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Course not found or not published",
      });
    }

    // Check if already in wishlist
    if (user.wishlist && user.wishlist.includes(courseId)) {
      return res.json({
        success: true,
        message: "Course already in wishlist",
      });
    }

    // Add to wishlist
    user.wishlist = user.wishlist || [];
    user.wishlist.push(courseId);
    await user.save();

    res.json({
      success: true,
      message: "Added to wishlist successfully",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/wishlist/:courseId", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    // Remove from wishlist
    user.wishlist = user.wishlist || [];
    user.wishlist = user.wishlist.filter(
      (id) => String(id) !== String(courseId)
    );
    await user.save();

    res.json({
      success: true,
      message: "Removed from wishlist successfully",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/wishlist", authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Get wishlist with course details
    const wishlistCourses = await Course.find({
      _id: { $in: user.wishlist || [] },
      status: "published",
    }).select(
      "_id title subtitle description thumbnailUrl category rating totalStudents totalLectures duration"
    );

    res.json({
      success: true,
      wishlist: wishlistCourses,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/wishlist/check/:courseId", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const isInWishlist =
      user.wishlist &&
      user.wishlist.some((id) => String(id) === String(courseId));

    res.json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Enroll in a course
router.post("/courses/:courseId/enroll", authenticate, async (req, res) => {
  try {
    const user = req.user;
    console.log("hits api");
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select(
      "_id category status"
    );
    if (!course || course.status !== "published") {
      return res
        .status(404)
        .json({ success: false, message: "Course not found or not published" });
    }

    const already = (user.enrolledCourses || []).some(
      (c) => String(c.courseId) === String(courseId)
    );
    if (already) {
      return res.json({ success: true, message: "Already enrolled" });
    }

    user.enrolledCourses = user.enrolledCourses || [];
    user.enrolledCourses.push({
      courseId: course._id,
      progress: 0,
      lastAccessed: new Date(),
    });

    // Track enrolled categories for recommendations
    user.enrolledCategories = Array.from(
      new Set(
        [...(user.enrolledCategories || []), course.category].filter(Boolean)
      )
    );

    await user.save();

    // increment course student count
    await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });

    res.json({ success: true, message: "Enrolled successfully" });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Unenroll from a course (decrement totalStudents)
router.delete("/courses/:courseId/enroll", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select("_id");
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const beforeCount = (user.enrolledCourses || []).length;
    user.enrolledCourses = (user.enrolledCourses || []).filter(
      (c) => String(c.courseId) !== String(courseId)
    );

    const afterCount = user.enrolledCourses.length;
    const removed = afterCount < beforeCount;

    await user.save();

    if (removed) {
      await Course.findByIdAndUpdate(course._id, {
        $inc: { totalStudents: -1 },
      });
    }

    res.json({ success: true, removed });
  } catch (error) {
    console.error("Unenroll error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get enrolled courses
router.get("/enrolled-courses", authenticate, async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Get enrolled course IDs from user
    const enrolledCourseIds = (user.enrolledCourses || []).map(
      (e) => e.courseId
    );

    if (enrolledCourseIds.length === 0) {
      return res.json({
        success: true,
        courses: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    // Fetch course details
    const courses = await Course.find({
      _id: { $in: enrolledCourseIds },
      status: "published",
    })
      .select(
        "_id title subtitle description thumbnailUrl category rating totalStudents totalLectures duration instructorId"
      )
      .populate("instructorId", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses,
      total: enrolledCourseIds.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Upload profile picture
router.post(
  "/upload-avatar",
  authenticate,
  profileImageUpload,
  async (req, res) => {
    try {
      const user = req.user;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only JPEG, PNG, and GIF images are allowed",
        });
      }

      // Validate file size (max 5MB)
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Image size must be less than 5MB",
        });
      }

      // Use Cloudinary URL from multer-storage-cloudinary
      const imageUrl = req.file?.path;
      if (!imageUrl) {
        return res.status(500).json({
          success: false,
          message: "Upload failed: image URL missing",
        });
      }
      user.profilePicture = imageUrl;
      await user.save();

      res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          imageUrl,
        },
      });
    } catch (error) {
      console.error("Upload profile picture error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Forgot Password - Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    console.log("Forgot password endpoint hit");
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration (30 minutes from now)
    const otpExpires = new Date(Date.now() + 30 * 60 * 1000);

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email service (uses SMTP if configured, else logs)
    console.log(`OTP for ${email}: ${otp}`);
    const emailResult = await emailService.sendOTPEmail(email, otp);
    if (!emailResult.success) {
      console.error("Email service failed:", emailResult.message);
    }

    res.json({
      success: true,
      message: "OTP sent to your email address",
      // Remove this in production - only for development
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate required fields
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "No valid OTP found. Please request a new one.",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpires) {
      // Clear expired OTP
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // OTP is valid - don't clear it yet, keep it for password reset
    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate required fields
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "No valid OTP found. Please request a new one.",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpires) {
      // Clear expired OTP
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.passwordHash = passwordHash;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

// Public profile by id (safe fields only) - keep at the very bottom to avoid intercepting other routes
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select(
        "-passwordHash -emailVerificationToken -passwordResetToken -passwordResetExpires"
      )
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("Get public profile error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
