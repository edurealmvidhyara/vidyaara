import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoSection from "./VideoSection";
import CurriculumList from "./CurriculumList";
import CourseHeader from "./CourseHeader";
import ReactPlayer from "react-player";
import CourseRating from "./CourseRating";

import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import SettingsIcon from "@mui/icons-material/Settings";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockIcon from "@mui/icons-material/Lock";
import toast from "react-hot-toast";
import {
  FALLBACK_MP4_URL,
  isYoutubeUrl,
  isVimeoUrl,
  getContentIcon,
  formatDuration,
} from "./constants";
import { courseService } from "../../services/courseService";
import { uploadService } from "../../services/uploadService";
import { userService } from "../../services/userService";
import { useSelector } from "react-redux";

const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { user } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [isInstructorUser, setIsInstructorUser] = useState(false);

  // Course data
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);

  // Video player state
  const [currentVideo, setCurrentVideo] = useState(null);
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const FALLBACK_SRC = FALLBACK_MP4_URL;

  // UI state
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [completedContent, setCompletedContent] = useState(new Set());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [activeVideoTab, setActiveVideoTab] = useState("overview");

  // Authentication and enrollment state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  // Instructor functionality
  const [isInstructor, setIsInstructor] = useState(false);
  const [showNoteUpload, setShowNoteUpload] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    topic: "",
    description: "",
    file: null,
  });

  const fetchUserData =async()=>{
    const response = await userService.getProfile();
    setUser(response.data);
  }

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      setLoading(true);

      try {
        // Load course basic data first (contains currentUserId when authenticated)
        const courseResponse = await courseService.getCourseBasic(id);
        if (courseResponse.success) {
          setCourse(courseResponse.data);
        }

        // Ensure user/profile data is available
        const token = localStorage.getItem("token");
        let userData = user?.user;
        if (token && !userData) {
          try {
            const profileRes = await userService.getProfile();
            userData = profileRes?.user || profileRes?.data?.user || null;
            setUser(profileRes?.data || profileRes || null);
          } catch (_) {}
        }

        const loggedIn = !!token && !!userData;
        setIsLoggedIn(loggedIn);

        // Determine instructor ownership deterministically
        const currentUserIdFromApi = courseResponse?.data?.currentUserId;
        const instructorIdFromApi = courseResponse?.data?.instructorId;
        if (currentUserIdFromApi && instructorIdFromApi) {
          setIsInstructorUser(String(currentUserIdFromApi) === String(instructorIdFromApi));
        } else if (loggedIn && userData?._id && instructorIdFromApi) {
          setIsInstructorUser(String(userData._id) === String(instructorIdFromApi));
        }

        if (loggedIn && userData) {
          setCurrentUser(userData);
          if (userData.role === "instructor") setIsInstructor(true);

          // Check if user is enrolled
          if (Array.isArray(userData.enrolledCourses)) {
            const enrolled = userData.enrolledCourses.some(
              (enrollment) => String(enrollment.courseId) === String(id)
            );
            setIsEnrolled(enrolled);
            setCourse((prev) => ({ ...prev, isEnrolled: enrolled }));
          }
        }

        // Load curriculum
        const curriculumResponse = await courseService.getCourseCurriculum(id);
        if (curriculumResponse.success) {
          setCurriculum(curriculumResponse.data);

          // Expand first section by default
          if (curriculumResponse.data.sections.length > 0) {
            setExpandedSections(new Set([0]));
          }
        }
      } catch (error) {
        console.error("ERROR LOADING COURSE DATA:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    loadCourseData();
  }, [id]);



  const handleEnroll = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to enroll in this course");
      return;
    }

    setEnrollmentLoading(true);
    try {
      const response = await userService.enrollInCourse(id);
      if (response.success) {
        toast.success("Successfully enrolled in the course!");
        setIsEnrolled(true);

        // Update course object with enrollment status
        setCourse((prev) => ({ ...prev, isEnrolled: true }));

        // Update local user data
        const updatedUser = { ...currentUser };
        updatedUser.enrolledCourses = updatedUser.enrolledCourses || [];
        updatedUser.enrolledCourses.push({
          courseId: id,
          progress: 0,
          lastAccessed: new Date(),
        });
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Failed to enroll. Please try again.");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Keyboard shortcuts for video player
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isVideoMode) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isVideoMode, isFullscreen]);

  // Handle content click (video mode activation)
  const handleContentClick = (
    content,
    sectionIndex,
    contentIndex,
    sectionTitle
  ) => {
    // Check if user is enrolled for premium content (skip first section which is usually free)
    if (sectionIndex > 0 && !isEnrolled && !isInstructorUser) {
      toast.error("Please enroll in this course to access all content", {
        duration: 4000,
        icon: "🔒",
      });
      return;
    }

    // Check if user is logged in for premium content
    const token = localStorage.getItem("token");
    if (!token && sectionIndex > 0) {
      toast.error("Please login to access this content");
      return;
    }

    if (content.contentType === "video" && content.video?.url) {
      const videoData = {
        ...content,
        sectionIndex,
        contentIndex,
        sectionTitle,
      };

      setCurrentVideo(videoData);
      setIsVideoMode(true);
      setPlaying(false);
      setPlayed(0);
      const srcCandidate = content.video?.url || "";
      const chosen =
        isYoutubeUrl(srcCandidate) || isVimeoUrl(srcCandidate) || srcCandidate
          ? srcCandidate
          : FALLBACK_MP4_URL;
      setCurrentSrc(chosen);
    } else {
      toast.info(
        `${content.contentType.replace("_", " ").toUpperCase()}: ${
          content.title
        }\n\nThis content type will be implemented in future updates.`
      );
    }
  };

  // Exit video mode
  const exitVideoMode = () => {
    setIsVideoMode(false);
    setCurrentVideo(null);
    setPlaying(false);
    setPlayed(0);
  };

  // Toggle section expansion
  const toggleSection = (sectionIndex) => {
    // Check if user is enrolled (skip first section which is usually free)
    if (sectionIndex > 0 && !isEnrolled && !isInstructorUser) {
      toast.error("Please enroll in this course to access all sections", {
        duration: 4000,
        icon: "🔒",
      });
      return;
    }

    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex);
    } else {
      newExpanded.add(sectionIndex);
    }
    setExpandedSections(newExpanded);
  };

  // Video player event handlers
  const handlePlayPause = () => {
    const next = !playing;
    setPlaying(next);
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
    if (
      playerRef.current &&
      typeof playerRef.current.getDuration === "function"
    ) {
      const d = playerRef.current.getDuration();
      if (d && d !== duration) setDuration(d);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPlayed = clickX / rect.width;
    setPlayed(newPlayed);
    if (playerRef.current) {
      playerRef.current.seekTo(newPlayed);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Mark content as completed
  const markAsCompleted = (sectionIndex, contentIndex) => {
    const contentId = `${sectionIndex}-${contentIndex}`;
    const newCompleted = new Set(completedContent);
    newCompleted.add(contentId);
    setCompletedContent(newCompleted);
  };

  // Check if content is completed
  const isContentCompleted = (sectionIndex, contentIndex) => {
    const contentId = `${sectionIndex}-${contentIndex}`;
    return completedContent.has(contentId);
  };

  // Handle rating submission
  const handleRatingSubmit = (ratingData) => {
    if (course) {
      setCourse((prev) => ({
        ...prev,
        rating: ratingData.rating,
        total_ratings: ratingData.totalRatings,
      }));
    }
  };

  // Handle file upload for notes
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error("File size must be less than 10MB");
        e.target.value = null;
        return;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload PDF, DOC, DOCX, or TXT files only");
        e.target.value = null;
        return;
      }

      setNewNote((prev) => ({ ...prev, file }));
      toast.success("File selected successfully");
    }
  };

  // Handle note upload
  const handleNoteUpload = async (e) => {
    e.preventDefault();

    if (!newNote.title || !newNote.topic) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log("Uploading note with data:", newNote);
      const noteData = {
        title: newNote.title,
        topic: newNote.topic,
        description: newNote.description,
        file: newNote.file,
      };

      const result = await uploadService.uploadCourseNote(id, noteData);
      console.log("Upload result:", result);

      // Reset form
      setNewNote({
        title: "",
        topic: "",
        description: "",
        file: null,
      });
      setShowNoteUpload(false);

      // Add to course notes array so it appears in the UI immediately
      setCourse((prevCourse) => {
        const current = prevCourse || {};
        const currentNotes = Array.isArray(current.notes) ? current.notes : [];
        return {
          ...current,
          notes: [...currentNotes, result.data],
        };
      });

      // Add to current video notes if in video mode
      if (currentVideo) {
        currentVideo.notes = currentVideo.notes || [];
        currentVideo.notes.push(result.data);
      }

      toast.success("Note uploaded successfully!");
    } catch (error) {
      console.error("Error uploading note:", error);
      toast.error(error.message || "Failed to upload note. Please try again.");
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId) => {
    try {
      await uploadService.deleteCourseNote(id, noteId);

      // Remove from course notes array
      setCourse((prevCourse) => ({
        ...prevCourse,
        notes: prevCourse.notes.filter((note) => note._id !== noteId),
      }));

      toast.success("Note deleted successfully!");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error(error.message || "Failed to delete note. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!loading && (!course || !curriculum)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Course not found
          </h2>
          <p className="text-gray-600 mb-4">Unable to load course content.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Video Mode Layout - Clean white design with independent scrolling
  if (isVideoMode && currentVideo) {
    return (
      <div className="min-h-screen bg-white">
        {/* Video Mode Header - Fixed with better design */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={exitVideoMode}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowBackIcon />
              </button>
              <div className="flex items-center gap-4">
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {course.title}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {currentVideo.sectionTitle} • {currentVideo.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Progress: {Math.round(played * 100)}%
                </span>
              </div> */}
              <button
                onClick={exitVideoMode}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Side - Video and Tabs - Independent scroll */}
          <div className="flex-1 overflow-y-auto">
            {/* Video Player - Fixed at top of left side */}
            <div className="relative w-full h-[480px] bg-black flex-shrink-0">
              {/* Check if content is locked for non-enrolled users */}
              {!isEnrolled &&
              !currentVideo.isFree &&
              !isInstructorUser &&
              !currentVideo.isPreview ? (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <LockIcon className="text-6xl mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold mb-2">Content Locked</h3>
                    <p className="text-gray-300 mb-6 max-w-md">
                      Enroll in this course to access all videos and content.
                      Start learning today!
                    </p>
                    <button
                      onClick={handleEnroll}
                      className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Enroll Now - FREE
                    </button>
                  </div>
                </div>
              ) : (
                <VideoSection
                  playerRef={playerRef}
                  url={currentSrc || FALLBACK_SRC}
                  playing={playing}
                  volume={muted ? 0 : volume}
                  onProgress={handleProgress}
                  onEnded={() =>
                    markAsCompleted(
                      currentVideo.sectionIndex,
                      currentVideo.contentIndex
                    )
                  }
                  onError={(error) => {
                    console.error("Video playback error:", error);
                  }}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              )}

              {/* Click to Play Overlay */}
              {!playing && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  onClick={handlePlayPause}
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-all duration-200">
                    <PlayArrowIcon className="text-white text-6xl" />
                  </div>
                </div>
              )}

              {/* Custom Controls Overlay */}
              {showControls && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <div
                    className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-4 hover:h-3 transition-all duration-200"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-gray-300 rounded-full transition-all duration-200"
                      style={{ width: `${played * 100}%` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-400 hidden md:block">
                        Space: Play/Pause • F: Fullscreen • M: Mute
                      </div>
                      <button
                        onClick={handlePlayPause}
                        className="text-white hover:text-gray-300 text-2xl transition-colors duration-200 hover:scale-110"
                      >
                        {playing ? <PauseIcon /> : <PlayArrowIcon />}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-gray-300 transition-colors duration-200 hover:scale-110"
                        >
                          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={muted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gray-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-gray-300 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
                        />
                      </div>

                      <div className="text-sm text-gray-300">
                        {formatDuration(played * duration)} /{" "}
                        {formatDuration(duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="text-white hover:text-gray-300 transition-colors duration-200 hover:scale-110">
                        <SettingsIcon />
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-gray-300 transition-colors duration-200 hover:scale-110"
                      >
                        {isFullscreen ? (
                          <FullscreenExitIcon />
                        ) : (
                          <FullscreenIcon />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs Section - Scrollable content area */}
            <div className="bg-white border-t border-gray-200">
              {/* Tab Navigation - Fixed */}
              <div className="px-6 border-b border-gray-200">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveVideoTab("overview")}
                    className={`py-4 border-b-2 text-sm font-medium ${
                      activeVideoTab === "overview"
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveVideoTab("notes")}
                    className={`py-4 border-b-2 text-sm font-medium ${
                      activeVideoTab === "notes"
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Notes
                  </button>
                </div>
              </div>

              {/* Tab Content - Scrollable */}
              <div className="px-6 py-6">
                {activeVideoTab === "overview" ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {currentVideo.title}
                      </h3>
                      {currentVideo.sectionTitle && (
                        <p className="text-gray-600 mb-3">
                          {currentVideo.sectionTitle}
                        </p>
                      )}
                      {typeof currentVideo.duration === "number" && (
                        <p className="text-sm text-gray-500 mb-3">
                          Duration: {formatDuration(currentVideo.duration)}
                        </p>
                      )}
                    </div>

                    {currentVideo.description && (
                      <div className="text-gray-700 leading-relaxed">
                        {currentVideo.description}
                      </div>
                    )}
                  </div>
                ) : activeVideoTab === "notes" ? (
                  <div className="space-y-4">
                    {Array.isArray(course.notes) && course.notes.length > 0 ? (
                      <div className="space-y-3">
                        {course.notes.map((note, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {note.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {note.topic}
                              </p>
                              {note.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {note.description}
                                </p>
                              )}
                            </div>
                            {note.fileUrl && (
                              <a
                                href={note.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 p-2"
                                title="Open in new tab"
                              >
                                <DownloadIcon className="text-xl" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        <p className="text-base">No course notes available</p>
                        <p className="text-xs mt-1">
                          Course notes will appear here when available.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 text-center py-8">
                      Select a video from the course content to start learning
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Course Content Sidebar - Independent scroll */}
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Course content
              </h2>
              <div className="text-sm text-gray-600">
                {curriculum.totalLectures} lectures •{" "}
                {formatDuration(curriculum.totalDuration)}
              </div>
            </div>
            <CurriculumList
              curriculum={curriculum}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              currentVideo={currentVideo}
              isContentCompleted={isContentCompleted}
              handleContentClick={handleContentClick}
              isEnrolled={Boolean(isEnrolled || isInstructorUser)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Never early return on null user to avoid UI flicker/inconsistency

  // Regular Course Page Layout - Compact design
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <CourseHeader
        course={{
          ...course,
          isEnrolled: isEnrolled,
        }}
        onEnroll={handleEnroll}
        enrollmentLoading={enrollmentLoading}
        isInstructorUser={isInstructorUser}
      />

      {/* Course Body */}
      <div className="bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* What You'll Learn */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  What you'll learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.learningObjectives?.map((objective, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircleIcon className="text-gray-900 text-base flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {objective}
                      </span>
                    </div>
                  )) || (
                    <div className="col-span-2 text-gray-500 text-center py-4">
                      <p className="text-base">
                        Learning objectives not available
                      </p>
                      <p className="text-xs mt-1">
                        This course will help you master the fundamentals and
                        advance your skills.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Course content
                  </h2>
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                    {curriculum?.totalLectures || 0} lectures •{" "}
                    {formatDuration(curriculum?.totalDuration || 0)}
                  </div>
                </div>

                {/* Sections List */}
                <div className="space-y-3">
                  {curriculum?.sections?.map((section, sectionIndex) => (
                    <div
                      key={sectionIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(sectionIndex)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center justify-between transition-colors ${
                          sectionIndex > 0 && !isEnrolled && !isInstructorUser
                            ? "opacity-60"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base">
                              {section.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {section.content?.length || 0} lectures •{" "}
                              {formatDuration(
                                section.content?.reduce(
                                  (total, content) =>
                                    total + (content.duration || 0),
                                  0
                                ) || 0
                              )}
                            </p>
                          </div>
                          {sectionIndex > 0 &&
                            !isEnrolled &&
                            !isInstructorUser && (
                              <LockIcon className="text-gray-500 text-lg" />
                            )}
                        </div>
                        {expandedSections.has(sectionIndex) ? (
                          <KeyboardArrowUpIcon className="text-gray-500 text-base" />
                        ) : (
                          <KeyboardArrowDownIcon className="text-gray-500 text-base" />
                        )}
                      </button>

                      {/* Section Content */}
                      {expandedSections.has(sectionIndex) && (
                        <div className="border-t border-gray-200 bg-white">
                          {section.content?.map((content, contentIndex) => {
                            const IconComponent = getContentIcon(
                              content.contentType
                            );

                            return (
                              <button
                                key={contentIndex}
                                onClick={() =>
                                  handleContentClick(
                                    content,
                                    sectionIndex,
                                    contentIndex,
                                    section.title
                                  )
                                }
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <IconComponent
                                  className={
                                    content.contentType === "video"
                                      ? "text-gray-900"
                                      : "text-gray-600"
                                  }
                                  style={{ fontSize: 18 }}
                                />

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {content.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                                      {content.contentType.replace("_", " ")}
                                    </span>
                                    {content.duration > 0 && (
                                      <span className="flex items-center gap-1">
                                        <AccessTimeIcon className="text-xs" />
                                        {formatDuration(content.duration)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {sectionIndex > 0 &&
                                !isEnrolled &&
                                !isInstructorUser ? (
                                  <LockIcon className="text-gray-500 text-lg" />
                                ) : content.contentType === "video" ? (
                                  <PlayCircleOutlineIcon className="text-gray-900 text-lg" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {course.requirements?.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {requirement}
                      </span>
                    </li>
                  )) || (
                    <li className="text-gray-500 text-center py-4">
                      <p className="text-base">No specific requirements</p>
                      <p className="text-xs mt-1">
                        This course is designed for beginners and intermediate
                        learners.
                      </p>
                    </li>
                  )}
                </ul>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Description
                </h2>
                <div className="relative">
                  <div
                    className={`text-gray-700 leading-relaxed whitespace-pre-line text-sm ${
                      !isDescriptionExpanded ? "line-clamp-3" : ""
                    }`}
                  >
                    {course.description || "Course description not available."}
                  </div>
                  {course.description && course.description.length > 2000 && (
                    <button
                      onClick={() =>
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }
                      className="text-gray-900 font-medium text-sm mt-2 flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                    >
                      <span>
                        {isDescriptionExpanded ? "Read less" : "Read more"}
                      </span>
                      {isDescriptionExpanded ? (
                        <KeyboardArrowUpIcon className="text-sm" />
                      ) : (
                        <KeyboardArrowDownIcon className="text-sm" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Who this course is for */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                  Who this course is for
                </h2>
                <ul className="space-y-3">
                  {course.targetAudience?.map((audience, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {audience}
                      </span>
                    </li>
                  )) || (
                    <li className="text-gray-500 text-center py-4">
                      <p className="text-base">Target audience not specified</p>
                      <p className="text-xs mt-1">
                        This course is suitable for anyone interested in
                        learning this subject.
                      </p>
                    </li>
                  )}
                </ul>
              </div>

              {/* Course Notes - Only for Instructors */}
              {isInstructorUser && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Course Notes
                    </h2>
                    {isInstructorUser && !showNoteUpload && (
                      <button
                        onClick={() => setShowNoteUpload(true)}
                        className="cursor-pointer text-[0.8rem] bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed "
                      >
                        <AddOutlinedIcon
                          style={{
                            fontSize: "1rem",
                            paddingRight: "0.2rem",
                          }}
                        />
                        Add Note
                      </button>
                    )}
                  </div>

                  {showNoteUpload && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Upload New Note
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1">
                            Title *
                          </label>
                          <input
                            type="text"
                            value={newNote.title}
                            onChange={(e) =>
                              setNewNote((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            className="w-full text-[0.8rem] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter note title"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1">
                            Topic *
                          </label>
                          <input
                            type="text"
                            value={newNote.topic}
                            onChange={(e) =>
                              setNewNote((prev) => ({
                                ...prev,
                                topic: e.target.value,
                              }))
                            }
                            className="w-full text-[0.8rem] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter topic"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={newNote.description}
                            onChange={(e) =>
                              setNewNote((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full text-[0.8rem] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Enter description (optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.8rem] font-medium text-gray-700 mb-1">
                            File (PDF, DOC, etc.)
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer bg-white text-gray-700 text-[0.8rem] px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                            <UploadOutlinedIcon style={{ fontSize: "1rem" }} />
                            <span>Choose file</span>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.txt"
                            />
                          </label>
                          {newNote.file && (
                            <div className="mt-1 text-[0.8rem] text-gray-600 truncate">
                              {newNote.file.name}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleNoteUpload}
                            className="cursor-pointer text-[0.8rem] bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <UploadOutlinedIcon style={{ fontSize: "1rem" }} />
                            <span>Upload Note</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowNoteUpload(false);
                              setNewNote({
                                title: "",
                                topic: "",
                                description: "",
                                file: null,
                              });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-[0.8rem]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes List */}
                  <div className="space-y-4">
                    {console.log(
                      "Rendering notes section, course.notes:",
                      course.notes
                    )}
                    {Array.isArray(course.notes) && course.notes.length > 0 ? (
                      course.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {note.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {note.topic}
                            </p>
                            {note.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {note.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {note.isDownloadable && note.fileUrl && (
                              <a
                                href={note.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 p-2"
                                title="Open in new tab"
                              >
                                <DownloadOutlinedIcon className="text-xl" />
                              </a>
                            )}
                            {isInstructorUser && (
                              <button
                                onClick={() =>
                                  handleDeleteNote(note._id || idx)
                                }
                                className="text-red-600 hover:text-red-700 p-2"
                                title="Delete note"
                              >
                                <DeleteOutlineOutlinedIcon className="text-xl" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        <p className="text-base">No notes added yet</p>
                        <p className="text-xs mt-1">
                          Add notes to help your students with additional
                          resources and materials.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Additional Info */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Course Stats Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-3">
                    Course Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Total Students
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {course.total_students?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Average Rating
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {course.rating
                          ? `${course.rating.toFixed(1)}/5`
                          : "No ratings"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Total Reviews
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {course.total_ratings?.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">
                        Last Updated
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {course.updatedAt
                          ? new Date(course.updatedAt).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Component - Only show for enrolled students who are not instructors */}
                {isEnrolled && !isInstructorUser && (
                  <CourseRating
                    courseId={id}
                    currentRating={course.rating}
                    onRatingSubmit={handleRatingSubmit}
                  />
                )}

                {/* Category Info */}
                {course.category && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">
                      Category
                    </h3>
                    <div className="bg-gray-100 px-3 py-2 rounded">
                      <span className="text-gray-700 font-medium text-sm">
                        {course.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {course.keywords && course.keywords.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.keywords.slice(0, 6).map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
