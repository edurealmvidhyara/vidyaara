const mongoose = require("mongoose");

const qaSchema = new mongoose.Schema(
  {
    // Course this Q&A belongs to
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    // Question details
    question: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: {
        type: String,
        required: true,
        maxlength: 2000,
      },
      title: {
        type: String,
        maxlength: 200,
      },
      isAnonymous: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // Answers
    answers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 5000,
        },
        isInstructorAnswer: {
          type: Boolean,
          default: false,
        },
        isAccepted: {
          type: Boolean,
          default: false,
        },
        helpfulCount: {
          type: Number,
          default: 0,
        },
        notHelpfulCount: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Q&A metadata
    status: {
      type: String,
      enum: ["active", "resolved", "closed"],
      default: "active",
    },
    tags: [{ type: String }],
    viewCount: {
      type: Number,
      default: 0,
    },
    answerCount: {
      type: Number,
      default: 0,
    },

    // Moderation
    isReported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      maxlength: 500,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for question summary
qaSchema.virtual("questionSummary").get(function () {
  return {
    questionId: this._id,
    title: this.question.title,
    answerCount: this.answers.length,
    status: this.status,
    createdAt: this.question.createdAt,
  };
});

// Virtual for most recent answer
qaSchema.virtual("latestAnswer").get(function () {
  if (this.answers.length === 0) return null;
  return this.answers[this.answers.length - 1];
});

// Virtual for accepted answer
qaSchema.virtual("acceptedAnswer").get(function () {
  return this.answers.find((answer) => answer.isAccepted);
});

// Indexes for better query performance
qaSchema.index({ courseId: 1, createdAt: -1 });
qaSchema.index({ "question.userId": 1 });
qaSchema.index({ status: 1 });
qaSchema.index({ "answers.userId": 1 });
qaSchema.index({ isReported: 1 });
qaSchema.index({ "question.text": "text", "answers.text": "text" });

// Ensure virtuals are serialized
qaSchema.set("toJSON", { virtuals: true });
qaSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("QA", qaSchema);
