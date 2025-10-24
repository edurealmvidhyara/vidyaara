require("dotenv").config();
const express = require("express");
const router = express.Router();
const Course = require("../models/course.model");
const Instructor = require("../models/instructor.model");
const Category = require("../models/category.model");
const { docUpload } = require("../middlewares/upload");
const { authenticate } = require("../middlewares/authenticate");
const {
  thumbnailUpload,
  carouselUpload,
  handleUploadError,
} = require("../middlewares/upload");
const { deleteFromCloudinary } = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");
router.post("/:id/rate", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { value, comment } = req.body;

    // Only students can rate courses
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can rate courses",
      });
    }

    if (!value || value < 1 || value > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1-5" });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Check if user is enrolled in the course by checking user's enrolledCourses
    const User = require("../models/user.model");
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isEnrolled =
      user.enrolledCourses &&
      user.enrolledCourses.some(
        (enrollment) => String(enrollment.courseId) === String(id)
      );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in the course to rate it",
      });
    }

    // Upsert user rating
    const existingRatingIndex = course.ratings.findIndex(
      (r) => String(r.userId) === String(user._id)
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      const oldValue = course.ratings[existingRatingIndex].value;
      course.ratingSum = (course.ratingSum || 0) - oldValue + value;
      course.ratings[existingRatingIndex] = {
        userId: user._id,
        value,
        comment: comment || "",
        createdAt: new Date(),
      };
    } else {
      // Add new rating
      course.ratings.push({
        userId: user._id,
        value,
        comment: comment || "",
        createdAt: new Date(),
      });
      course.ratingSum = (course.ratingSum || 0) + value;
      course.totalRatings = (course.totalRatings || 0) + 1;
    }

    // Calculate average rating
    course.rating =
      course.totalRatings > 0 ? course.ratingSum / course.totalRatings : 0;
    await course.save();

    res.json({
      success: true,
      message: "Rating saved successfully",
      data: {
        rating: course.rating,
        totalRatings: course.totalRatings,
        userRating: value,
        comment: comment || "",
      },
    });
  } catch (error) {
    console.error("Rate course error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get user's rating for a course
router.get("/:id/my-rating", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find user's rating
    const userRating = course.ratings.find(
      (r) => String(r.userId) === String(req.user.userId)
    );

    res.json({
      success: true,
      data: userRating || null,
    });
  } catch (error) {
    console.error("Get user rating error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user rating",
      error: error.message,
    });
  }
});

// Home categories (before parameterized routes)
router.get("/categories", async (req, res) => {
  try {
    let categories = await Category.find({ isActive: true, level: 1 })
      .sort({ sortOrder: 1, title: 1 })
      .select("title slug icon image")
      .lean();

    if (!categories || categories.length === 0) {
      const distinct = await Course.distinct("category", {
        status: "published",
      });
      categories = distinct.filter(Boolean).map((title) => ({
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
      }));
    }

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Search suggestions (before parameterized routes)
router.get("/search/suggestions", async (req, res) => {
  try {
    const { q = "", limit = 8 } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({ success: true, data: [] });
    }
    const regex = new RegExp(q.trim(), "i");
    const courses = await Course.find({
      status: "published",
      $or: [
        { title: regex },
        { subtitle: regex },
        { description: regex },
        { keywords: regex },
      ],
    })
      .select("title subtitle category thumbnailUrl _id")
      .limit(parseInt(limit))
      .lean();

    const suggestions = courses.map((c) => ({
      id: c._id,
      title: c.title,
      subtitle: c.subtitle,
      category: c.category,
      thumbnail: c.thumbnailUrl,
    }));

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get course basic data (for sidebar and header)
router.get("/:id/basic", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("instructorId", "name")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get current user ID from token if authenticated
    let currentUserId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace("Bearer ", "");
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (error) {
        // Token is invalid or expired, but we still return course data
        console.log("Invalid token for course basic data");
      }
    }

    // Process notes to include full URLs
    const processedNotes = (course.notes || []).map((note) => {
      if (note.fileUrl && note.fileUrl.startsWith("/uploads/")) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        return {
          ...note,
          fileUrl: `${baseUrl}${note.fileUrl}`,
        };
      }
      return note;
    });

    const basicData = {
      _id: course._id,
      title: course.title,
      headline: course.subtitle,
      description: course.description,
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      language: course.language,
      thumbnail: course.thumbnailUrl,
      status: course.status,
      rating: course.rating || 0,
      total_ratings: course.totalRatings || 0,
      total_students: course.totalStudents || 0,
      learningObjectives: course.learningObjectives || [],
      requirements: course.requirements || [],
      targetAudience: course.targetAudience || [],
      notes: processedNotes,
      instructorId: course.instructorId?._id,
      currentUserId: currentUserId,
      instructor: {
        name: course.instructorId?.name
          ? `${course.instructorId.name.first} ${course.instructorId.name.last}`
          : "Unknown Instructor",
      },
      visible_instructors: [
        {
          title: course.instructorId?.name
            ? `${course.instructorId.name.first} ${course.instructorId.name.last}`
            : "Unknown Instructor",
        },
      ],
    };

    res.json({
      success: true,
      data: basicData,
    });
  } catch (error) {
    console.error("Get course basic data error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get course detailed data (for main content)
router.get("/:id/detailed", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("instructorId", "name")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const detailedData = {
      primary_category: { title: course.category },
      primary_subcategory: { title: course.subcategory },
      context_info: { label: { title: course.category } },
      bestseller_badge_content: {
        badge_text: course.totalStudents > 100000 ? "Bestseller" : "",
      },
      last_update_date: course.updatedAt
        ? course.updatedAt.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      caption_languages: [course.language || "English"],
      description: course.description,
      requirements: course.requirements || [],
      learningObjectives: course.learningObjectives || [],
      level: course.level,
      duration: course.duration || 0,
      totalLectures: course.totalLectures || 0,
    };

    res.json({
      success: true,
      data: detailedData,
    });
  } catch (error) {
    console.error("Get course detailed data error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get course curriculum/sections
router.get("/:id/curriculum", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Return basic curriculum structure
    const curriculumData = {
      sections: course.sections || [],
      totalLectures: course.totalLectures || 0,
      totalDuration: course.duration || 0,
    };

    res.json({
      success: true,
      data: curriculumData,
    });
  } catch (error) {
    console.error("Get course curriculum error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get course instructor data
router.get("/:id/instructor", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("instructorId", "name")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get instructor profile
    const instructor = await Instructor.findOne({
      user: course.instructorId._id,
    }).lean();

    const instructorData = {
      name: course.instructorId?.name
        ? `${course.instructorId.name.first} ${course.instructorId.name.last}`
        : "Unknown Instructor",
      title: instructor?.title || "Expert Instructor",
      bio:
        instructor?.bio?.full ||
        "Experienced instructor passionate about teaching.",
      image: instructor?.profileImage || null,
      totalStudents: instructor?.totalStudents || 0,
      totalCourses: instructor?.totalCourses || 1,
      socialLinks: instructor?.socialLinks || {},
    };

    res.json({
      success: true,
      data: instructorData,
    });
  } catch (error) {
    console.error("Get course instructor error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get recommended courses (students also bought)
router.get("/:id/recommended", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    const currentCourse = await Course.findById(id).lean();

    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Find courses in the same category, excluding the current course
    const recommendedCourses = await Course.find({
      _id: { $ne: id },
      category: currentCourse.category,
      status: "published",
      isActive: true,
    })
      .populate("instructorId", "name")
      .limit(parseInt(limit))
      .lean();

    // Transform to match expected format
    const transformedCourses = recommendedCourses.map((course) => ({
      id: course._id,
      title: course.title,
      headline: course.subtitle,
      instructor: {
        name: course.instructorId?.name
          ? `${course.instructorId.name.first} ${course.instructorId.name.last}`
          : "Unknown Instructor",
      },
      rating: course.rating || 0,
      totalRatings: course.totalRatings || 0,
      totalStudents: course.totalStudents || 0,
      price: course.price || 0,
      originalPrice: course.originalPrice || course.price,
      thumbnail: course.thumbnailUrl,
      category: course.category,
      level: course.level,
    }));

    res.json({
      success: true,
      data: transformedCourses,
    });
  } catch (error) {
    console.error("Get recommended courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get related topics
router.get("/:id/related-topics", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Generate related topics based on course category and subcategory
    const relatedTopics = [
      course.category,
      course.subcategory,
      course.topic,
    ].filter(Boolean);

    // Add some generic related topics based on category
    if (course.category === "Development") {
      relatedTopics.push(
        "Web Development",
        "Programming",
        "Software Development"
      );
    } else if (course.category === "IT & Software") {
      relatedTopics.push("Cloud Computing", "DevOps", "System Administration");
    }

    // Remove duplicates and limit to 8 topics
    const uniqueTopics = [...new Set(relatedTopics)].slice(0, 8);

    res.json({
      success: true,
      data: uniqueTopics,
    });
  } catch (error) {
    console.error("Get related topics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get course categories breadcrumb
router.get("/:id/categories", async (req, res) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const categories = {
      primary: "Development",
      subcategory: "Web Development",
      context: "Web Development",
    };

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get course categories error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get course preview content (for preview videos/articles)
router.get("/:id/preview/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock preview content
    const previewContent = {
      id: contentId,
      title: "Welcome to the Course",
      type: "video",
      url: "https://example.com/preview-video.mp4",
      duration: "5:30",
      thumbnail: "https://img-c.udemycdn.com/course/750x422/851712_fc61_6.jpg",
      description: "This is a preview of the course content.",
    };

    res.json({
      success: true,
      data: previewContent,
    });
  } catch (error) {
    console.error("Get course preview error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get course statistics
router.get("/:id/stats", async (req, res) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const stats = {
      totalStudents: 1486975,
      totalRatings: 448887,
      averageRating: 4.7,
      completionRate: 78.5,
      lastUpdated: "2025-02-01",
      totalLectures: 42,
      totalDuration: "21h 15m",
      totalSections: 7,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get course stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get instructor's courses
router.get("/instructor/my-courses", authenticate, async (req, res) => {
  try {
    // Only instructors can access their courses
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can access this endpoint",
      });
    }

    const { page = 1, limit = 8 } = req.query;

    const query = { instructorId: req.user.id };

    // Count for pagination
    const totalCourses = await Course.countDocuments(query);

    // Fetch paginated courses
    const courses = await Course.find(query)
      .select(
        "title subtitle thumbnailUrl price status createdAt viewCount enrollmentCount sections"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Function to calculate course completion percentage
    const calculateCompletionPercentage = (course) => {
      const requiredFields = {
        title: !!course.title,
        subtitle: !!course.subtitle,
        thumbnailUrl: !!course.thumbnailUrl,
        price: course.price >= 0,
        sections: course.sections && course.sections.length > 0,
      };

      const sectionsWithContent = course.sections
        ? course.sections.filter(
            (section) => section.content && section.content.length > 0
          ).length
        : 0;

      const totalRequiredSteps = 5; // Basic course info steps
      const completedSteps =
        Object.values(requiredFields).filter(Boolean).length;
      const contentProgress = sectionsWithContent > 0 ? 1 : 0; // 1 point for content

      return Math.round(
        ((completedSteps + contentProgress) / (totalRequiredSteps + 1)) * 100
      );
    };

    // Transform the data to match frontend expectations
    const instructorCourses = courses.map((course) => ({
      id: course._id,
      title: course.title,
      subtitle: course.subtitle,
      status: (course.status || "").toUpperCase(),
      visibility: "Public",
      progress: calculateCompletionPercentage(course),
      isCompleted: course.status === "published",
      totalStudents: course.enrollmentCount || 0,
      rating: 0,
      totalRatings: 0,
      price: course.price,
      thumbnail: course.thumbnailUrl,
      createdAt: course.createdAt,
    }));

    res.json({
      success: true,
      data: {
        courses: instructorCourses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCourses / limit),
          totalCourses,
          hasMore: page * limit < totalCourses,
        },
      },
    });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get instructor's courses (alternative endpoint for frontend compatibility)
router.get("/instructor", authenticate, async (req, res) => {
  try {
    // Only instructors can access their courses
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can access this endpoint",
      });
    }

    const { page = 1, limit = 8 } = req.query;

    // Build query for instructor's courses
    const query = { instructorId: req.user.id };

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);

    // Fetch courses with pagination
    const courses = await Course.find(query)
      .select(
        "title subtitle thumbnailUrl price status createdAt viewCount enrollmentCount"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Transform the data to match frontend expectations
    const instructorCourses = courses.map((course) => ({
      id: course._id,
      title: course.title,
      status: course.status,
      totalStudents: course.enrollmentCount || 0,
      rating: 0, // You can add rating logic later
      totalRatings: 0, // You can add rating logic later
      price: course.price,
      thumbnail: course.thumbnailUrl,
      createdAt: course.createdAt,
    }));

    res.json({
      success: true,
      data: {
        courses: instructorCourses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCourses / limit),
          totalCourses: totalCourses,
          hasMore: page * limit < totalCourses,
        },
      },
    });
  } catch (error) {
    console.error("Get instructor courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get a specific course by ID (legacy endpoint)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate("instructorId", "name")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Get instructor profile
    const instructor = await Instructor.findOne({
      user: course.instructorId._id,
    }).lean();

    const courseData = {
      id: course._id,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      language: course.language,
      rating: course.rating || 0,
      totalRatings: course.totalRatings || 0,
      totalStudents: course.totalStudents || 0,
      price: course.price || 0,
      originalPrice: course.originalPrice || course.price,
      thumbnailUrl: course.thumbnailUrl,
      duration: course.duration || 0,
      totalLectures: course.totalLectures || 0,
      requirements: course.requirements || [],
      learningObjectives: course.learningObjectives || [],
      sections: course.sections || [],
      instructor: {
        name: course.instructorId?.name
          ? `${course.instructorId.name.first} ${course.instructorId.name.last}`
          : "Unknown Instructor",
        title: instructor?.title || "Expert Instructor",
        bio:
          instructor?.bio?.full ||
          "Experienced instructor passionate about teaching.",
        image: instructor?.profileImage || null,
        totalStudents: instructor?.totalStudents || 0,
        totalCourses: instructor?.totalCourses || 1,
        socialLinks: instructor?.socialLinks || {},
      },
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    res.json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all published courses (for students)
router.get("/", async (req, res) => {
  try {
    const {
      category,
      level,
      search,
      sort = "newest",
      page = 1,
      limit = 8,
    } = req.query;

    // Build query
    let query = { status: "published", isActive: true };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case "rating":
        sortObj = { rating: -1 };
        break;
      case "students":
        sortObj = { totalStudents: -1 };
        break;
      case "price":
        sortObj = { price: 1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      default: // newest
        sortObj = { createdAt: -1 };
        break;
    }

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);

    // Fetch courses with pagination
    const courses = await Course.find(query)
      .populate("instructorId", "name")
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        courses: courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCourses / limit),
          totalCourses: totalCourses,
          hasMore: page * limit < totalCourses,
        },
      },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Create new course (landing page data)
router.post("/", authenticate, async (req, res) => {
  try {
    // Only instructors can create courses
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can create courses",
      });
    }

    const {
      title,
      subtitle,
      description,
      category,
      subcategory,
      topic,
      language,
      level,
      thumbnailUrl,
      promoVideoUrl,
      learningObjectives,
      requirements,
      targetAudience,
      keywords,
      status, // Add status to destructuring
    } = req.body;

    // Different validation levels based on course status
    const isDraft = !status || status === "draft";

    if (isDraft) {
      // Minimal validation for draft courses - only require title
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Course title is required to create a draft",
        });
      }
    } else {
      // Full validation for published courses
      if (!title || !subtitle || !description || !category || !thumbnailUrl) {
        return res.status(400).json({
          success: false,
          message:
            "Title, subtitle, description, category, and thumbnail are required for published courses",
        });
      }

      if (description && description.length < 200) {
        return res.status(400).json({
          success: false,
          message:
            "Description must be at least 200 characters for published courses",
        });
      }

      if (
        !learningObjectives ||
        learningObjectives.filter((obj) => obj && obj.trim()).length < 4
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least 4 learning objectives are required for published courses",
        });
      }

      if (
        !requirements ||
        requirements.filter((req) => req && req.trim()).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "At least one requirement is required for published courses",
        });
      }

      if (
        !targetAudience ||
        targetAudience.filter((aud) => aud && aud.trim()).length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one target audience is required for published courses",
        });
      }
    }

    const newCourse = new Course({
      title: title ? title.trim() : "",
      subtitle: subtitle ? subtitle.trim() : "",
      description: description ? description.trim() : "",
      category: category || "",
      subcategory: subcategory || "",
      topic: topic || "",
      language: language || "English",
      level: level || "Beginner",
      thumbnailUrl: thumbnailUrl || "",
      promoVideoUrl: promoVideoUrl || "",
      instructorId: req.user.id,
      learningObjectives: learningObjectives
        ? learningObjectives.filter((obj) => obj && obj.trim())
        : [],
      requirements: requirements
        ? requirements.filter((req) => req && req.trim())
        : [],
      targetAudience: targetAudience
        ? targetAudience.filter((aud) => aud && aud.trim())
        : [],
      keywords: keywords ? keywords.filter((kw) => kw && kw.trim()) : [],
      status: status || "draft", // Default to draft if not specified
      sections: [], // Will be populated in curriculum step
      completedSteps: status === "draft" ? ["landing-page"] : [], // Track completed steps
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({
      success: true,
      message: `Course ${isDraft ? "draft created" : "created"} successfully`,
      courseId: savedCourse._id,
      title: savedCourse.title,
      status: savedCourse.status,
      completedSteps: savedCourse.completedSteps || [],
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update course landing page
router.put("/:id/landing-page", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns this course or is an instructor
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can update courses",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own courses",
      });
    }

    const {
      title,
      subtitle,
      description,
      category,
      subcategory,
      topic,
      language,
      level,
      thumbnailUrl,
      promoVideoUrl,
      learningObjectives,
      requirements,
      targetAudience,
      keywords,
    } = req.body;

    // Update course fields
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (subtitle !== undefined) updateData.subtitle = subtitle.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory || "";
    if (topic !== undefined) updateData.topic = topic || "";
    if (language !== undefined) updateData.language = language || "English";
    if (level !== undefined) updateData.level = level || "Beginner";
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (promoVideoUrl !== undefined)
      updateData.promoVideoUrl = promoVideoUrl || "";

    // Handle arrays
    if (learningObjectives !== undefined) {
      updateData.learningObjectives = Array.isArray(learningObjectives)
        ? learningObjectives.filter((obj) => obj && obj.trim())
        : [];
    }
    if (requirements !== undefined) {
      updateData.requirements = Array.isArray(requirements)
        ? requirements.filter((req) => req && req.trim())
        : [];
    }
    if (targetAudience !== undefined) {
      updateData.targetAudience = Array.isArray(targetAudience)
        ? targetAudience.filter((aud) => aud && aud.trim())
        : [];
    }
    if (keywords !== undefined) {
      updateData.keywords = Array.isArray(keywords)
        ? keywords.filter((kw) => kw && kw.trim())
        : [];
    }

    // Update completedSteps to include landing-page
    const currentCompletedSteps = course.completedSteps || [];
    if (!currentCompletedSteps.includes("landing-page")) {
      updateData.completedSteps = [...currentCompletedSteps, "landing-page"];
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    res.json({
      success: true,
      message: "Course landing page updated successfully",
      data: {
        _id: updatedCourse._id,
        id: updatedCourse._id,
        courseId: updatedCourse._id,
        title: updatedCourse.title,
        status: updatedCourse.status,
        completedSteps: updatedCourse.completedSteps || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update course step completion
router.put("/:id/step/:stepName", authenticate, async (req, res) => {
  try {
    const { id, stepName } = req.params;
    const { data } = req.body;

    // Check if user owns this course or is an instructor
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can update courses",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own courses",
      });
    }

    // Update step data based on step name
    const updateData = {};
    const currentCompletedSteps = course.completedSteps || [];

    switch (stepName) {
      case "landing-page":
        // Update landing page specific data
        if (data.title !== undefined) updateData.title = data.title;
        if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
        if (data.description !== undefined)
          updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.thumbnailUrl !== undefined)
          updateData.thumbnailUrl = data.thumbnailUrl;
        break;

      case "curriculum":
        // Update curriculum specific data
        if (data.sections !== undefined) updateData.sections = data.sections;
        break;

      case "publish":
        // Update publish specific data
        if (data.status !== undefined) updateData.status = data.status;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid step name",
        });
    }

    // Add step to completed steps if not already present
    if (!currentCompletedSteps.includes(stepName)) {
      updateData.completedSteps = [...currentCompletedSteps, stepName];
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: false } // Skip validation for step updates
    ).select("-passwordHash");

    res.json({
      success: true,
      message: `Course ${stepName} updated successfully`,
      data: {
        _id: updatedCourse._id,
        id: updatedCourse._id,
        courseId: updatedCourse._id,
        title: updatedCourse.title,
        status: updatedCourse.status,
        completedSteps: updatedCourse.completedSteps || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get course for editing (landing page data)
router.get("/:id/edit", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Only instructors can edit courses
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can edit courses",
      });
    }

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify the instructor owns this course
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own courses",
      });
    }

    res.json({
      success: true,
      data: {
        courseId: course._id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        category: course.category,
        subcategory: course.subcategory,
        topic: course.topic,
        language: course.language,
        level: course.level,
        thumbnailUrl: course.thumbnailUrl,
        promoVideoUrl: course.promoVideoUrl,
        learningObjectives: course.learningObjectives,
        requirements: course.requirements,
        targetAudience: course.targetAudience,
        keywords: course.keywords,
        status: course.status,
        sections: course.sections || [], // Include sections data for curriculum
        completedSteps: course.completedSteps || [], // Include completed steps
        totalSections: course.sections?.length || 0,
        totalLectures: course.totalLectures,
        totalDuration: course.totalDuration,
      },
    });
  } catch (error) {
    console.error("Get course for editing error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Update a course (instructor only)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;

    // Only instructors can update courses
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can update courses",
      });
    }

    // Simulate course update
    const updatedCourse = {
      id: courseId,
      ...req.body,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete a course (instructor only)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const courseId = req.params.id;

    // Only instructors can delete courses
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can delete courses",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Verify ownership
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own courses",
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    // Optional: clean up user enrollments referencing this course
    try {
      const User = require("../models/user.model");
      await User.updateMany(
        {},
        { $pull: { enrolledCourses: { courseId: courseId } } }
      );
    } catch (cleanupErr) {
      console.warn(
        "Failed to cleanup enrollments for course",
        courseId,
        cleanupErr.message
      );
    }

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update course curriculum
router.put("/:id/curriculum", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { sections } = req.body;

    // Only instructors can update their courses
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can update course curriculum",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify the instructor owns this course
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own courses",
      });
    }

    // Update sections with proper structure
    const updatedSections = sections.map((section, index) => ({
      title: section.title,
      description: section.description || "",
      sortOrder: index,
      isPublished: section.isPublished || false,
      content: (section.content || []).map((content, contentIndex) => ({
        contentType: content.contentType,
        title: content.title,
        description: content.description || "",
        duration: content.duration || 0,
        isPreview: content.isPreview || false,
        isFree: content.isFree || false,
        sortOrder: contentIndex,

        // Content-specific data - only include if content type matches and data exists
        ...(content.contentType === "video" &&
          content.video && { video: content.video }),
        ...(content.contentType === "video_slide_mashup" &&
          content.slides && { slides: content.slides }),
        ...(content.contentType === "document" &&
          content.document && { document: content.document }),
        ...(content.contentType === "article" &&
          content.article && { article: content.article }),
        ...(content.contentType === "quiz" &&
          content.quiz && { quiz: content.quiz }),
        ...(content.contentType === "coding_exercise" &&
          content.codingExercise && {
            codingExercise: content.codingExercise,
          }),
        ...(content.contentType === "assignment" &&
          content.assignment && { assignment: content.assignment }),
        ...(content.resources && { resources: content.resources }),
      })),
      analytics: {
        totalDuration: (section.content || []).reduce(
          (total, content) => total + (content.duration || 0),
          0
        ),
        totalContent: (section.content || []).length,
        averageCompletionRate: 0,
      },
    }));

    course.sections = updatedSections;

    // Mark curriculum step as completed
    const currentCompletedSteps = course.completedSteps || [];
    if (!currentCompletedSteps.includes("curriculum")) {
      course.completedSteps = [...currentCompletedSteps, "curriculum"];
    }

    // Update course statistics
    course.updateStatistics();

    // Skip validation for draft courses to allow flexible content structure
    const saveOptions =
      course.status === "draft" ? { validateBeforeSave: false } : {};
    await course.save(saveOptions);

    res.json({
      success: true,
      message: "Curriculum updated successfully",
      data: {
        sections: course.sections,
        totalDuration: course.totalDuration,
        totalLectures: course.totalLectures,
        totalQuizzes: course.totalQuizzes,
        totalAssignments: course.totalAssignments,
        completedSteps: course.completedSteps || [],
      },
    });
  } catch (error) {
    console.error("Update curriculum error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Upload course content file (video, slides, documents)
router.post("/:id/upload", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionId, contentId, fileType } = req.body;

    // Only instructors can upload files
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can upload course content",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify the instructor owns this course
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only upload to your own courses",
      });
    }

    // For now, return a mock response since we don't have actual file upload setup
    // In production, you would integrate with AWS S3, Google Cloud Storage, etc.
    const mockFileUrl = `https://storage.example.com/courses/${id}/${sectionId}/${contentId}/${fileType}_${Date.now()}`;

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: mockFileUrl,
        fileType,
        uploadStatus: "completed",
        size: Math.floor(Math.random() * 100000000), // Mock file size
      },
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get course curriculum for editing
router.get("/:id/curriculum/edit", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Only instructors can edit curriculum
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can edit course curriculum",
      });
    }

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify the instructor owns this course
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own courses",
      });
    }

    res.json({
      success: true,
      data: {
        courseId: course._id,
        title: course.title,
        sections: course.sections || [],
        totalDuration: course.totalDuration,
        totalLectures: course.totalLectures,
        totalQuizzes: course.totalQuizzes,
        totalAssignments: course.totalAssignments,
      },
    });
  } catch (error) {
    console.error("Get curriculum for editing error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Bulk upload endpoint for multiple files
router.post("/:id/bulk-upload", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { files, sectionId } = req.body;

    // Only instructors can bulk upload
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can bulk upload course content",
      });
    }

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Verify the instructor owns this course
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only upload to your own courses",
      });
    }

    // Mock bulk upload processing
    const uploadResults = files.map((file, index) => ({
      filename: file.name,
      url: `https://storage.example.com/courses/${id}/${sectionId}/bulk_${Date.now()}_${index}`,
      uploadStatus: "completed",
      size: Math.floor(Math.random() * 100000000),
      contentType: file.type.startsWith("video/")
        ? "video"
        : file.type.includes("presentation") || file.type.includes("pdf")
        ? "document"
        : "article",
    }));

    res.json({
      success: true,
      message: `${files.length} files uploaded successfully`,
      data: {
        uploads: uploadResults,
        totalFiles: files.length,
        successfulUploads: uploadResults.length,
      },
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get content analytics
router.get("/:id/analytics/content", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Calculate content analytics
    const analytics = {
      totalSections: course.sections?.length || 0,
      totalContent:
        course.totalLectures + course.totalQuizzes + course.totalAssignments,
      totalDuration: course.totalDuration,
      contentBreakdown: {
        videos: 0,
        articles: 0,
        quizzes: 0,
        assignments: 0,
        codingExercises: 0,
      },
      sectionAnalytics: [],
    };

    // Analyze each section
    course.sections?.forEach((section) => {
      const sectionAnalytics = {
        sectionId: section._id,
        title: section.title,
        contentCount: section.content?.length || 0,
        duration: section.analytics?.totalDuration || 0,
        isPublished: section.isPublished,
        completionRate: section.analytics?.averageCompletionRate || 0,
      };

      // Count content types in this section
      section.content?.forEach((content) => {
        switch (content.contentType) {
          case "video":
          case "video_slide_mashup":
            analytics.contentBreakdown.videos++;
            break;
          case "article":
            analytics.contentBreakdown.articles++;
            break;
          case "quiz":
          case "practice_test":
            analytics.contentBreakdown.quizzes++;
            break;
          case "assignment":
            analytics.contentBreakdown.assignments++;
            break;
          case "coding_exercise":
            analytics.contentBreakdown.codingExercises++;
            break;
        }
      });

      analytics.sectionAnalytics.push(sectionAnalytics);
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get content analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Publish course
router.post("/:id/publish", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns this course or is an instructor
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can publish courses",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only publish your own courses",
      });
    }

    // Validate course is ready for publishing
    const validationErrors = [];

    if (!course.title || course.title.trim().length === 0) {
      validationErrors.push("Course title is required");
    }

    if (!course.subtitle || course.subtitle.trim().length === 0) {
      validationErrors.push("Course subtitle is required");
    }

    if (!course.description || course.description.trim().length < 200) {
      validationErrors.push(
        "Course description must be at least 200 characters"
      );
    }

    if (!course.category) {
      validationErrors.push("Course category is required");
    }

    if (!course.thumbnailUrl) {
      validationErrors.push("Course thumbnail image is required");
    }

    if (
      !course.learningObjectives ||
      course.learningObjectives.filter((obj) => obj && obj.trim()).length < 4
    ) {
      validationErrors.push("At least 4 learning objectives are required");
    }

    if (!course.sections || course.sections.length === 0) {
      validationErrors.push(
        "Course must have at least one section with content"
      );
    } else {
      const hasContent = course.sections.some(
        (section) => section.content && section.content.length > 0
      );
      if (!hasContent) {
        validationErrors.push(
          "Course must have at least one lecture or content item"
        );
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Course validation failed",
        errors: validationErrors,
      });
    }

    // Update course status to published
    course.status = "published";

    // Mark publish step as completed
    const currentCompletedSteps = course.completedSteps || [];
    if (!currentCompletedSteps.includes("publish")) {
      course.completedSteps = [...currentCompletedSteps, "publish"];
    }

    await course.save();

    res.json({
      success: true,
      message: "Course published successfully",
      data: {
        courseId: course._id,
        title: course.title,
        status: course.status,
        completedSteps: course.completedSteps,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Unpublish course
router.post("/:id/unpublish", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns this course or is an instructor
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can unpublish courses",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only unpublish your own courses",
      });
    }

    // Update course status back to draft
    course.status = "draft";

    // Remove publish step from completed steps
    const currentCompletedSteps = course.completedSteps || [];
    course.completedSteps = currentCompletedSteps.filter(
      (step) => step !== "publish"
    );

    await course.save();

    res.json({
      success: true,
      message: "Course unpublished successfully",
      data: {
        courseId: course._id,
        title: course.title,
        status: course.status,
        completedSteps: course.completedSteps,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post(
  "/:id/notes",
  authenticate,
  docUpload,
  handleUploadError,
  async (req, res) => {
    try {
      console.log("control comes to api");
      const { id } = req.params;
      const { title, topic, description, contentIndex, sectionIndex } =
        req.body;

      // Validate required fields
      if (!title || !topic) {
        return res.status(400).json({
          success: false,
          message: "Title and topic are required",
        });
      }

      // Check if user is instructor
      if (req.user.role !== "instructor") {
        return res.status(403).json({
          success: false,
          message: "Only instructors can add notes",
        });
      }

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check ownership
      if (course.instructorId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only add notes to your own courses",
        });
      }

      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      console.log("file data", req.file);

      // Handle file upload if file exists
      if (req.file) {
        try {
          fileUrl = req.file.path; // Cloudinary URL
          fileName = req.file.originalname;
          fileSize = req.file.size;
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          throw uploadError;
        }
      }

      // Create note data
      const noteData = {
        title,
        topic,
        description: description || "",
        fileUrl,
        fileName,
        fileSize,
        isDownloadable: true,
        createdAt: new Date(),
      };

      // Add note to specific content if sectionIndex and contentIndex provided
      if (sectionIndex !== undefined && contentIndex !== undefined && false) {
      } else {
        // Add note to course level (general notes)
        if (!course.notes) {
          course.notes = [];
        }
        console.log("Before adding note, course.notes:", course.notes);
        course.notes.push(noteData);
        console.log("After adding note, course.notes:", course.notes);
      }

      console.log("Saving course with notes:");
      await course.save();
      console.log("Course saved successfully", course);

      res.json({
        success: true,
        message: "Note added successfully",
        data: noteData,
      });
    } catch (error) {
      console.error("Add note error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add note",
        error: error.message,
      });
    }
  }
);

// Get notes for course content
router.get("/:id/notes", async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionIndex, contentIndex } = req.query;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let notes = [];

    // Get notes for specific content if sectionIndex and contentIndex provided
    if (sectionIndex !== undefined && contentIndex !== undefined) {
      if (
        course.sections[sectionIndex] &&
        course.sections[sectionIndex].content[contentIndex]
      ) {
        notes = course.sections[sectionIndex].content[contentIndex].notes || [];
      }
    } else {
      // Get course level notes
      notes = course.notes || [];
    }

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notes",
      error: error.message,
    });
  }
});

// Delete note
router.delete("/:id/notes/:noteId", authenticate, async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { sectionIndex, contentIndex } = req.query;

    // Check if user is instructor
    if (req.user.role !== "instructor") {
      return res.status(403).json({
        success: false,
        message: "Only instructors can delete notes",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete notes from your own courses",
      });
    }

    let noteDeleted = false;
    let filePath = null;

    // Delete note from specific content if sectionIndex and contentIndex provided
    if (sectionIndex !== undefined && contentIndex !== undefined) {
      if (
        course.sections[sectionIndex] &&
        course.sections[sectionIndex].content[contentIndex]
      ) {
        const content = course.sections[sectionIndex].content[contentIndex];
        const noteIndex = content.notes.findIndex(
          (note) => note._id.toString() === noteId
        );

        if (noteIndex !== -1) {
          filePath = content.notes[noteIndex].fileUrl;
          content.notes.splice(noteIndex, 1);
          noteDeleted = true;
        }
      }
    } else {
      // Delete from course level notes
      const noteIndex = course.notes.findIndex(
        (note) => note._id.toString() === noteId
      );

      if (noteIndex !== -1) {
        filePath = course.notes[noteIndex].fileUrl;
        course.notes.splice(noteIndex, 1);
        noteDeleted = true;
      }
    }

    if (!noteDeleted) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Delete local file if it exists
    if (filePath && filePath.startsWith("/uploads/")) {
      try {
        const fullPath = path.join(__dirname, "..", filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (fileError) {
        console.error("Failed to delete local file:", fileError);
        // Continue with note deletion even if file deletion fails
      }
    }

    await course.save();

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
});

// Upload course thumbnail
router.post(
  "/:id/thumbnail",
  authenticate,
  thumbnailUpload,
  handleUploadError,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user is instructor
      if (req.user.role !== "instructor") {
        return res.status(403).json({
          success: false,
          message: "Only instructors can upload course thumbnails",
        });
      }

      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // Check ownership
      if (course.instructorId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only upload thumbnails to your own courses",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Delete old thumbnail if exists
      if (course.thumbnailUrl && course.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(course.cloudinaryPublicId);
        } catch (error) {
          console.error("Failed to delete old thumbnail:", error);
        }
      }

      // Update course with new thumbnail
      course.thumbnailUrl = req.file.path;
      course.cloudinaryPublicId = req.file.filename;
      await course.save();

      res.json({
        success: true,
        message: "Thumbnail uploaded successfully",
        data: {
          thumbnailUrl: req.file.path,
          publicId: req.file.filename,
        },
      });
    } catch (error) {
      console.error("Upload thumbnail error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload thumbnail",
        error: error.message,
      });
    }
  }
);

module.exports = router;
