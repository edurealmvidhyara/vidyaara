const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Basic instructor information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
      default: null,
    },

    // Instructor statistics
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
    },

    // Instructor bio
    bio: {
      short: {
        type: String,
        maxlength: 200,
        required: true,
      },
      full: {
        type: String,
        maxlength: 2000,
        required: true,
      },
      isExpanded: {
        type: Boolean,
        default: false,
      },
    },

    // Social links
    socialLinks: {
      website: { type: String, default: null },
      twitter: { type: String, default: null },
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      youtube: { type: String, default: null },
    },

    // Expertise and skills
    expertise: [{ type: String }],

    // Achievements and credentials
    achievements: [{ type: String }],

    // Teaching style and approach
    teachingStyle: {
      approach: { type: String, default: "" },
      focus: { type: String, default: "" },
      features: [{ type: String }],
    },

    // Instructor verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: Date,
      default: null,
    },

    // Instructor status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Additional metadata
    languages: [{ type: String }],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        date: { type: Date },
        credentialId: { type: String },
      },
    ],

    // Analytics
    totalEarnings: {
      type: Number,
      default: 0,
    },
    monthlyStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
instructorSchema.index({ totalStudents: -1 });
instructorSchema.index({ isVerified: 1 });
instructorSchema.index({ isFeatured: 1 });
instructorSchema.index({ name: "text", title: "text" });

// Ensure virtuals are serialized
instructorSchema.set("toJSON", { virtuals: true });
instructorSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Instructor", instructorSchema);
