import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { instructorService } from "../../services/instructorService";
import Pagination from "../UI/Pagination";
import toast from "react-hot-toast";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [activeFilter, setActiveFilter] = useState("All");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasMore: false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Sync page from URL on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("page")) || 1;
    if (pageFromUrl !== pagination.currentPage) {
      setPagination((prev) => ({ ...prev, currentPage: pageFromUrl }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Fetch instructor courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your courses");
          return;
        }

        const result = await instructorService.getCourses({
          page: pagination.currentPage,
        });
        if (result.success) {
          // Ensure published courses show 100% progress
          const normalized = (result.data || []).map((c) => ({
            ...c,
            progress: c.status === "PUBLISHED" ? 100 : c.progress || 0,
          }));
          setCourses(normalized);
          setPagination(
            result.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalCourses: normalized.length,
              hasMore: false,
            }
          );
          setError(null);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [pagination.currentPage]);

  const handlePageChange = (newPage) => {
    // Update state
    setPagination((prev) => ({ ...prev, currentPage: newPage }));

    // Reflect in URL
    const params = new URLSearchParams(location.search);
    params.set("page", String(newPage));
    navigate({ search: `?${params.toString()}` }, { replace: true });
  };

  // Filter and search functionality
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Apply status filter
    if (activeFilter === "Published") {
      filtered = filtered.filter((course) => course.status === "PUBLISHED");
    } else if (activeFilter === "Draft") {
      filtered = filtered.filter((course) => course.status === "DRAFT");
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "Oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "A-Z":
          return a.title.localeCompare(b.title);
        case "Z-A":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, sortBy, activeFilter]);

  const getFilterCounts = () => {
    const all = courses.length;
    const published = courses.filter((c) => c.status === "PUBLISHED").length;
    const draft = courses.filter((c) => c.status === "DRAFT").length;
    return { all, published, draft };
  };

  const { all, published, draft } = getFilterCounts();

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-white min-h-screen font-sans">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-40 h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen font-sans">
        <div className="text-center py-12">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Error Loading Courses
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white font-sans">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 m-0">Courses</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search your courses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-56 h-9 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-500"
          >
            <option value="Newest">Newest</option>
            <option value="Oldest">Oldest</option>
            <option value="A-Z">A-Z</option>
            <option value="Z-A">Z-A</option>
          </select>
          {/* <button
            onClick={() => navigate("/course/create")}
            className="h-9 px-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 text-sm"
          >
            New Course
          </button> */}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveFilter("All")}
          className={`px-3 py-1 text-sm font-medium rounded-full border ${
            activeFilter === "All"
              ? "text-purple-600 bg-purple-50 border-purple-600"
              : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          All ({all})
        </button>
        <button
          onClick={() => setActiveFilter("Published")}
          className={`px-3 py-1 text-sm font-medium rounded-full border ${
            activeFilter === "Published"
              ? "text-purple-600 bg-purple-50 border-purple-600"
              : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          Published ({published})
        </button>
        <button
          onClick={() => setActiveFilter("Draft")}
          className={`px-3 py-1 text-sm font-medium rounded-full border ${
            activeFilter === "Draft"
              ? "text-purple-600 bg-purple-50 border-purple-600"
              : "text-gray-600 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          Draft ({draft})
        </button>
      </div>

      {/* Course List */}
      <div className="space-y-2 mb-8">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              {/* Course Info */}
              <div className="flex items-center space-x-3">
                {/* Course Image */}
                <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Course Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {course.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        course.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {course.status}
                    </span>
                    {course.totalStudents > 0 && (
                      <span>{course.totalStudents} students</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress and Actions */}
              <div className="flex items-center space-x-4">
                {/* Progress */}
                {course.status !== "PUBLISHED" ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${
                          course.progress > 70
                            ? "bg-blue-500"
                            : course.progress > 40
                            ? "bg-yellow-500"
                            : "bg-red-400"
                        }`}
                        style={{
                          width: `${Math.max(course.progress || 0, 5)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 min-w-[2.5rem]">
                      {course.progress || 0}%
                    </span>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {course.status === "PUBLISHED" && (
                    <button
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
                      title="Go to course page"
                    >
                      Go to course
                    </button>
                  )}
                  <button
                    onClick={() =>
                      navigate(`/instructor/course/edit/${course.id}`)
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
                    title="Edit course"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setCourseToDelete(course);
                      setConfirmText("");
                      setDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50"
                    title="Delete course"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {filteredCourses.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalCourses}
          itemsPerPage={8}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete course
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. To confirm, type the course name
              exactly:
            </p>
            <div className="bg-gray-100 text-gray-900 text-sm font-medium px-3 py-2 rounded mb-3">
              {courseToDelete.title}
            </div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type course name to confirm"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== courseToDelete.title}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(
                      `${
                        import.meta.env.VITE_API_BASE_URL ||
                        "http://localhost:5000/api"
                      }/courses/${courseToDelete.id}`,
                      {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );
                    if (!res.ok) {
                      const err = await res.json().catch(() => ({}));
                      throw new Error(err.message || "Failed to delete course");
                    }
                    setCourses((prev) =>
                      prev.filter((c) => c.id !== courseToDelete.id)
                    );
                    toast.success("Course deleted successfully");
                    setDeleteModalOpen(false);
                  } catch (e) {
                    toast.error(e.message || "Delete failed");
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm text-white ${
                  confirmText === courseToDelete.title
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
