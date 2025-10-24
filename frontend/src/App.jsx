import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { fetchUserData } from "./Redux/login/action";
import { AllRoutes } from "./Components/Routes/router";

export const App = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((store) => store.auth);
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // If token exists but no user data in store, fetch user data
        if (!user?.user || !user?.token) {
          await dispatch(fetchUserData(token));
        }
      }
      // Mark app as initialized after auth check
      setIsAppInitialized(true);
    };

    initializeApp();
  }, [dispatch, user?.user, user?.token]);

  // Listen for storage changes (token being cleared from other tabs/sources)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        if (e.newValue === null) {
          console.log("Token was CLEARED from localStorage!");
          console.log(
            " Old value was:",
            e.oldValue ? e.oldValue.substring(0, 20) + "..." : "null"
          );
        } else if (e.oldValue === null) {
          console.log("Token was SET in localStorage!");
          console.log(
            "New value is:",
            e.newValue ? e.newValue.substring(0, 20) + "..." : "null"
          );
        } else {
          console.log("Token was CHANGED in localStorage!");
          console.log(
            " Old value:",
            e.oldValue ? e.oldValue.substring(0, 20) + "..." : "null"
          );
          console.log(
            "New value:",
            e.newValue ? e.newValue.substring(0, 20) + "..." : "null"
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Show loading screen while app is initializing
  if (
    !isAppInitialized ||
    (localStorage.getItem("token") && loading && !user?.user)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Loading Vidyara
          </h2>
          <p className="text-gray-600 text-lg mb-1">
            Initializing your session...
          </p>
          <p className="text-gray-500 text-sm">
            Please wait while we set up your experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-cont">
      <AllRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
};
