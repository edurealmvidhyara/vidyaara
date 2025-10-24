import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { courseService } from "../../services/courseService";
import { uploadService } from "../../services/uploadService";
import { hasObjectChanged } from "../../utils/formUtils";
import toast from "react-hot-toast";

const CourseLandingPage = ({
  courseId,
  onSave,
  initialData = {},
  onRegisterIsDirty,
  onRegisterSave,
  onRegisterValidate,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    subcategory: "",
    topic: "",
    language: "English",
    level: "Beginner",
    thumbnailUrl: "",
    promoVideoUrl: "",
    learningObjectives: ["", "", "", ""],
    requirements: [""],
    targetAudience: [""],
    keywords: [""],
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isNewCourse, setIsNewCourse] = useState(!courseId);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Keep track of original data for change detection
  const originalDataRef = useRef(initialData);
  const lastSavedDataRef = useRef(initialData);

  // Update original data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      originalDataRef.current = { ...initialData };
      lastSavedDataRef.current = { ...initialData };
      setFormData((prev) => ({ ...prev, ...initialData }));
      setIsNewCourse(false);
      setHasChanges(false);
    } else if (isNewCourse) {
      // For new courses, initialize with empty form data
      const emptyFormData = {
        title: "",
        subtitle: "",
        description: "",
        category: "",
        subcategory: "",
        topic: "",
        language: "English",
        level: "Beginner",
        thumbnailUrl: "",
        promoVideoUrl: "",
        learningObjectives: ["", "", "", ""],
        requirements: [""],
        targetAudience: [""],
        keywords: [""],
      };
      originalDataRef.current = { ...emptyFormData };
      lastSavedDataRef.current = { ...emptyFormData };
    }
  }, [initialData, isNewCourse]);

  // Detect changes in form data
  useEffect(() => {
    const hasFormChanges = hasObjectChanged(formData, lastSavedDataRef.current);
    console.log("Change detection:", {
      hasFormChanges,
      formData: formData?.title,
      lastSaved: lastSavedDataRef.current?.title,
    });
    setHasChanges(hasFormChanges);
  }, [formData]);

  // Load categories from backend for uniform list across app
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await courseService.getHomeCategories();
        const list = res?.data || res || [];
        setAvailableCategories(list);
      } catch (e) {
        // fallback to a minimal set if API fails
        setAvailableCategories([
          { title: "Development" },
          { title: "Business" },
          { title: "Design" },
          { title: "IT & Software" },
        ]);
      }
    };
    loadCategories();
  }, []);

  // Expose dirty/save/validate functions to parent (for guarded Next)
  useEffect(() => {
    if (typeof onRegisterIsDirty === "function") {
      onRegisterIsDirty(() => hasChanges);
    }
    if (typeof onRegisterSave === "function") {
      onRegisterSave(async () => {
        await handleSave();
        return true;
      });
    }
    if (typeof onRegisterValidate === "function") {
      // Full validation for moving to next step
      onRegisterValidate(() => validateForm(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasChanges, formData]);

  // Levels and languages data

  const levels = ["Beginner", "Intermediate", "Advanced"];
  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Portuguese",
    "Italian",
  ];

  // Real-time field validation
  const validateField = (field, value) => {
    switch (field) {
      case "title":
        if (!value.trim()) return "Course title is required";
        if (value.length < 10) return "Title should be at least 10 characters";
        if (value.length > 100)
          return "Title should be less than 100 characters";
        return "";
      case "subtitle":
        if (!value.trim()) return "Course subtitle is required";
        if (value.length < 10)
          return "Subtitle should be at least 10 characters";
        return "";
      case "description":
        if (!value.trim()) return "Course description is required";
        if (value.length < 200)
          return "Description should be at least 200 characters";
        return "";
      case "category":
        if (!value) return "Category is required";
        return "";
      case "thumbnailUrl":
        if (!value.trim()) return "Course image is required";
        return "";
      default:
        return "";
    }
  };

  // Validation with different levels for draft vs published
  const validateForm = (isDraftSave = true) => {
    const newErrors = {};

    if (isDraftSave) {
      // Minimal validation for draft - only require title
      const titleError = validateField("title", formData.title);
      if (titleError) newErrors.title = titleError;
    } else {
      // Full validation for published courses
      const fields = [
        "title",
        "subtitle",
        "description",
        "category",
        "thumbnailUrl",
      ];

      fields.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });

      // Validate learning objectives
      const validLearningObjectives = formData.learningObjectives.filter(
        (obj) => obj.trim().length > 0
      );
      if (validLearningObjectives.length === 0) {
        newErrors.learningObjectives =
          "At least one learning objective is required";
      }

      // Validate requirements
      const validRequirements = formData.requirements.filter(
        (req) => req.trim().length > 0
      );
      if (validRequirements.length === 0) {
        newErrors.requirements = "At least one requirement is required";
      }

      // Validate target audience
      const validTargetAudience = formData.targetAudience.filter(
        (aud) => aud.trim().length > 0
      );
      if (validTargetAudience.length === 0) {
        newErrors.targetAudience = "At least one target audience is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setFieldErrors = (field, error) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) newErrors[field] = error;
      else delete newErrors[field];
      return newErrors;
    });
  };

  // Handle input changes with real-time validation
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error if field becomes valid
    if (touched[field]) {
      const error = validateField(field, value);
      setFieldErrors(field, error);
    }
  };

  const handleInputBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setFieldErrors(field, error);
  };

  // Image upload handler with validation
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        thumbnailUrl:
          "Invalid file type. Please upload a JPG, PNG, or WebP image.",
      }));
      return;
    }

    // Validate file size <= 5MB
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors((prev) => ({
        ...prev,
        thumbnailUrl: "Image size must be 5MB or less.",
      }));
      return;
    }

    setImageUploading(true);
    try {
      if (courseId) {
        // Update existing course thumbnail
        const result = await uploadService.uploadCourseThumbnail(
          courseId,
          file
        );
        if (result.success) {
          handleInputChange("thumbnailUrl", result.data.thumbnailUrl);
          setErrors((prev) => ({ ...prev, thumbnailUrl: "" }));
        }
      } else {
        // For new courses, we'll handle the upload when the course is created
        // Store the file temporarily and show a local preview
        handleInputChange("thumbnailFile", file);
        const previewUrl = URL.createObjectURL(file);
        handleInputChange("thumbnailUrl", previewUrl);
        setErrors((prev) => ({ ...prev, thumbnailUrl: "" }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, thumbnailUrl: error.message }));
    } finally {
      setImageUploading(false);
    }
  };

  // Handle array field updates
  const updateArrayField = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updatedArray }));
  };

  const addArrayField = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      const updatedArray = formData[field].filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, [field]: updatedArray }));
    }
  };

  // Helper function to get the most important validation error
  const getPrimaryValidationError = (errors) => {
    const errorPriority = [
      "title",
      "subtitle",
      "description",
      "category",
      "thumbnailUrl",
    ];

    for (const field of errorPriority) {
      if (errors[field] && errors[field].trim()) {
        return errors[field];
      }
    }

    // If no priority error found, return the first available error
    const errorMessages = Object.values(errors).filter((error) => error.trim());
    return errorMessages[0] || "Please fix the validation errors";
  };

  // Save course landing page with smart logic
  const handleSave = async () => {
    console.log("Save button clicked", { hasChanges, isNewCourse, formData });

    // Validation: full for existing courses, minimal for new draft
    const isValid = isNewCourse ? validateForm(true) : validateForm(false);
    if (!isValid) {
      console.log("Validation failed", errors);

      // Show specific validation errors in toast
      const primaryError = getPrimaryValidationError(errors);
      const errorMessages = Object.values(errors).filter((error) =>
        error.trim()
      );

      if (errorMessages.length > 1) {
        toast.error(`${primaryError} (and ${errorMessages.length - 1} more)`);
      } else {
        toast.error(primaryError);
      }
      return false;
    }

    // Check if there are actual changes to save (but allow new courses to always save)
    if (!hasChanges && !isNewCourse) {
      console.log("No changes to save");
      toast.info("No changes to save");
      return false;
    }

    // For new courses, ensure we have at least a title
    if (isNewCourse && !formData.title?.trim()) {
      console.log("New course needs a title");
      toast.error("Course title is required");
      return false;
    }

    setSaving(true);
    try {
      let savedCourse;

      if (isNewCourse || !courseId) {
        // Create new draft course

        const coursePayload = {
          ...formData,
          status: "draft",
          completedSteps: ["landing-page"],
        };

        const response = await courseService.createCourse(coursePayload);
        console.log("Create course response:", response);
        savedCourse = response.data || response;

        // Update refs and state
        lastSavedDataRef.current = { ...formData };
        setHasChanges(false);
        setIsNewCourse(false);

        // Navigate to the edit page with the new course ID
        const newCourseId =
          savedCourse._id || savedCourse.id || savedCourse.courseId;

        if (onSave) onSave(formData, newCourseId);

        // Redirect to create page with course ID
        navigate(`/course/create/${newCourseId}`);
        toast.success(
          "Course draft created successfully! You can now continue building your course."
        );
      } else {
        // Update existing course

        const response = await courseService.updateCourseLandingPageEnhanced(
          courseId,
          formData
        );
        console.log("Update course response:", response);
        savedCourse = response.data || response;

        // Update refs and state
        lastSavedDataRef.current = { ...formData };
        setHasChanges(false);

        if (onSave) onSave(formData, courseId);

        toast.success("Course updated successfully!");
      }
      return true;
    } catch (error) {
      console.error("SAVE ERROR:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save course";
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border rounded-md shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Course landing page</h2>
        <p className="text-sm text-gray-700">
          Your course landing page is crucial to your success on Vidhyara. If
          it's done right, it can also help you gain visibility in search
          engines like Google.{" "}
          <Link to="/" className="text-purple-600 underline">
            Learn more
          </Link>
          .
        </p>
      </div>

      <div className="space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Course title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            onBlur={() => handleInputBlur("title")}
            placeholder="Insert your course title"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors duration-200 ${
              errors.title && touched.title
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-purple-500"
            }`}
            maxLength={100}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Your title should be attention-grabbing and informative
            </p>
            <span className="text-xs text-gray-400">
              {formData.title.length}/100
            </span>
          </div>
          {errors.title && touched.title && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ErrorIcon style={{ fontSize: 12 }} />
              {errors.title}
            </p>
          )}
        </div>

        {/* Course Subtitle */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Course subtitle
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleInputChange("subtitle", e.target.value)}
            onBlur={() => handleInputBlur("subtitle")}
            placeholder="Insert your course subtitle"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors duration-200 ${
              errors.subtitle && touched.subtitle
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-purple-500"
            }`}
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Use 1 or 2 related keywords and mention important areas covered
            </p>
            <span className="text-xs text-gray-400">
              {formData.subtitle.length}/200
            </span>
          </div>
          {errors.subtitle && touched.subtitle && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ErrorIcon style={{ fontSize: 12 }} />
              {errors.subtitle}
            </p>
          )}
        </div>

        {/* Course Description */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Course description
          </label>
          <textarea
            rows={8}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            onBlur={() => handleInputBlur("description")}
            placeholder="Insert your course description"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none transition-colors duration-200 ${
              errors.description && touched.description
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-purple-500"
            }`}
            maxLength={5000}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Description should have minimum 200 words for publishing
            </p>
            <span className="text-xs text-gray-400">
              {formData.description.length}/5000
            </span>
          </div>
          {errors.description && touched.description && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ErrorIcon style={{ fontSize: 12 }} />
              {errors.description}
            </p>
          )}
        </div>

        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium mb-2">Basic info</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, language: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Language</p>
            </div>
            <div>
              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, level: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Level</p>
            </div>
            <div>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.slug || cat.title} value={cat.title}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Category <span className="text-red-500">*</span>
              </p>
            </div>
            <div>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subcategory: e.target.value,
                  }))
                }
                placeholder="Subcategory"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Subcategory</p>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div>
          <label className="block text-sm font-medium mb-2">
            What will students learn in your course?{" "}
            <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Enter learning objectives that learners can expect to achieve.
          </p>
          {formData.learningObjectives.map((objective, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) =>
                  updateArrayField("learningObjectives", index, e.target.value)
                }
                placeholder="Example: Learn to build responsive websites"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                maxLength={200}
              />
              {formData.learningObjectives.length > 1 && (
                <button
                  onClick={() => removeArrayField("learningObjectives", index)}
                  className="px-3 py-2 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayField("learningObjectives")}
            className="text-purple-600 text-sm hover:text-purple-700 mt-2"
          >
            + Add learning objective
          </button>
          {errors.learningObjectives && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ErrorIcon style={{ fontSize: 12 }} />
              {errors.learningObjectives}
            </p>
          )}
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Requirements <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            What should students know before taking this course?
          </p>
          {formData.requirements.map((requirement, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={requirement}
                onChange={(e) =>
                  updateArrayField("requirements", index, e.target.value)
                }
                placeholder="Example: Basic computer skills"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                maxLength={200}
              />
              {formData.requirements.length > 1 && (
                <button
                  onClick={() => removeArrayField("requirements", index)}
                  className="px-3 py-2 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayField("requirements")}
            className="text-purple-600 text-sm hover:text-purple-700 mt-2"
          >
            + Add requirement
          </button>
          {errors.requirements && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ErrorIcon style={{ fontSize: 12 }} />
              {errors.requirements}
            </p>
          )}
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Who this course is for <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Describe who would benefit most from this course.
          </p>
          {formData.targetAudience.map((audience, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={audience}
                onChange={(e) =>
                  updateArrayField("targetAudience", index, e.target.value)
                }
                placeholder="Example: Beginners who want to learn web development"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                maxLength={200}
              />
              {formData.targetAudience.length > 1 && (
                <button
                  onClick={() => removeArrayField("targetAudience", index)}
                  className="px-3 py-2 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayField("targetAudience")}
            className="text-purple-600 text-sm hover:text-purple-700 mt-2"
          >
            + Add target audience
          </button>
          {errors.targetAudience && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ErrorIcon style={{ fontSize: 12 }} />
              {errors.targetAudience}
            </p>
          )}
        </div>

        {/* Course Thumbnail */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Course Image <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Upload a high-quality image for your course. Students will see this
            image when browsing courses. Recommended size: 750x422 pixels.
          </p>
          <div className="space-y-3">
            {/* Image Preview */}
            {formData.thumbnailUrl && (
              <div className="relative w-full max-w-md">
                <img
                  src={formData.thumbnailUrl}
                  alt="Course thumbnail"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, thumbnailUrl: "" }));
                    setErrors((prev) => ({
                      ...prev,
                      thumbnailUrl: "Course image is required",
                    }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                >
                  ×
                </button>
              </div>
            )}

            {/* Image Upload Input */}
            <div>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => {
                  handleInputChange("thumbnailUrl", e.target.value);
                }}
                onBlur={() => handleInputBlur("thumbnailUrl")}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use image URLs from services like Unsplash, Cloudinary,
                or your own hosting.
              </p>
            </div>

            {/* Upload via File */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="thumbnail-upload"
                ref={fileInputRef}
              />
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                <span>📁</span>
                <span>Choose image</span>
              </button>
              <div className="text-xs text-gray-400 mt-2">
                Supports: JPG, PNG, WebP (Max 5MB)
              </div>
              {imageUploading && (
                <div className="mt-2 text-sm text-blue-600">
                  Uploading image...
                </div>
              )}
            </div>
          </div>
          {errors.thumbnailUrl && touched.thumbnailUrl && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <ErrorIcon style={{ fontSize: 12 }} />
              {errors.thumbnailUrl}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8 border-t mt-8">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {isNewCourse ? (
            // For new courses, only check title
            formData.title ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircleIcon style={{ fontSize: 16 }} />
                <span>Ready to create draft</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600">
                <ErrorIcon style={{ fontSize: 16 }} />
                <span>Course title required</span>
              </div>
            )
          ) : // For existing courses, show change status
          hasChanges ? (
            <div className="flex items-center gap-1 text-blue-600">
              <CheckCircleIcon style={{ fontSize: 16 }} />
              <span>Changes detected - ready to save</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-600">
              <CheckCircleIcon style={{ fontSize: 16 }} />
              <span>No changes to save</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setFormData({ ...originalDataRef.current });
              setHasChanges(false);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={
              saving ||
              (!hasChanges && !isNewCourse) ||
              (isNewCourse && !formData.title?.trim())
            }
            title={`Debug: saving=${saving}, hasChanges=${hasChanges}, isNewCourse=${isNewCourse}, title="${formData.title}"`}
            className={`px-6 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
              hasChanges || isNewCourse
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-300 text-gray-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <SaveIcon style={{ fontSize: 16 }} />
            {saving
              ? "Saving..."
              : isNewCourse
              ? "Create Draft & Continue"
              : hasChanges
              ? "Save Changes & Continue"
              : "No Changes to Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseLandingPage;
