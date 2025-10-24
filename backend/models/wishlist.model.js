const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    // User who owns the wishlist
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Wishlisted courses
    courses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        // Course snapshot for display
        courseSnapshot: {
          title: { type: String },
          subtitle: { type: String },
          thumbnailUrl: { type: String },
          price: { type: Number },
          originalPrice: { type: Number },
          instructorName: { type: String },
          averageRating: { type: Number },
          totalStudents: { type: Number },
        },
      },
    ],

    // Wishlist metadata
    isPublic: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: "My Wishlist",
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for wishlist summary
wishlistSchema.virtual("wishlistSummary").get(function () {
  return {
    courseCount: this.courses.length,
    totalValue: this.courses.reduce(
      (sum, item) => sum + (item.courseSnapshot.price || 0),
      0
    ),
    lastAdded:
      this.courses.length > 0
        ? this.courses[this.courses.length - 1].addedAt
        : null,
  };
});

// Virtual for formatted total value
wishlistSchema.virtual("formattedTotalValue").get(function () {
  const totalValue = this.courses.reduce(
    (sum, item) => sum + (item.courseSnapshot.price || 0),
    0
  );
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalValue);
});

// Indexes for better query performance
wishlistSchema.index({ "courses.courseId": 1 });
wishlistSchema.index({ isPublic: 1 });

// Ensure virtuals are serialized
wishlistSchema.set("toJSON", { virtuals: true });
wishlistSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
