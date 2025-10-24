import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Create axios instance for instructor requests
const instructorClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
instructorClient.interceptors.request.use(
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
instructorClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Instructor API Error:",
      error.response?.data || error.message
    );

    // If token is invalid, clear it from localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

// Instructor Service
export const instructorService = {
  // Get instructor's courses
  getCourses: async (params = {}) => {
    try {
      // Set default pagination if not provided
      const defaultParams = {
        page: 1,
        limit: 8,
        ...params,
      };

      const queryParams = new URLSearchParams(defaultParams).toString();
      const response = await instructorClient.get(
        `/courses/instructor/my-courses?${queryParams}`
      );
      return {
        success: true,
        data: response.data.data?.courses || response.data.data || [],
        pagination: response.data.data?.pagination,
        message: "Courses fetched successfully",
      };
    } catch (error) {
      console.error("Get instructor courses error:", error);
      return {
        success: false,
        message: instructorService.getErrorMessage(error),
        error: error.response?.data || error.message,
        data: [],
      };
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    try {
      const response = await instructorClient.post("/courses", courseData);
      return {
        success: true,
        data: response.data,
        message: "Course created successfully",
      };
    } catch (error) {
      console.error("Create course error:", error);
      return {
        success: false,
        message: "Failed to create course",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await instructorClient.put(
        `/courses/${courseId}`,
        courseData
      );
      return {
        success: true,
        data: response.data,
        message: "Course updated successfully",
      };
    } catch (error) {
      console.error("Update course error:", error);
      return {
        success: false,
        message: "Failed to update course",
        error: error.response?.data || error.message,
      };
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await instructorClient.delete(`/courses/${courseId}`);
      return {
        success: true,
        data: response.data,
        message: "Course deleted successfully",
      };
    } catch (error) {
      console.error("Delete course error:", error);
      return {
        success: false,
        message: "Failed to delete course",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get course for editing
  getCourseForEdit: async (courseId) => {
    try {
      const response = await instructorClient.get(`/courses/${courseId}/edit`);
      return {
        success: true,
        data: response.data,
        message: "Course data fetched successfully",
      };
    } catch (error) {
      console.error("Get course for edit error:", error);
      return {
        success: false,
        message: "Failed to fetch course data",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update course landing page
  updateCourseLandingPage: async (courseId, landingPageData) => {
    try {
      const response = await instructorClient.put(
        `/courses/${courseId}/landing-page`,
        landingPageData
      );
      return {
        success: true,
        data: response.data,
        message: "Landing page updated successfully",
      };
    } catch (error) {
      console.error("Update landing page error:", error);
      return {
        success: false,
        message: "Failed to update landing page",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update course curriculum
  updateCourseCurriculum: async (courseId, curriculumData) => {
    try {
      const response = await instructorClient.put(
        `/courses/${courseId}/curriculum`,
        curriculumData
      );
      return {
        success: true,
        data: response.data,
        message: "Curriculum updated successfully",
      };
    } catch (error) {
      console.error("Update curriculum error:", error);
      return {
        success: false,
        message: "Failed to update curriculum",
        error: error.response?.data || error.message,
      };
    }
  },

  // Upload course image
  uploadCourseImage: async (courseId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("courseId", courseId);

      const response = await instructorClient.post(
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
      return {
        success: true,
        data: response.data,
        message: "Image uploaded successfully",
      };
    } catch (error) {
      console.error("Upload image error:", error);
      return {
        success: false,
        message: "Failed to upload image",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get instructor analytics
  getAnalytics: async (timeRange = "30d") => {
    try {
      const response = await instructorClient.get(
        `/instructor/analytics?range=${timeRange}`
      );
      return {
        success: true,
        data: response.data,
        message: "Analytics fetched successfully",
      };
    } catch (error) {
      console.error("Get analytics error:", error);
      return {
        success: false,
        message: "Failed to fetch analytics",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get instructor earnings
  getEarnings: async (timeRange = "30d") => {
    try {
      const response = await instructorClient.get(
        `/instructor/earnings?range=${timeRange}`
      );
      return {
        success: true,
        data: response.data,
        message: "Earnings fetched successfully",
      };
    } catch (error) {
      console.error("Get earnings error:", error);
      return {
        success: false,
        message: "Failed to fetch earnings",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get instructor profile
  getProfile: async () => {
    try {
      const response = await instructorClient.get("/instructor/profile");
      return {
        success: true,
        data: response.data,
        message: "Profile fetched successfully",
      };
    } catch (error) {
      console.error("Get instructor profile error:", error);
      return {
        success: false,
        message: "Failed to fetch profile",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update instructor profile
  updateProfile: async (profileData) => {
    try {
      const response = await instructorClient.put(
        "/instructor/profile",
        profileData
      );
      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Update instructor profile error:", error);
      return {
        success: false,
        message: "Failed to update profile",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get instructor students
  getStudents: async (page = 1, limit = 10) => {
    try {
      const response = await instructorClient.get(
        `/instructor/students?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
        message: "Students fetched successfully",
      };
    } catch (error) {
      console.error("Get students error:", error);
      return {
        success: false,
        message: "Failed to fetch students",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get instructor reviews
  getReviews: async (page = 1, limit = 10) => {
    try {
      const response = await instructorClient.get(
        `/instructor/reviews?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
        message: "Reviews fetched successfully",
      };
    } catch (error) {
      console.error("Get reviews error:", error);
      return {
        success: false,
        message: "Failed to fetch reviews",
        error: error.response?.data || error.message,
      };
    }
  },

  // Publish course
  publishCourse: async (courseId) => {
    try {
      const response = await instructorClient.post(
        `/courses/${courseId}/publish`
      );
      return {
        success: true,
        data: response.data,
        message: "Course published successfully",
      };
    } catch (error) {
      console.error("Publish course error:", error);
      return {
        success: false,
        message: "Failed to publish course",
        error: error.response?.data || error.message,
      };
    }
  },

  // Unpublish course
  unpublishCourse: async (courseId) => {
    try {
      const response = await instructorClient.post(
        `/courses/${courseId}/unpublish`
      );
      return {
        success: true,
        data: response.data,
        message: "Course unpublished successfully",
      };
    } catch (error) {
      console.error("Unpublish course error:", error);
      return {
        success: false,
        message: "Failed to unpublish course",
        error: error.response?.data || error.message,
      };
    }
  },

  // Error message helper
  getErrorMessage: (error) => {
    if (!error) return "An unexpected error occurred. Please try again.";

    const message = error.response?.data?.message || error.message || error;

    // Handle specific error cases
    switch (error.response?.status) {
      case 401:
        return "Please login to access instructor features.";
      case 403:
        return "Only instructors can access this feature.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return message || "Something went wrong. Please try again.";
    }
  },
};

// Export default for convenience
export default instructorService;
