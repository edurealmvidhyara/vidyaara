import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// This function has been moved to instructorService.js
// Use instructorService.getCourses() instead

// Course API Service
export const courseService = {
  // Get course basic data (for sidebar and header)
  getCourseBasic: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/basic`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course basic data:", error);
      throw error;
    }
  },

  // Get course detailed data (for main content)
  getCourseDetailed: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/detailed`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course detailed data:", error);
      throw error;
    }
  },

  // Get course curriculum/sections
  getCourseCurriculum: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/curriculum`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course curriculum:", error);
      throw error;
    }
  },

  // Get course instructor data
  getCourseInstructor: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/instructor`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course instructor:", error);
      throw error;
    }
  },

  // Get course reviews
  getCourseReviews: async (courseId, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiClient.get(
        `/courses/${courseId}/reviews?${queryParams}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course reviews:", error);
      throw error;
    }
  },

  // Rate a course
  rateCourse: async (courseId, ratingData) => {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/rate`,
        ratingData
      );
      return response.data;
    } catch (error) {
      console.error("Error rating course:", error);
      throw error;
    }
  },

  // Get user's rating for a course
  getUserRating: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/my-rating`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user rating:", error);
      throw error;
    }
  },

  // Get recommended courses
  getRecommendedCourses: async (courseId, limit = 6) => {
    try {
      const response = await apiClient.get(
        `/courses/${courseId}/recommended?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recommended courses:", error);
      throw error;
    }
  },

  // Get related topics
  getRelatedTopics: async (courseId) => {
    try {
      const response = await apiClient.get(
        `/courses/${courseId}/related-topics`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching related topics:", error);
      throw error;
    }
  },

  // Get course categories
  getCourseCategories: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/categories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course categories:", error);
      throw error;
    }
  },

  // Home categories
  getHomeCategories: async () => {
    try {
      const response = await apiClient.get(`/courses/categories`);
      return response.data;
    } catch (error) {
      console.error("Error fetching home categories:", error);
      throw error;
    }
  },

  // Search suggestions
  getSearchSuggestions: async (q, limit = 8) => {
    try {
      const response = await apiClient.get(`/courses/search/suggestions`, {
        params: { q, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      throw error;
    }
  },

  // Get course preview content
  getCoursePreview: async (courseId, contentId) => {
    try {
      const response = await apiClient.get(
        `/courses/${courseId}/preview/${contentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching course preview:", error);
      throw error;
    }
  },
  // Get course pricing
  getCoursePricing: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/pricing`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course pricing:", error);
      throw error;
    }
  },

  // Get all courses (with filters and pagination)
  getAllCourses: async (params = {}) => {
    try {
      // Set default pagination if not provided
      const defaultParams = {
        page: 1,
        limit: 8,
        ...params,
      };

      const queryParams = new URLSearchParams(defaultParams).toString();
      const response = await apiClient.get(`/courses?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all courses:", error);
      throw error;
    }
  },

  // Get specific course (legacy endpoint)
  getCourse: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  // Course Creation and Management

  // Create new course
  createCourse: async (courseData) => {
    try {
      const response = await apiClient.post("/courses", courseData);
      return response.data;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  // Update course landing page
  updateCourseLandingPage: async (courseId, landingPageData) => {
    try {
      const response = await apiClient.put(
        `/courses/${courseId}/landing-page`,
        landingPageData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating course landing page:", error);
      throw error;
    }
  },

  // Update course step
  updateCourseStep: async (courseId, stepName, data) => {
    try {
      const response = await apiClient.put(
        `/courses/${courseId}/step/${stepName}`,
        { data }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating course step ${stepName}:`, error);
      throw error;
    }
  },

  // Update course landing page (enhanced)
  updateCourseLandingPageEnhanced: async (courseId, landingPageData) => {
    try {
      const response = await apiClient.put(
        `/courses/${courseId}/landing-page`,
        landingPageData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating course landing page:", error);
      throw error;
    }
  },

  // Get course for editing
  getCourseForEdit: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/edit`);
      return response.data;
    } catch (error) {
      console.error("Error fetching course for edit:", error);
      throw error;
    }
  },

  // Upload course image
  uploadCourseImage: async (courseId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("courseId", courseId);

      const response = await apiClient.post(
        `/courses/${courseId}/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading course image:", error);
      throw error;
    }
  },

  // Validation utilities for course data
  validateCourseData: {
    title: (title) => {
      const errors = [];
      if (!title?.trim()) errors.push("Title is required");
      else if (title.length < 10)
        errors.push("Title should be at least 10 characters");
      else if (title.length > 100)
        errors.push("Title should be less than 100 characters");
      return { isValid: errors.length === 0, errors };
    },

    subtitle: (subtitle) => {
      const errors = [];
      if (!subtitle?.trim()) errors.push("Subtitle is required");
      else if (subtitle.length < 10)
        errors.push("Subtitle should be at least 10 characters");
      else if (subtitle.length > 200)
        errors.push("Subtitle should be less than 200 characters");
      return { isValid: errors.length === 0, errors };
    },

    description: (description) => {
      const errors = [];
      if (!description?.trim()) errors.push("Description is required");
      else if (description.length < 200)
        errors.push("Description should be at least 200 characters");
      else if (description.length > 5000)
        errors.push("Description should be less than 5000 characters");
      return { isValid: errors.length === 0, errors };
    },

    learningObjectives: (objectives) => {
      const errors = [];
      const validObjectives = objectives?.filter((obj) => obj.trim()) || [];
      if (validObjectives.length < 4)
        errors.push("At least 4 learning objectives are required");
      return { isValid: errors.length === 0, errors };
    },

    category: (value) => {
      const errors = [];
      if (!value) errors.push("Category is required");
      return errors;
    },

    thumbnailUrl: (value) => {
      const errors = [];
      if (!value) errors.push("Course image is required");
      return errors;
    },
  },

  // Update course (instructor only)
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // Delete course (instructor only)
  deleteCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },

  // Get instructor's courses
  getInstructorCourses: async () => {
    try {
      const response = await apiClient.get("/courses/instructor");
      return response.data.courses;
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      throw error;
    }
  },

  // Curriculum and Content Management

  // Get course curriculum for editing
  getCurriculumForEdit: async (courseId) => {
    try {
      const response = await apiClient.get(
        `/courses/${courseId}/curriculum/edit`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching curriculum for edit:", error);
      throw error;
    }
  },

  // Update course curriculum
  updateCourseCurriculum: async (courseId, curriculumData) => {
    try {
      const response = await apiClient.put(
        `/courses/${courseId}/curriculum`,
        curriculumData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating course curriculum:", error);
      throw error;
    }
  },

  // Upload course content file
  uploadCourseContent: async (courseId, uploadData) => {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/upload`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (uploadData.onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              uploadData.onProgress(percentCompleted);
            }
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading course content:", error);
      throw error;
    }
  },

  // Bulk upload multiple files
  bulkUploadContent: async (courseId, uploadData) => {
    try {
      const response = await apiClient.post(
        `/courses/${courseId}/bulk-upload`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (uploadData.onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              uploadData.onProgress(percentCompleted);
            }
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error bulk uploading content:", error);
      throw error;
    }
  },

  // Get content analytics
  getCourseContentAnalytics: async (courseId) => {
    try {
      const response = await apiClient.get(
        `/courses/${courseId}/analytics/content`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching content analytics:", error);
      throw error;
    }
  },

  // Content validation utilities
  validateContent: {
    video: (videoData) => {
      const errors = [];
      if (!videoData.title?.trim()) errors.push("Video title is required");
      if (!videoData.video?.url && !videoData.video?.file)
        errors.push("Video file is required");
      if (videoData.duration && videoData.duration < 0)
        errors.push("Duration must be positive");
      return { isValid: errors.length === 0, errors };
    },

    article: (articleData) => {
      const errors = [];
      if (!articleData.title?.trim()) errors.push("Article title is required");
      if (!articleData.article?.content?.trim())
        errors.push("Article content is required");
      if (
        articleData.article?.estimatedReadTime &&
        articleData.article.estimatedReadTime < 1
      ) {
        errors.push("Read time must be at least 1 minute");
      }
      return { isValid: errors.length === 0, errors };
    },

    quiz: (quizData) => {
      const errors = [];
      if (!quizData.title?.trim()) errors.push("Quiz title is required");
      if (!quizData.quiz?.questions || quizData.quiz.questions.length === 0) {
        errors.push("Quiz must have at least one question");
      }
      if (
        quizData.quiz?.passingScore &&
        (quizData.quiz.passingScore < 0 || quizData.quiz.passingScore > 100)
      ) {
        errors.push("Passing score must be between 0 and 100");
      }
      return { isValid: errors.length === 0, errors };
    },

    codingExercise: (exerciseData) => {
      const errors = [];
      if (!exerciseData.title?.trim())
        errors.push("Exercise title is required");
      if (!exerciseData.codingExercise?.language)
        errors.push("Programming language is required");
      if (!exerciseData.codingExercise?.instructions?.trim())
        errors.push("Instructions are required");
      return { isValid: errors.length === 0, errors };
    },

    assignment: (assignmentData) => {
      const errors = [];
      if (!assignmentData.title?.trim())
        errors.push("Assignment title is required");
      if (!assignmentData.assignment?.instructions?.trim())
        errors.push("Instructions are required");
      if (!assignmentData.assignment?.submissionType)
        errors.push("Submission type is required");
      return { isValid: errors.length === 0, errors };
    },
  },

  // File upload utilities
  uploadUtils: {
    // Get allowed file types for content type
    getAllowedFileTypes: (contentType) => {
      const fileTypes = {
        video: ["mp4", "mov", "avi", "wmv", "flv", "webm"],
        slides: ["ppt", "pptx", "pdf"],
        document: ["pdf", "doc", "docx", "txt"],
        image: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
        audio: ["mp3", "wav", "ogg", "aac"],
      };
      return fileTypes[contentType] || [];
    },

    // Get max file size for content type (in bytes)
    getMaxFileSize: (contentType) => {
      const sizes = {
        video: 500 * 1024 * 1024, // 500MB
        slides: 50 * 1024 * 1024, // 50MB
        document: 25 * 1024 * 1024, // 25MB
        image: 10 * 1024 * 1024, // 10MB
        audio: 25 * 1024 * 1024, // 25MB
      };
      return sizes[contentType] || 10 * 1024 * 1024; // Default 10MB
    },

    // Validate file before upload
    validateFile: (file, contentType) => {
      const errors = [];
      const allowedTypes =
        courseService.uploadUtils.getAllowedFileTypes(contentType);
      const maxSize = courseService.uploadUtils.getMaxFileSize(contentType);

      if (!file) {
        errors.push("No file selected");
        return { isValid: false, errors };
      }

      // Check file extension
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        errors.push(
          `File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(
            ", "
          )}`
        );
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        errors.push(`File size must be less than ${maxSizeMB}MB`);
      }

      return { isValid: errors.length === 0, errors };
    },

    // Format file size for display
    formatFileSize: (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    // Format duration for display
    formatDuration: (seconds) => {
      if (!seconds || seconds <= 0) return "0:00";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${hours}:${minutes
          .toString()
          .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
      } else {
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
      }
    },
  },
};

// Utility functions for course data
export const courseUtils = {
  // Format duration from seconds to readable format
  formatDuration: (seconds) => {
    if (!seconds) return "0min";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes}min`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  },

  // Format date
  formatDate: (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}/${date.getFullYear()}`;
  },

  // Get content type icon
  getContentTypeIcon: (contentType) => {
    const iconMap = {
      video: "udi udi-video",
      article: "udi udi-article",
      quiz: "udi udi-quiz",
      assignment: "udi udi-assignment",
      practice_test: "udi udi-practice-test",
      coding_exercise: "udi udi-coding-exercise",
      file: "udi udi-file",
      audio: "udi udi-audio",
      presentation: "udi udi-presentation",
      discussion: "udi udi-discussion",
      announcement: "udi udi-announcement",
      external_link: "udi udi-external-link",
    };
    return iconMap[contentType] || "udi udi-video";
  },

  // Check if content can be previewed
  canPreview: (contentItem) => {
    return contentItem.can_be_previewed || contentItem.is_free;
  },

  // Get course level color
  getLevelColor: (level) => {
    const colorMap = {
      Beginner: "green",
      Intermediate: "yellow",
      Advanced: "red",
      "All Levels": "blue",
    };
    return colorMap[level] || "blue";
  },

  // Get rating stars
  getRatingStars: (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push("full");
    }

    if (hasHalfStar) {
      stars.push("half");
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push("empty");
    }

    return stars;
  },

  // Truncate text
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  },

  // Generate initials from name
  getInitials: (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  },
};

// Export default for convenience
export default courseService;
