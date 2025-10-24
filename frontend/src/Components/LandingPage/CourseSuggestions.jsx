import React, { useReducer, useState, useEffect } from "react";
import Carousel from "./Carousel";
import LinkButton from "../../share/UIElements/LinkButton";
import { courseService } from "../../services/courseService";
import Skeleton from "@mui/material/Skeleton";

const courseTabs = [
  { id: "Python", label: "Python", category: "Development" },
  { id: "JS", label: "JavaScript", category: "Development" },
  { id: "Aws", label: "AWS Certification", category: "IT & Software" },
  { id: "Excel", label: "Excel", category: "Office Productivity" },
  { id: "DataScience", label: "Data Science", category: "Development" },
];

const contentReducer = (state, action) => {
  switch (action.type) {
    case "Python":
      return {
        name: "Python",
        title: "Expand your career opportunities with Python",
        description:
          "Take one of Vidhyara's range of Python courses and learn how to code using this incredibly useful language. Its simple syntax and readability makes Python perfect for Flask, Django, data science, and machine learning...",
      };
    case "JS":
      return {
        name: "JavaScript",
        title: "Grow your software development skills with JavaScript",
        description:
          "JavaScript is a text-based programming language used to make dynamic web pages. A must-learn for aspiring web developers or programmers...",
      };
    case "Aws":
      return {
        name: "AWS Certification",
        title: "Become an expert in cloud computing with AWS Certification",
        description:
          "Prep for your AWS certification with an AWS course on Vidhyara. Learn the fundamentals such as serverless platforms, frameworks, security, and more...",
      };
    case "Excel":
      return {
        name: "Excel",
        title: "Analyze and visualize data with Excel",
        description:
          "Take a Microsoft Excel course from Vidhyara and learn how to use this industry-standard software. From organizing data to advanced formulas...",
      };
    case "DataScience":
      return {
        name: "Data Science",
        title: "Lead the future of data science",
        description:
          "Turn data into insights with our data science courses. Learn Python, R, machine learning, and more from industry experts...",
      };
    default:
      return {
        name: "Python",
        title: "Expand your career opportunities with Python",
        description:
          "Take one of Vidhyara's range of Python courses and learn how to code using this incredibly useful language. Its simple syntax and readability makes Python perfect for Flask, Django, data science, and machine learning...",
      };
  }
};

const CourseSuggestions = () => {
  const [content, dispatch] = useReducer(contentReducer, {
    name: "Python",
    title: "Expand your career opportunities with Python",
    description:
      "Take one of Vidhyara's range of Python courses and learn how to code using this incredibly useful language. Its simple syntax and readability makes Python perfect for Flask, Django, data science, and machine learning...",
  });

  const [activeTab, setActiveTab] = useState("Python");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses for the active tab
  const fetchCourses = async (tabId) => {
    try {
      setLoading(true);
      setError(null);

      const selectedTab = courseTabs.find((tab) => tab.id === tabId);
      const params = {
        category: selectedTab?.category || "Development",
        limit: 10,
        sort: "newest",
      };

      const response = await courseService.getAllCourses(params);

      if (response.success && response.data) {
        // Transform API data to match CourseCard component expectations
        const transformedCourses = response.data.courses || [];
        setCourses(transformedCourses);
      } else {
        throw new Error("Failed to fetch courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
      // Fallback to empty array on error
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses(activeTab);
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    dispatch({ type: tabId });
    fetchCourses(tabId);
  };

  return (
    <div className="w-full max-w-[1340px] mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          A broad selection of courses
        </h2>

        {/* Course Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {courseTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {content.title}
        </h3>
        <p className="text-gray-600 max-w-4xl">{content.description}</p>
      </div>

      {/* Courses Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton variant="rectangular" width="100%" height={200} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={16} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => fetchCourses(activeTab)}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      ) : courses.length > 0 ? (
        <Carousel data={courses} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No courses found for this category.</p>
        </div>
      )}

      {/* Explore More Button */}
      {/* <div className="mt-8 text-center">
        <LinkButton
          to="/courses"
          className="px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-colors duration-200"
        >
          Explore all {content.name} courses
        </LinkButton>
      </div> */}
    </div>
  );
};

export default CourseSuggestions;
