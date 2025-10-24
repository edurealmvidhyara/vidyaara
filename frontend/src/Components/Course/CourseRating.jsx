import React, { useState, useEffect } from "react";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import toast from "react-hot-toast";
import { courseService } from "../../services/courseService";

const CourseRating = ({ courseId, currentRating, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    // Load user's existing rating
    loadUserRating();
  }, [courseId]);

  const loadUserRating = async () => {
    try {
      const response = await courseService.getUserRating(courseId);
      if (response.success && response.data) {
        setUserRating(response.data);
        setRating(response.data.value);
        setComment(response.data.comment || "");
      }
    } catch (error) {
      console.error("Error loading user rating:", error);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoverRating(value);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await courseService.rateCourse(courseId, {
        value: rating,
        comment: comment.trim(),
      });

      if (response.success) {
        toast.success("Rating submitted successfully!");
        setUserRating({
          value: rating,
          comment: comment.trim(),
          createdAt: new Date(),
        });
        if (onRatingSubmit) {
          onRatingSubmit(response.data);
        }
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(error.message || "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStar = (index) => {
    const value = index + 1;
    const displayRating = hoverRating || rating;

    if (displayRating >= value) {
      return (
        <StarIcon
          className="text-yellow-400 cursor-pointer text-xl"
          onClick={() => handleStarClick(value)}
          onMouseEnter={() => handleStarHover(value)}
          onMouseLeave={handleStarLeave}
        />
      );
    } else if (displayRating >= value - 0.5) {
      return (
        <StarHalfIcon
          className="text-yellow-400 cursor-pointer text-xl"
          onClick={() => handleStarClick(value)}
          onMouseEnter={() => handleStarHover(value)}
          onMouseLeave={handleStarLeave}
        />
      );
    } else {
      return (
        <StarBorderIcon
          className="text-gray-300 cursor-pointer text-xl hover:text-yellow-400"
          onClick={() => handleStarClick(value)}
          onMouseEnter={() => handleStarHover(value)}
          onMouseLeave={handleStarLeave}
        />
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-base font-bold text-gray-900 mb-3">
        {userRating ? "Update Your Rating" : "Rate This Course"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index}>{renderStar(index)}</span>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `${rating}/5` : "Click to rate"}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this course..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            maxLength="500"
          />
          <div className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full cursor-pointer text-[0.8rem] bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Submitting..."
            : userRating
            ? "Update Rating"
            : "Submit Rating"}
        </button>
      </form>

      {/* Current Rating Display */}
      {userRating && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <StarIcon
                key={index}
                className={`text-xl ${
                  index < userRating.value ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              Your rating: {userRating.value}/5
            </span>
          </div>
          {userRating.comment && (
            <p className="text-sm text-gray-600 mt-2 italic">
              "{userRating.comment}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseRating;
