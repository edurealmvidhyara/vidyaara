import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
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

// Wishlist Service - Commented out
// export const wishlistService = {
  // Get user's wishlist
  getWishlist: async (params = {}) => {
    try {
      // Set default pagination if not provided
      const defaultParams = {
        page: 1,
        limit: 8,
        ...params,
      };

      const queryParams = new URLSearchParams(defaultParams).toString();
      const response = await api.get(`/wishlist?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }
  },

  // Add course to wishlist
  addToWishlist: async (courseId) => {
    try {
      const response = await api.post("/wishlist", { courseId });
      return response.data;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  },

  // Remove course from wishlist
  removeFromWishlist: async (courseId) => {
    try {
      const response = await api.delete(`/wishlist/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  },

  // Check if course is in wishlist
  isInWishlist: async (courseId) => {
    try {
      const response = await api.get(`/wishlist/check/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      throw error;
    }
  },

  // Toggle wishlist status
  toggleWishlist: async (courseId) => {
    try {
      const response = await api.post(`/wishlist/toggle`, { courseId });
      return response.data;
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      throw error;
    }
  },

  // Get wishlist count
  getWishlistCount: async () => {
    try {
      const response = await api.get("/wishlist/count");
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      throw error;
    }
  },

  // Move wishlist items to cart
  moveToCart: async (courseIds) => {
    try {
      const response = await api.post("/wishlist/move-to-cart", { courseIds });
      return response.data;
    } catch (error) {
      console.error("Error moving to cart:", error);
      throw error;
    }
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    try {
      const response = await api.delete("/wishlist/clear");
      return response.data;
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      throw error;
    }
  },
// };

// export default wishlistService; // Commented out
