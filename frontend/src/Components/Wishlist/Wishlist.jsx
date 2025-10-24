import React, { useState, useEffect } from "react";
import CourseCard from "../ProdCard/CourseCard";
import Pagination from "../UI/Pagination";
// Removed local search UI in favor of global header search
import { useSelector } from "react-redux";
// import { wishlistService } from "../../services/wishlistService"; // Commented out wishlist

const Wishlist = () => {
  const [activeTab, setActiveTab] = useState("wishlist");
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasMore: false,
  });
  const { user } = useSelector((store) => store.auth).user;
  console.log("user in wishlist", user);

  const tabs = [
    { id: "mylists", label: "My Lists" },
    { id: "wishlist", label: "Wishlist" },
    // { id: "archived", label: "Archived" },
    // { id: "learningtools", label: "Learning tools" },
  ];

  // Fetch wishlist courses when tab is active
  useEffect(() => {
    if (activeTab === "wishlist" && user?.wishlist?.length > 0) {
      fetchWishlistCourses();
    } else if (activeTab === "wishlist") {
      setWishlistCourses([]);
      setLoading(false);
    }
  }, [activeTab, user?.wishlist, pagination.currentPage]);

  const fetchWishlistCourses = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token || !user?.wishlist?.length) {
        setWishlistCourses([]);
        return;
      }

      const response = await wishlistService.getWishlist({ page });
      console.log("response in wishlist", response);
      setWishlistCourses(response.wishlist || []);
      setPagination(
        response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCourses: response.wishlist?.length || 0,
          hasMore: false,
        }
      );
    } catch (error) {
      console.error("Error fetching wishlist courses:", error);
      setWishlistCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    fetchWishlistCourses(newPage);
  };

  const wishlistCount = user?.wishlist?.length || 0;

  return (
    <div className="w-full">
      {/* Header only if wishlist has items */}
      {wishlistCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <h1 className="text-2xl font-bold mb-2">Wishlist</h1>
          <p className="text-sm text-gray-600">
            Save courses to revisit later. Add or remove with the heart icon.
          </p>
        </div>
      )}

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "allcourses" && (
          <div>
            <h3 className="text-xl font-semibold">All Courses</h3>
            <p className="text-gray-600">
              View all your enrolled courses here.
            </p>
          </div>
        )}
        {activeTab === "mylists" && <div>No lists yet.</div>}
        {activeTab === "wishlist" && (
          <Wishcard
            wishlist={wishlistCourses}
            loading={loading}
            onRefresh={fetchWishlistCourses}
            userWishlist={user?.wishlist || []}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
        {activeTab === "archived" && (
          <div>
            <h3 className="text-xl font-semibold">Archived Courses</h3>
            <p className="text-gray-600">
              Your archived courses will appear here.
            </p>
          </div>
        )}
        {activeTab === "learningtools" && (
          <div>
            <h3 className="text-xl font-semibold">Learning Tools</h3>
            <p className="text-gray-600">Explore your learning tools here.</p>
          </div>
        )}
      </div>

      {/* Removed local search bar to avoid duplication with global header search */}
    </div>
  );
};

export default Wishlist;

const Wishcard = ({
  wishlist,
  loading,
  onRefresh,
  userWishlist,
  pagination,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="mt-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading wishlist...</p>
      </div>
    );
  }

  if (!userWishlist || userWishlist.length === 0) {
    return (
      <div className="mt-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Your Wishlist is Empty
        </h3>
        <p className="text-sm text-gray-600">
          Start adding courses to your wishlist by clicking the heart icon on
          any course card.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          Wishlisted Courses ({pagination.totalCourses || userWishlist.length})
        </h3>
        <button
          onClick={() => onRefresh(1)}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {wishlist.map((course) => (
          <CourseCard
            key={course._id || course.id}
            course={course}
            onWishlistToggled={() => onRefresh(pagination.currentPage)}
          />
        ))}
      </div>

      {wishlist.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalCourses}
          itemsPerPage={8}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
