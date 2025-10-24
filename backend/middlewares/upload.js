const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    video: ["video/mp4", "video/webm", "video/ogg"],
  };

  const fileType = req.fileType || "document"; // Default to document
  if (allowedTypes[fileType].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedTypes[fileType].join(", ")}`
      ),
      false
    );
  }
};

// Configure Cloudinary storage for documents - direct upload to cloud
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "raw",
  },
});

// Configure Cloudinary storage for images - direct upload to cloud
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "image",
  },
});

// Configure multer with Cloudinary storage
const upload = multer({
  storage: docStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Specific upload configurations - direct to Cloudinary
const imageUpload = multer({ storage: imageStorage }).single("image");

const profileImageUpload = multer({ storage: imageStorage }).single(
  "profilePicture"
);

const docUpload = multer({ storage: docStorage }).single("file");

const thumbnailUpload = multer({ storage: imageStorage }).single("image");

const carouselUpload = multer({ storage: imageStorage }).single("image");

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 10MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "File upload error",
    });
  }

  next();
};

module.exports = {
  imageUpload,
  profileImageUpload,
  docUpload,
  thumbnailUpload,
  carouselUpload,
  handleUploadError,
};
