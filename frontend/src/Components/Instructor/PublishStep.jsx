import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningIcon from "@mui/icons-material/Warning";
import { instructorService } from "../../services/instructorService";

const PublishStep = ({ courseId, courseData, onPublish, onBack }) => {
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Run validation when component mounts
  React.useEffect(() => {
    validateCourse();
  }, [courseData]);

  // Validate course before publishing
  const validateCourse = () => {
    const errors = [];

    if (!courseData?.title?.trim()) {
      errors.push("Course title is required");
    }

    if (!courseData?.subtitle?.trim()) {
      errors.push("Course subtitle is required");
    }

    if (
      !courseData?.description ||
      courseData.description.trim().length < 200
    ) {
      errors.push("Course description must be at least 200 characters");
    }

    if (!courseData?.category) {
      errors.push("Course category is required");
    }

    if (!courseData?.thumbnailUrl) {
      errors.push("Course thumbnail image is required");
    }

    if (
      !courseData?.learningObjectives ||
      courseData.learningObjectives.filter((obj) => obj && obj.trim()).length <
        4
    ) {
      errors.push("At least 4 learning objectives are required");
    }

    if (!courseData?.sections || courseData.sections.length === 0) {
      errors.push("Course must have at least one section");
    } else {
      const hasContent = courseData.sections.some(
        (section) => section.content && section.content.length > 0
      );
      if (!hasContent) {
        errors.push("Course must have at least one lecture or content item");
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePublish = async () => {
    if (!validateCourse()) {
      return;
    }

    setPublishing(true);
    try {
      const response = await instructorService.publishCourse(courseId);

      if (response.success) {
        if (onPublish) {
          onPublish({ status: "published" });
        }

        // Redirect to instructor courses page
        navigate("/instructor/courses");
      } else {
        // If there are validation errors from backend, show them
        if (response.errors && Array.isArray(response.errors)) {
          setValidationErrors(response.errors);
        }
      }
    } catch (error) {
      console.error("PUBLISH ERROR:", error);
    } finally {
      setPublishing(false);
    }
  };

  const isReadyToPublish = validationErrors.length === 0;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 border rounded-md shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Publish Your Course</h2>
      <p className="text-gray-600 mb-6">
        Review your course details and curriculum before publishing. Once
        published, students will be able to discover and enroll in your course.
      </p>

      {/* Validation Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {isReadyToPublish ? (
            <>
              <CheckCircleIcon className="text-green-600" />
              <span className="text-green-600 font-medium">
                Course is ready to publish!
              </span>
            </>
          ) : (
            <>
              <WarningIcon className="text-amber-600" />
              <span className="text-amber-600 font-medium">
                Course needs attention before publishing
              </span>
            </>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2">
              Please fix the following issues:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Course Summary */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="font-semibold mb-4">Course Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Title:</span>{" "}
            {courseData?.title || "Not set"}
          </div>
          <div>
            <span className="font-medium">Category:</span>{" "}
            {courseData?.category || "Not set"}
          </div>
          <div>
            <span className="font-medium">Level:</span>{" "}
            {courseData?.level || "Not set"}
          </div>
          <div>
            <span className="font-medium">Language:</span>{" "}
            {courseData?.language || "Not set"}
          </div>
          <div>
            <span className="font-medium">Sections:</span>{" "}
            {courseData?.sections?.length || 0}
          </div>
          <div>
            <span className="font-medium">Total Content:</span>{" "}
            {courseData?.sections?.reduce(
              (total, section) => total + (section.content?.length || 0),
              0
            ) || 0}{" "}
            items
          </div>
          <div>
            <span className="font-medium">Learning Objectives:</span>{" "}
            {courseData?.learningObjectives?.filter((obj) => obj && obj.trim())
              .length || 0}
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                courseData?.status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {courseData?.status?.toUpperCase() || "DRAFT"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-2"
        >
          <ArrowBackIcon style={{ fontSize: 16 }} />
          Back to Curriculum
        </button>

        <button
          onClick={handlePublish}
          disabled={publishing || !isReadyToPublish}
          className={`px-6 py-2 rounded-md flex items-center gap-2 font-medium ${
            isReadyToPublish && !publishing
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <CheckCircleIcon style={{ fontSize: 16 }} />
          {publishing ? "Publishing..." : "Publish Course"}
        </button>
      </div>
    </div>
  );
};

export default PublishStep;
