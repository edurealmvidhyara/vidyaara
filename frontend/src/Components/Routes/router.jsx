import { Route, Routes, Navigate } from "react-router-dom";
import { Header } from "../Header/Header";
import Landin from "../LandingPage/Landin";
import ExplorePaths from "../Explore/ExplorePaths";
import SearchResults from "../Search/SearchResults";
import Login from "../Login_Signup/Login";
import Signup from "../Login_Signup/Signup";
import EmailVerification from "../Login_Signup/EmailVerification";
import ForgotPassword from "../Login_Signup/ForgotPassword";
import OTPVerification from "../Login_Signup/OTPVerification";
import ResetPassword from "../Login_Signup/ResetPassword";
// import Wishlist from "../Wishlist/Wishlist"; // Commented out wishlist
import Instructor from "../Login_Signup/Instructor";
import InstructorOnboarding from "../Instructor/InstructorOnboarding";
import InstructorCourses from "../Instructor/InstructorCourses";
import CourseCreation from "../Instructor/CourseCreation";
import CourseCreationWorkflow from "../Instructor/CourseCreationWorkflow";
import CourseEditPage from "../Instructor/CourseEditPage";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Footer from "../Footer/Footer";
import CoursePage from "../Course/CoursePage";
import ProfilePage from "../Login_Signup/ProfilePage";
import PublicProfile from "../Login_Signup/PublicProfile";
import MyLearning from "../Learning/MyLearning";
import AboutPage from "../StaticPages/AboutPage";
import ContactPage from "../StaticPages/ContactPage";
import TermsPage from "../StaticPages/TermsPage";
import PrivacyPage from "../StaticPages/PrivacyPage";

// General Protected Route Component for authenticated users
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const userData = user?.user;
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token but no user data, redirect to login (invalid token)
  if (!userData) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Protected Route Component for Instructors
const InstructorProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const userData = user?.user;
  const token = localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token but no user data, redirect to login (invalid token)
  if (!userData) {
    return <Navigate to="/login" />;
  }

  // If user exists but is not an instructor, redirect to home
  if (userData.role !== "instructor") {
    return <Navigate to="/" />;
  }
  return children;
};

// Individual Protected Route Components
const InstructorOnboardingRoute = () => (
  <InstructorProtectedRoute>
    <InstructorOnboarding />
  </InstructorProtectedRoute>
);

const InstructorCoursesRoute = () => (
  <InstructorProtectedRoute>
    <InstructorCourses />
  </InstructorProtectedRoute>
);

const CourseCreationRoute = () => (
  <InstructorProtectedRoute>
    <CourseCreation />
  </InstructorProtectedRoute>
);

const CourseCreationWorkflowRoute = () => (
  <InstructorProtectedRoute>
    <CourseCreationWorkflow />
  </InstructorProtectedRoute>
);

const CourseEditRoute = () => (
  <InstructorProtectedRoute>
    <CourseEditPage />
  </InstructorProtectedRoute>
);

const InstructorRoutes = () => {
  return <Instructor />;
};

export const AllRoutes = () => {
  const location = useLocation();
  const isInstructorPage = location.pathname.startsWith("/instructor");
  const isCourseCreatePage = location.pathname.includes("/course/create");
  const isProfilePage = location.pathname.startsWith("/profile");
  const isCoursePage = location.pathname.match(/^\/course\/[^\/]+$/);
  const isStaticFooterPage = ["/about", "/contact", "/terms", "/privacy"].some(
    (p) => location.pathname === p
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!isProfilePage && !isCourseCreatePage && !isStaticFooterPage && (
        <Header />
      )}
      <div className="flex-1 min-h-[90vh]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/teach" element={<InstructorRoutes />} />

          {/* Course Routes */}
          <Route path="/course/:id" element={<CoursePage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/explore" element={<ExplorePaths />} />

          {/* Static Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* User Routes */}
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <MyLearning />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Wishlist route commented out */}
          {/* <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          /> */}

          {/* Instructor Routes - Organized and Clean */}
          <Route
            path="/instructor/onboarding"
            element={<InstructorOnboardingRoute />}
          />
          <Route
            path="/instructor/courses"
            element={<InstructorCoursesRoute />}
          />

          {/* Course Creation Flow */}
          <Route path="/course/create" element={<CourseCreationRoute />} />
          <Route
            path="/course/create/:courseId"
            element={<CourseCreationWorkflowRoute />}
          />
          <Route
            path="/course/edit/:courseId"
            element={<CourseCreationWorkflowRoute />}
          />

          {/* Legacy Routes - Keep for backward compatibility */}
          <Route
            path="/instructor/course/create"
            element={<CourseCreationWorkflowRoute />}
          />
          <Route
            path="/instructor/course/edit/:courseId"
            element={<CourseCreationWorkflowRoute />}
          />

          {/* Legacy Course Edit Route */}
          <Route
            path="/instructor/course/:courseId/edit"
            element={<CourseEditRoute />}
          />
        </Routes>
      </div>
      {!isProfilePage && !isCoursePage && !isStaticFooterPage && <Footer />}
    </div>
  );
};
