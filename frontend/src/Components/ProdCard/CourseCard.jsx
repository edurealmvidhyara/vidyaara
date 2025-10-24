import { Star, StarHalf } from "@mui/icons-material";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faHeart } from "@fortawesome/free-solid-svg-icons";
// import { faHeart as faHeartOutlined } from "@fortawesome/free-regular-svg-icons";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course, onWishlistToggled }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Normalize incoming course shapes from different sources
  const normalizedCourse = {
    id: course?.id || course?._id || course?.courseId || course?.slug, // fallback if routes use slug
    img:
      course?.img ||
      course?.image ||
      course?.thumbnailUrl ||
      course?.thumbnail ||
      course?.imageUrl ||
      course?.coverImage,
    title: course?.title || course?.name || course?.courseTitle || "",
    desc:
      course?.desc ||
      course?.subtitle ||
      course?.shortDescription ||
      course?.description ||
      "",
    rateScore:
      course?.rateScore ??
      course?.rating ??
      course?.averageRating ??
      course?.avgRating ??
      0,
    reviewerNum:
      course?.reviewerNum ??
      course?.numReviews ??
      course?.reviewsCount ??
      course?.reviewCount ??
      0,
  };

  // Check if course is in wishlist from user data
  // const isInWishlist =
  //   user.user?.wishlist?.some(
  //     (id) => String(id) === String(normalizedCourse.id)
  //   ) || false;

  // const handleWishlistToggle = async (e) => {
  //   // Prevent navigating to course page when clicking the heart inside the Link
  //   if (e && typeof e.preventDefault === "function") e.preventDefault();
  //   if (e && typeof e.stopPropagation === "function") e.stopPropagation();
  //   if (isLoading) return;
  //   setIsLoading(true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     if (isInWishlist) {
  //       // Remove from wishlist
  //       await axios.delete(`${API_BASE_URL}/wishlist/${normalizedCourse.id}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       // Update user data in Redux
  //       const updatedUserPayload = {
  //         ...user,
  //         user: {
  //           ...user.user,
  //           wishlist: (user.user?.wishlist || []).filter(
  //             (id) => String(id) !== String(normalizedCourse.id)
  //           ),
  //         },
  //       };
  //       dispatch({ type: "UPDATE_USER", payload: updatedUserPayload });
  //       if (typeof onWishlistToggled === "function") onWishlistToggled();
  //     } else {
  //       // Add to wishlist
  //       await axios.post(
  //         `${API_BASE_URL}/wishlist/${normalizedCourse.id}`,
  //         {},
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       // Update user data in Redux
  //       const updatedUserPayload = {
  //         ...user,
  //         user: {
  //           ...user.user,
  //           wishlist: [
  //             ...((user.user && user.user.wishlist) || []),
  //             normalizedCourse.id,
  //           ],
  //         },
  //       };
  //       dispatch({ type: "UPDATE_USER", payload: updatedUserPayload });
  //       if (typeof onWishlistToggled === "function") onWishlistToggled();
  //     }
  //   } catch (error) {
  //     console.error("Error toggling wishlist:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const renderStars = () => {
    const fullStars = Math.floor(normalizedCourse.rateScore || 0);
    const halfStar = (normalizedCourse.rateScore || 0) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            style={{ color: "#e59819", fontSize: "0.8rem" }}
          />
        ))}
        {halfStar && (
          <StarHalf style={{ color: "#e59819", fontSize: "0.8rem" }} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            style={{ color: "gray", fontSize: "0.8rem" }}
          />
        ))}
      </>
    );
  };

  return (
    // <Link
    //   to={`/course/${normalizedCourse.id}`}
    //   className="block no-underline text-inherit hover:shadow-lg transition-shadow duration-200 p-0"
    // >
    <div
      className="relative max-w-[17.5rem] min-w-[10.3rem] w-full"
      onClick={() => navigate(`/course/${normalizedCourse.id}`)}
    >
      <div className="flex flex-col courses-start  text-[#1c1d1f] cursor-pointer rounded-md border border-gray-200 hover:shadow-md transition-shadow duration-200 ">
        <div className="w-full relative overflow-hidden rounded-t-md" style={{ paddingTop: "56.25%" }}>
          <img
            src={normalizedCourse.img}
            alt={normalizedCourse.title}
            className="absolute inset-0 block w-full h-full object-cover"
          />
        </div>

        <div className="w-full text-[1rem] font-normal leading-[1.4] p-3">
          <h3 className="text-[1rem] h-[40px] overflow-hidden text-ellipsis whitespace-normal mt-[0.4rem] mb-[0.4rem] tracking-[-0.02rem] font-bold leading-[1.2]">
            {normalizedCourse.title}
          </h3>
          <div className="h-[35px] text-[0.8rem] leading-[1.4] mb-[0.6rem] text-[#6a6f73] line-clamp-2 text-ellipsis ">
            {normalizedCourse.desc}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-[0.4rem] text-[#b4690e] font-bold leading-[1.2] tracking-[-0.02rem] text-[0.9rem]">
                {normalizedCourse.rateScore}
              </span>
              <div className="flex items-center">{renderStars()}</div>
              <span className="text-[#6a6f73] ml-[0.4rem] font-normal leading-[1.4] text-[0.8rem]">
                ({normalizedCourse.reviewerNum})
              </span>
            </div>
            {/* Wishlist button commented out */}
            {/* <button
              type="button"
              onClick={handleWishlistToggle}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={isLoading}
              className="w-8 h-8 ml-2 flex items-center justify-center rounded-full bg-transparent border border-gray-300 hover:border-gray-500 disabled:opacity-60"
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <FontAwesomeIcon
                icon={isInWishlist ? faHeart : faHeartOutlined}
                style={{
                  color: isInWishlist ? "#8710d8" : "#1c1d1f",
                  fontSize: "16px",
                }}
              />
            </button> */}
          </div>
        </div>
      </div>
    </div>
    // </Link>
  );
};

export default CourseCard;
