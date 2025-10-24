import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";

const CourseMetaBlocks = ({ course }) => {
  return (
    <div className="flex items-center gap-4 text-sm text-gray-400">
      <div className="flex items-center gap-1">
        <AccessTimeIcon className="text-xs" />
        <span>Last updated {course.last_update_date || "Recently"}</span>
      </div>
      <div className="flex items-center gap-1">
        <LanguageIcon className="text-xs" />
        <span>{course.language || "English"}</span>
      </div>
    </div>
  );
};

export default CourseMetaBlocks;
