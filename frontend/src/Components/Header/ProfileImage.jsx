import React, { useState } from "react";
import { useSelector } from "react-redux";

const ProfileImage = ({
  size = "md",
  className = "",
  showBorder = true,
  user = null,
}) => {
  const { user: authUser } = useSelector((store) => store.auth);
  const currentUser = user || authUser?.user;

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const getInitial = (name) => {
    if (!name) return "U";
    const first = (name.first || "").trim();
    const last = (name.last || "").trim();
    const firstInitial = (first.charAt(0) || "U").toUpperCase();
    const lastInitial = (last.charAt(0) || "").toUpperCase();
    return `${firstInitial}${lastInitial}`.trim();
  };

  const [showFallback, setShowFallback] = useState(false);
  const profilePicture = currentUser?.profilePicture || currentUser?.avatarUrl;

  if (profilePicture && !showFallback) {
    return (
      <img
        src={profilePicture}
        alt={`${currentUser?.name?.first || "User"} ${
          currentUser?.name?.last || ""
        }`}
        className={`${sizeClasses[size]} ${
          showBorder ? "border-2 border-gray-200" : ""
        } rounded-full object-cover ${className}`}
        onError={() => setShowFallback(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${
        showBorder ? "border-2 border-gray-200" : ""
      } rounded-full bg-black flex items-center justify-center font-semibold text-white ${className}`}
    >
      {getInitial(currentUser?.name)}
    </div>
  );
};

export default ProfileImage;
