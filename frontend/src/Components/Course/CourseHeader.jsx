import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../../services/userService";
import StarIcon from "@mui/icons-material/Star";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import LanguageIcon from "@mui/icons-material/Language";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import toast from "react-hot-toast";

const CourseHeader = ({
  course,
  onEnroll,
  enrollmentLoading = false,
  isInstructorUser,
}) => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    if (onEnroll) {
      onEnroll();
    }
  };
  console.log(
    "isInstructorUserisInstructorUserisInstructorUser",
    isInstructorUser
  );

  const handleEditCourse = () => {
    navigate(`/course/edit/${course._id || course.id}`);
  };

  return (
    <div className="bg-[#fafafa] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Main Course Info */}
          <div className="flex-1">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {course.title}
              </h1>
              <p className="text-base text-gray-600 mb-4 leading-relaxed">
                {course.headline ||
                  course.subtitle ||
                  "Master the fundamentals and advance your skills with this comprehensive course."}
              </p>
            </div>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold text-base">
                  {course.rating ? course.rating.toFixed(1) : "No ratings"}
                </span>
                {course.rating > 0 && (
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`text-sm ${
                          star <= course.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <span className="text-gray-600 ml-2 text-sm">
                  ({course.total_ratings?.toLocaleString() || "0"} ratings)
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <PeopleIcon className="text-gray-500 text-sm" />
                <span>
                  {course.total_students?.toLocaleString() || "0"} students
                  enrolled
                </span>
              </div>

              {course.totalDuration && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <AccessTimeIcon className="text-gray-500 text-sm" />
                  <span>{Math.round(course.totalDuration / 3600)} hours</span>
                </div>
              )}
            </div>

            {/* Course Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <LanguageIcon className="text-gray-500 text-base" />
                <div>
                  <p className="text-xs text-gray-500">Language</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {course.language || "English"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SignalCellularAltIcon className="text-gray-500 text-base" />
                <div>
                  <p className="text-xs text-gray-500">Level</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {course.level || "Beginner"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CalendarTodayIcon className="text-gray-500 text-base" />
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {course.updatedAt
                      ? new Date(course.updatedAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AccessTimeIcon className="text-gray-500 text-base" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {course.totalDuration
                      ? `${Math.round(course.totalDuration / 3600)}h`
                      : "Flexible"}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            {course.instructor && (
              <Link
                to={`/profile/${course.instructorId}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {course.instructor.avatar ? (
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : null}
                <div>
                  <p className="text-xs text-gray-500">Created by</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {course.instructor.name}
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 lg:flex-shrink-0">
            {/* Show Edit button for instructor, Enroll button for students */}
            {isInstructorUser ? (
              <button
                className="cursor-pointer text-[0.8rem] bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors"
                onClick={handleEditCourse}
              >
                <EditIcon
                  style={{ fontSize: "0.9rem", paddingRight: "0.2rem" }}
                />
                Edit Course
              </button>
            ) : (
              <>
                {!course?.isEnrolled && (
                  <button
                    className="cursor-pointer text-[0.8rem] bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                  >
                    {enrollmentLoading ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}

                {course?.isEnrolled && (
                  <div className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium text-center">
                    ✓ Enrolled
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;
