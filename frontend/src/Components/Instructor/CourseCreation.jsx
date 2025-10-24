import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { instructorService } from "../../services/instructorService";
import { courseService } from "../../services/courseService";

const CourseCreation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    courseType: "",
    title: "",
    category: "",
    timeCommitment: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const [availableCategories, setAvailableCategories] = useState([]);

  // Load categories from backend so it's uniform across the app
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await courseService.getHomeCategories();
        const list = res?.data || res || [];
        setAvailableCategories(list);
      } catch (e) {
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

  const steps = [
    {
      id: 1,
      title: "First, let's find out what type of course you're making.",
      options: [
        {
          id: "course",
          title: "Course",
          description:
            "Create rich learning experiences with the help of video lectures, quizzes, coding exercises, etc.",
          icon: "▶",
        },
        {
          id: "practice-test",
          title: "Practice Test",
          description:
            "Help students prepare for certification exams by providing practice questions.",
          icon: "📝",
        },
      ],
    },
    {
      id: 2,
      title: "How about a working title?",
      subtitle:
        "It's ok if you can't think of a good one yet. You can change it later.",
      placeholder: "e.g. Learn Photoshop CS6 from Scratch",
    },
    {
      id: 3,
      title: "What category best fits the knowledge you'll share?",
      subtitle:
        "If you're not sure about the right category, you can change it later.",
      options: [],
    },
    {
      id: 4,
      title: "How much time can you spend creating your course per week?",
      subtitle:
        "There's no wrong answer. We can help you create a course that fits your schedule.",
      options: [
        {
          id: "0-2",
          title: "0-2 hours",
          description: "I can only work on this on the side",
        },
        {
          id: "3-5",
          title: "3-5 hours",
          description: "I can work on this regularly",
        },
        {
          id: "6-10",
          title: "6-10 hours",
          description: "I have lots of flexibility",
        },
        {
          id: "10+",
          title: "10+ hours",
          description: "I have plenty of time to focus on this",
        },
      ],
    },
  ];

  // Validation functions
  const validateField = (field, value) => {
    switch (field) {
      case "title":
        if (!value.trim()) return "Course title is required";
        if (value.length < 10) return "Title should be at least 10 characters";
        if (value.length > 60) return "Title should be less than 60 characters";
        return "";
      case "courseType":
        if (!value) return "Please select a course type";
        return "";
      case "category":
        if (!value) return "Please select a category";
        return "";
      case "timeCommitment":
        if (!value) return "Please select your time commitment";
        return "";
      default:
        return "";
    }
  };

  const validateCurrentStep = () => {
    const stepKey = {
      1: "courseType",
      2: "title",
      3: "category",
      4: "timeCommitment",
    };

    const field = stepKey[currentStep];
    if (field) {
      const error = validateField(field, courseData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
      return !error;
    }
    return true;
  };

  const handleOptionSelect = (value) => {
    const stepKey = {
      1: "courseType",
      2: "title",
      3: "category",
      4: "timeCommitment",
    };

    const field = stepKey[currentStep];

    // Clear error when selecting an option
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Update local state immediately
    const nextData = { ...courseData, [field]: value };
    setCourseData(nextData);

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }

    if (currentStep === steps.length) {
      // Final step: use the freshly selected value without waiting for state flush
      handleCreateCourse(nextData);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;

    setCourseData({
      ...courseData,
      title: value,
    });

    // Real-time validation - clear error if field becomes valid
    if (touched.title) {
      const error = validateField("title", value);
      setErrors((prev) => ({ ...prev, title: error }));
    }
  };

  const handleInputBlur = (e) => {
    setTouched((prev) => ({ ...prev, title: true }));
    const error = validateField("title", e.target.value);
    setErrors((prev) => ({ ...prev, title: error }));
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    setTouched((prev) => ({ ...prev, title: true }));

    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateCourse = async (overrideData) => {
    // Validate all fields before submitting
    const allErrors = {};
    const dataToUse = overrideData || courseData;
    Object.keys(dataToUse).forEach((field) => {
      const error = validateField(field, dataToUse[field]);
      if (error) allErrors[field] = error;
    });

    setErrors(allErrors);
    setTouched({
      courseType: true,
      title: true,
      category: true,
      timeCommitment: true,
    });

    if (Object.keys(allErrors).some((key) => allErrors[key])) {
      return; // Don't submit if there are errors
    }

    try {
      const result = await instructorService.createCourse({
        title: dataToUse.title,
        category: dataToUse.category,
        type: dataToUse.courseType,
        timeCommitment: dataToUse.timeCommitment,
      });

      if (result.success) {
        // Redirect to course creation workflow with the new course ID
        navigate(`/instructor/course/edit/${result.data.courseId}`);
      } else {
        console.error("Course creation failed:", result.message);
        // If API fails, still redirect to workflow for demo purposes
        navigate("/instructor/course/create");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      // If API fails, still redirect to workflow for demo purposes
      navigate("/instructor/course/create");
    }
  };

  const currentStepData = steps.find((step) => step.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link to="/" className="flex items-center">
            <img
              src="https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"
              alt="Vidhyara"
              className="h-8"
            />
          </Link>
          <button
            onClick={() => navigate("/instructor/courses")}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-3 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 font-medium">
              Step {currentStep} of {steps.length}
            </span>
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-4">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Step Title */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {currentStepData?.title}
            </h1>
            {currentStepData?.subtitle && (
              <p className="text-base text-gray-600 leading-relaxed">
                {currentStepData.subtitle}
              </p>
            )}
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            {/* Step 1 & 4: Option Cards */}
            {(currentStep === 1 || currentStep === 4) && (
              <div className="space-y-3">
                {currentStepData.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.title)}
                    className="w-full p-5 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-25 hover:shadow-sm transition-all duration-200 text-left group bg-white"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-xl group-hover:scale-105 transition-transform duration-200 mt-1">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Error Message */}
                {touched[currentStep === 1 ? "courseType" : "timeCommitment"] &&
                  errors[
                    currentStep === 1 ? "courseType" : "timeCommitment"
                  ] && (
                    <div className="mt-3 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {
                        errors[
                          currentStep === 1 ? "courseType" : "timeCommitment"
                        ]
                      }
                    </div>
                  )}
              </div>
            )}

            {/* Step 2: Title Input */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    placeholder={currentStepData.placeholder}
                    value={courseData.title}
                    onChange={handleInputChange}
                    onBlur={(e) => handleInputBlur(e)}
                    className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.title && touched.title
                        ? "border-red-500"
                        : "border-gray-300 focus:border-purple-500"
                    }`}
                    maxLength="60"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div>
                      {errors.title && touched.title && (
                        <span className="text-sm text-red-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.title}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {courseData.title.length}/60
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Category Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(availableCategories || []).map((cat) => (
                      <button
                        key={cat.slug || cat.title}
                        onClick={() => handleOptionSelect(cat.title)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-25 transition-all duration-200 text-left"
                      >
                        <span className="text-gray-900 font-medium text-sm">
                          {cat.title}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Error Message */}
                  {touched.category && errors.category && (
                    <div className="mt-3 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.category}
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Previous
                  </button>
                </div>
              </div>
            )}

            {/* Final Step: Course Creation Summary */}
            {currentStep > steps.length && (
              <div className="text-center space-y-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    You're ready to create your course!
                  </h2>
                  <p className="text-base text-gray-600 mb-8 leading-relaxed">
                    Based on your selections, we'll help you create an amazing
                    learning experience.
                  </p>
                </div>

                {/* Course Summary */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-4 text-base">
                    Course Summary:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">
                        {courseData.courseType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium text-gray-900">
                        {courseData.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">
                        {courseData.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Commitment:</span>
                      <span className="font-medium text-gray-900">
                        {courseData.timeCommitment}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleBack}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateCourse}
                    className="px-8 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
                  >
                    Create Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseCreation;
