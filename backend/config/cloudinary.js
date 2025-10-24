const dotenv = require("dotenv");
dotenv.config();
const { v2: cloudinary } = require("cloudinary");

// Normalize env values to avoid accidental quotes/whitespace issues
const normalize = (v) => (v || "").toString().trim().replace(/^"|"$/g, "");
const CLOUD_NAME = normalize(process.env.CLOUDINARY_CLOUD_NAME);
const API_KEY = normalize(process.env.CLOUDINARY_API_KEY);
const API_SECRET = normalize(process.env.CLOUDINARY_API_SECRET);

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  // eslint-disable-next-line no-console
  console.error(
    "[Cloudinary] Missing credentials. Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are set."
  );
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});
const uploadToCloudinary = async (file, folder = "uploads") => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Convert buffer to base64 string for Cloudinary upload
    const buffer = file.buffer;
    const base64String = buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: "auto",
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      size: result.bytes,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "Failed to upload file");
  }
};

/**
 * Delete a resource from Cloudinary by public ID
 * @param {string} publicId - The public ID of the resource to delete
 * @returns {Promise<Object>} Result of the deletion operation
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return { success: false, error: "Invalid public ID" };
    }

    // Remove folder path if present
    const formattedId = publicId.includes("/")
      ? publicId.substring(publicId.lastIndexOf("/") + 1)
      : publicId;

    const result = await cloudinary.uploader.destroy(formattedId);
    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error(`Failed to delete resource ${publicId}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a resource from Cloudinary by public ID (alias for deleteFromCloudinary)
 * @param {string} publicId - The public ID of the resource to delete
 * @returns {Promise<Object>} Result of the deletion operation
 */
const deleteResource = async (publicId) => {
  return deleteFromCloudinary(publicId);
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteResource,
};
