// Export all services for easy importing
export { authService } from "./authService";
export { instructorService } from "./instructorService";
export { userService } from "./userService";
export { courseService } from "./courseService";
// export { default as wishlistService } from "./wishlistService"; // Commented out wishlist

// Export default services
export { default as authServiceDefault } from "./authService";
export { default as instructorServiceDefault } from "./instructorService";
export { default as userServiceDefault } from "./userService";
export { default as courseServiceDefault } from "./courseService";

// Re-export utility functions
export { courseUtils } from "./courseService";
