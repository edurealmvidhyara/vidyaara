import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getContentIcon } from "./constants";

const CurriculumList = ({
  curriculum,
  expandedSections,
  toggleSection,
  currentVideo,
  isContentCompleted,
  handleContentClick,
  isEnrolled,
}) => {
  console.log("isEnrolled in rightside ", isEnrolled);
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="divide-y divide-gray-200">
      {curriculum.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white">
          <button
            onClick={() => toggleSection(sectionIndex)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-600">
                {section.content?.length || 0} lectures •{" "}
                {formatDuration(
                  section.content?.reduce(
                    (total, content) => total + (content.duration || 0),
                    0
                  ) || 0
                )}
              </p>
            </div>
            {expandedSections.has(sectionIndex) ? "▲" : "▼"}
          </button>

          {expandedSections.has(sectionIndex) && (
            <div className="bg-white">
              {section.content?.map((content, contentIndex) => {
                const IconComponent = getContentIcon(content.contentType);
                const isCompleted = isContentCompleted(
                  sectionIndex,
                  contentIndex
                );
                const isCurrent =
                  currentVideo &&
                  currentVideo.sectionIndex === sectionIndex &&
                  currentVideo.contentIndex === contentIndex;
                const locked = !isEnrolled && sectionIndex > 0;

                return (
                  <button
                    key={contentIndex}
                    onClick={() => {
                      if (locked) return;
                      handleContentClick(
                        content,
                        sectionIndex,
                        contentIndex,
                        section.title
                      );
                    }}
                    className={`w-full px-6 py-3 text-left ${
                      locked
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    } flex items-center gap-3 border-l-4 ${
                      isCurrent
                        ? "border-blue-500 bg-blue-50"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircleIcon
                          className="text-green-600"
                          style={{ fontSize: 20 }}
                        />
                      ) : (
                        <IconComponent
                          className={
                            content.contentType === "video"
                              ? "text-blue-600"
                              : "text-gray-600"
                          }
                          style={{ fontSize: 20 }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium truncate ${
                          isCurrent ? "text-blue-600" : "text-gray-900"
                        }`}
                      >
                        {content.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="capitalize">
                          {content.contentType.replace("_", " ")}
                        </span>
                        {content.duration > 0 && (
                          <>
                            <span>•</span>
                            <AccessTimeIcon style={{ fontSize: 12 }} />
                            <span>{formatDuration(content.duration)}</span>
                          </>
                        )}
                        {content.isPreview && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">Preview</span>
                          </>
                        )}
                        {content.isFree && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600">Free</span>
                          </>
                        )}
                      </div>
                    </div>
                    {locked && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CurriculumList;
