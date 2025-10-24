import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Create axios instance for user requests
const userClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
userClient.interceptors.request.use(
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
userClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("User API Error:", error.response?.data || error.message);

    // If token is invalid, clear it from localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

// User Service
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await userClient.get("/users/profile");
      console.log("response", response);
      return {
        success: true,
        data: response.data,
        message: "Profile fetched successfully",
      };
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: "Failed to fetch profile",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await userClient.put("/users/profile", profileData);
      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: "Failed to update profile",
        error: error.response?.data || error.message,
      };
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", imageFile);

      const response = await userClient.post("/users/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      return {
        success: true,
        data: response.data,
        message: "Profile picture uploaded successfully",
      };
    } catch (error) {
      console.error("Upload profile picture error:", error);
      return {
        success: false,
        message: "Failed to upload profile picture",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get enrolled courses
  getEnrolledCourses: async (page = 1, limit = 10) => {
    try {
      const response = await userClient.get(
        `/users/enrolled-courses?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
        message: "Enrolled courses fetched successfully",
      };
    } catch (error) {
      console.error("Get enrolled courses error:", error);
      return {
        success: false,
        message: "Failed to fetch enrolled courses",
        error: error.response?.data || error.message,
      };
    }
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    try {
      const response = await userClient.post(
        `/users/courses/${courseId}/enroll`
      );
      return {
        success: true,
        data: response.data,
        message: "Successfully enrolled in course",
      };
    } catch (error) {
      console.error("Enroll in course error:", error);
      return {
        success: false,
        message: "Failed to enroll in course",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get wishlist - Commented out
  // getWishlist: async () => {
  //   try {
  //     const response = await userClient.get("/users/wishlist");
  //     return {
  //       success: true,
  //       data: response.data,
  //       message: "Wishlist fetched successfully",
  //     };
  //   } catch (error) {
  //     console.error("Get wishlist error:", error);
  //     return {
  //       success: false,
  //       message: "Failed to fetch wishlist",
  //       error: error.response?.data || error.message,
  //     };
  //   }
  // },

  // Add to wishlist - Commented out
  // addToWishlist: async (courseId) => {
  //   try {
  //     const response = await userClient.post("/users/wishlist", { courseId });
  //     return {
  //       success: true,
  //       data: response.data,
  //       message: "Course added to wishlist",
  //     };
  //   } catch (error) {
  //     console.error("Add to wishlist error:", error);
  //     return {
  //       success: false,
  //       message: "Failed to add to wishlist",
  //       error: error.response?.data || error.message,
  //     };
  //   }
  // },

  // Remove from wishlist - Commented out
  // removeFromWishlist: async (courseId) => {
  //   try {
  //     const response = await userClient.delete(`/users/wishlist/${courseId}`);
  //     return {
  //       success: true,
  //       data: response.data,
  //       message: "Course removed from wishlist",
  //     };
  //   } catch (error) {
  //     console.error("Remove from wishlist error:", error);
  //     return {
  //       success: false,
  //       message: "Failed to remove from wishlist",
  //       error: error.response?.data || error.message,
  //     };
  //   }
  // },

  // Get learning progress
  getLearningProgress: async (courseId) => {
    try {
      const response = await userClient.get(`/courses/${courseId}/progress`);
      return {
        success: true,
        data: response.data,
        message: "Learning progress fetched successfully",
      };
    } catch (error) {
      console.error("Get learning progress error:", error);
      return {
        success: false,
        message: "Failed to fetch learning progress",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update learning progress
  updateLearningProgress: async (courseId, contentId, progressData) => {
    try {
      const response = await userClient.post(
        `/courses/${courseId}/content/${contentId}/progress`,
        progressData
      );
      return {
        success: true,
        data: response.data,
        message: "Progress updated successfully",
      };
    } catch (error) {
      console.error("Update learning progress error:", error);
      return {
        success: false,
        message: "Failed to update progress",
        error: error.response?.data || error.message,
      };
    }
  },

  // Submit course review
  submitCourseReview: async (courseId, reviewData) => {
    try {
      const response = await userClient.post(
        `/courses/${courseId}/reviews`,
        reviewData
      );
      return {
        success: true,
        data: response.data,
        message: "Review submitted successfully",
      };
    } catch (error) {
      console.error("Submit course review error:", error);
      return {
        success: false,
        message: "Failed to submit review",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get user's course reviews
  getUserReviews: async (page = 1, limit = 10) => {
    try {
      const response = await userClient.get(
        `/users/reviews?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
        message: "Reviews fetched successfully",
      };
    } catch (error) {
      console.error("Get user reviews error:", error);
      return {
        success: false,
        message: "Failed to fetch reviews",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get user notifications
  getNotifications: async (page = 1, limit = 10) => {
    try {
      const response = await userClient.get(
        `/users/notifications?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
        message: "Notifications fetched successfully",
      };
    } catch (error) {
      console.error("Get notifications error:", error);
      return {
        success: false,
        message: "Failed to fetch notifications",
        error: error.response?.data || error.message,
      };
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await userClient.put(
        `/users/notifications/${notificationId}/read`
      );
      return {
        success: true,
        data: response.data,
        message: "Notification marked as read",
      };
    } catch (error) {
      console.error("Mark notification as read error:", error);
      return {
        success: false,
        message: "Failed to mark notification as read",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get user achievements
  getAchievements: async () => {
    try {
      const response = await userClient.get("/users/achievements");
      return {
        success: true,
        data: response.data,
        message: "Achievements fetched successfully",
      };
    } catch (error) {
      console.error("Get achievements error:", error);
      return {
        success: false,
        message: "Failed to fetch achievements",
        error: error.response?.data || error.message,
      };
    }
  },

  // Get user certificates
  getCertificates: async () => {
    try {
      const response = await userClient.get("/users/certificates");
      return {
        success: true,
        data: response.data,
        message: "Certificates fetched successfully",
      };
    } catch (error) {
      console.error("Get certificates error:", error);
      return {
        success: false,
        message: "Failed to fetch certificates",
        error: error.response?.data || error.message,
      };
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await userClient.put("/users/preferences", preferences);
      return {
        success: true,
        data: response.data,
        message: "Preferences updated successfully",
      };
    } catch (error) {
      console.error("Update preferences error:", error);
      return {
        success: false,
        message: "Failed to update preferences",
        error: error.response?.data || error.message,
      };
    }
  },

  // Deactivate account
  deactivateAccount: async (reason) => {
    try {
      const response = await userClient.post("/users/deactivate", { reason });
      return {
        success: true,
        data: response.data,
        message: "Account deactivated successfully",
      };
    } catch (error) {
      console.error("Deactivate account error:", error);
      return {
        success: false,
        message: "Failed to deactivate account",
        error: error.response?.data || error.message,
      };
    }
  },
};

// Export default for convenience
export default userService;
