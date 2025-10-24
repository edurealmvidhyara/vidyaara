import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import CourseCard from "../ProdCard/CourseCard";
import Pagination from "../UI/Pagination";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults = () => {
  const q = useQuery();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasMore: false,
  });

  const query = q.get("q");
  const category = q.get("category");
  const page = parseInt(q.get("page")) || 1;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page };
        if (query) params.search = query;
        if (category) params.category = category;
        const res = await courseService.getAllCourses(params);
        // Handle various response shapes gracefully
        const courses =
          res?.data?.courses || res?.courses || res?.data?.data?.courses || [];
        const paginationData = res?.data?.pagination || res?.pagination;

        setItems(courses);
        setPagination(
          paginationData || {
            currentPage: 1,
            totalPages: 1,
            totalCourses: courses.length,
            hasMore: false,
          }
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [query, category, page]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(q);
    params.set("page", newPage.toString());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">
        {category
          ? `Category: ${category}`
          : query
          ? `Searched for: ${query}`
          : "Courses"}
      </h1>
      {query && (
        <p className="text-sm text-gray-600 mb-4">Showing related courses</p>
      )}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {items.map((c) => (
              <CourseCard key={c.id || c._id} course={c} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center text-gray-600 py-8">
                No courses found.
              </div>
            )}
          </div>

          {items.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCourses}
              itemsPerPage={8}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
