// Course page shared constants and helpers

import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ArticleIcon from "@mui/icons-material/Article";
import HelpIcon from "@mui/icons-material/Help";
import CodeIcon from "@mui/icons-material/Code";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LanguageIcon from "@mui/icons-material/Language";
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

export const FALLBACK_MP4_URL = "https://muxed.s3.amazonaws.com/leds.mp4";

export const isYoutubeUrl = (url) => /youtube\.com|youtu\.be/.test(url || "");
export const isVimeoUrl = (url) => /vimeo\.com/.test(url || "");

export const KEYBOARD_HINT = "Space: Play/Pause • F: Fullscreen • M: Mute";

export const getContentIcon = (contentType) => {
  const iconMap = {
    video: VideoLibraryIcon,
    video_slide_mashup: SlideshowIcon,
    article: ArticleIcon,
    quiz: HelpIcon,
    coding_exercise: CodeIcon,
    assignment: AssignmentIcon,
    practice_test: HelpIcon,
    role_play: PlayCircleOutlineIcon,
    presentation: SlideshowIcon,
    document: DescriptionIcon,
  };
  return iconMap[contentType] || VideoLibraryIcon;
};

export const Icons = {
  StarIcon,
  AccessTimeIcon,
  LanguageIcon,
  CheckCircleIcon,
  KeyboardArrowDownIcon,
  KeyboardArrowUpIcon,
  PlayArrowIcon,
  PauseIcon,
  VolumeUpIcon,
  VolumeOffIcon,
  FullscreenIcon,
  FullscreenExitIcon,
  SettingsIcon,
  PlayCircleOutlineIcon,
  ArrowBackIcon,
  CloseIcon,
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};
