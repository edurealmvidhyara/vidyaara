const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      first: {
        type: String,
        required: true,
        trim: true,
      },
      last: {
        type: String,
        required: true,
        trim: true,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    // Profile information
    bio: {
      type: String,
      maxlength: 5000,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },

    // Rich user profile (general fields, not only instructors)
    userProfile: {
      headline: { type: String, maxlength: 200, default: "" },
      biography: {
        content: { type: String, default: "" }, // markdown or html
        format: {
          type: String,
          enum: ["markdown", "html", "plain"],
          default: "markdown",
        },
      },
      language: { type: String, default: "English (US)" },
    },

    // Social links
    socialLinks: {
      website: { type: String, default: null },
      twitter: { type: String, default: null },
      linkedin: { type: String, default: null },
      youtube: { type: String, default: null },
      github: { type: String, default: null },
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
      tiktok: { type: String, default: null },
      x: { type: String, default: null },
    },

    // Privacy settings
    privacySettings: {
      showProfileToLoggedIn: { type: Boolean, default: true },
      showCoursesOnProfile: { type: Boolean, default: true },
    },
    isOnBoarded: {
      type: Boolean,
      default: false,
    },

    // Instructor-specific profile
    instructorProfile: {
      headline: { type: String, maxlength: 200, default: "" },
      expertise: [{ type: String }],
      payoutEmail: { type: String, default: null },
      totalStudents: { type: Number, default: 0 },
      totalCourses: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      isVerified: { type: Boolean, default: false },
      verificationDate: { type: Date, default: null },
    },

    // Student-specific data
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        lastAccessed: {
          type: Date,
          default: Date.now,
        },
        completedAt: { type: Date, default: null },
        certificateUrl: { type: String, default: null },
      },
    ],

    // Categories from enrolled courses (for recommendations)
    enrolledCategories: [{ type: String }],

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },

    // OTP for password reset
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },

    // Preferences
    preferences: {
      language: { type: String, default: "en" },
      timezone: { type: String, default: "UTC" },
    },

    // Analytics
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.name.first} ${this.name.last}`;
});

// Virtual for instructor display name
userSchema.virtual("instructorDisplayName").get(function () {
  if (this.role === "instructor") {
    return this.instructorProfile.headline || this.fullName;
  }
  return this.fullName;
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ "instructorProfile.isVerified": 1 });
userSchema.index({ "enrolledCourses.courseId": 1 });
userSchema.index({ "name.first": "text", "name.last": "text", email: "text" });

// Ensure virtuals are serialized
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
