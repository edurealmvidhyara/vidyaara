import React, { useEffect, useState } from "react";
import { userService } from "../../services/userService";
import CourseCard from "../ProdCard/CourseCard";

const MyLearning = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  const fetchEnrolled = async () => {
    setLoading(true);
    try {
      const res = await userService.getEnrolledCourses(1, 50);
      if (res.success) {
        const list = res.data?.courses || [];
        setCourses(list);
      } else {
        console.error("Failed to fetch enrolled courses:", res.message);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolled();
  }, []);

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-2xl font-bold mb-2">My learning</h1>
        {courses.length > 0 && (
          <p className="text-sm text-gray-600">
            Your enrolled courses appear here. Click a course to continue.
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-sm text-center text-gray-600 mt-10">
            You haven't enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;
