import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DescriptionIcon from "@mui/icons-material/Description";
import BarChartIcon from "@mui/icons-material/BarChart";
import DraftCourses from "./DraftCourses";
import { fetchUserData } from "../../Redux/login/action";
import { instructorService } from "../../services/instructorService";

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user from Redux store
  const { user } = useSelector((store) => store.auth);
  const userData = user?.user;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user?.user) {
      dispatch(fetchUserData(token));
    }
  }, [dispatch, user]);

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await instructorService.getCourses();
        if (result.success) {
          setCourses(result.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Aggregate stats
  const totalStudents = courses.reduce(
    (sum, c) => sum + (c.totalStudents || 0),
    0
  );
  const totalReviews = courses.reduce(
    (sum, c) => sum + (c.totalRatings || 0),
    0
  );


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base">←</span>
            <span>Back</span>
          </button>
        </div>
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {userData.fullName}!
                </h1>
                <p className="text-base text-gray-600 leading-relaxed">
                  Ready to create your next course?
                </p>
              </div>
              <button
                onClick={() => navigate("/course/create")}
                className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
              >
                Create New Course
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PlayArrowIcon
                  className="text-blue-600"
                  style={{ fontSize: 20 }}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChartIcon
                  className="text-green-600"
                  style={{ fontSize: 20 }}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DescriptionIcon
                  className="text-purple-600"
                  style={{ fontSize: 20 }}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Reviews
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {totalReviews}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Courses
            </h2>
          </div>
          <div className="p-0">
            <DraftCourses />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tips to get started
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  Plan your course
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Define learning objectives and structure your content
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  Create quality content
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Record high-quality videos and engaging materials
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorCourses;
