// Cloudinary upload utility
import { CLOUDINARY_CONFIG } from "../config/cloudinary";

export const uploadImageToCloudinary = async (file) => {
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  const fileExtension = file.name.split(".").pop().toLowerCase();
  if (!CLOUDINARY_CONFIG.ALLOWED_FORMATS.includes(fileExtension)) {
    throw new Error(
      `Please select a valid image file (${CLOUDINARY_CONFIG.ALLOWED_FORMATS.join(
        ", "
      ).toUpperCase()})`
    );
  }

  // Validate file size
  if (file.size > CLOUDINARY_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = CLOUDINARY_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    throw new Error(`Image size should be less than ${maxSizeMB}MB`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_CONFIG.FOLDERS.COURSE_THUMBNAILS);

  try {
    const response = await fetch(CLOUDINARY_CONFIG.UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "Failed to upload image");
  }
};

// Generate optimized image URL with transformations
export const getOptimizedImageUrl = (
  publicId,
  type = "THUMBNAIL",
  customOptions = {}
) => {
  const defaultOptions =
    CLOUDINARY_CONFIG.TRANSFORMATIONS[type] ||
    CLOUDINARY_CONFIG.TRANSFORMATIONS.THUMBNAIL;
  const options = { ...defaultOptions, ...customOptions };

  const transformations = Object.entries(options)
    .map(([key, value]) => {
      const shortKey =
        key === "width"
          ? "w"
          : key === "height"
          ? "h"
          : key === "crop"
          ? "c"
          : key === "quality"
          ? "q"
          : key === "format"
          ? "f"
          : key;
      return `${shortKey}_${value}`;
    })
    .join(",");

  return `${CLOUDINARY_CONFIG.BASE_URL}/image/upload/${transformations}/${publicId}`;
};

// Delete image from Cloudinary (optional)
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    // This would typically be done from your backend for security
    // Frontend shouldn't have delete permissions
    console.warn("Image deletion should be handled by the backend");
    return {
      success: false,
      message: "Delete operation not allowed from frontend",
    };
  } catch (error) {
    console.error("Failed to delete image:", error);
    throw error;
  }
};
