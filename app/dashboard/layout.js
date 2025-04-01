"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

// Admin users data
const validUsers = [
  { email: "shishirshrivastava30@gmail.com", password: "Shishir@2405" },
  { email: "botmartz@gmail.com", password: "rdcv4c75" },
  { email: "admin@gmail.com", password: "admin" },
  { email: "ashutosh.agarwal@mobiwebgs.com", password: "ashutosh123!" },
];

// Session timeout in milliseconds (45 minutes)
const SESSION_TIMEOUT = 45 * 60 * 1000;

export default function Layout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // If we're already on the login page, don't redirect
        if (window.location.pathname === "/admin-login") {
          setIsLoading(false);
          return;
        }

        // Check if user is logged in
        const sessionData = localStorage.getItem("dashboardSession");

        if (!sessionData) {
          console.log("No session data found, redirecting to login");
          router.push("/admin-login");
          return;
        }

        const { user, timestamp } = JSON.parse(sessionData);
        const currentTime = new Date().getTime();

        // Check if session has expired (45 minutes)
        if (currentTime - timestamp > SESSION_TIMEOUT) {
          console.log("Session expired, redirecting to login");
          localStorage.removeItem("dashboardSession");
          router.push("/admin-login");
          return;
        }

        // Validate against hardcoded users
        const isValid = validUsers.some(
          (validUser) =>
            validUser.email === user.email &&
            validUser.password === user.password
        );

        if (!isValid) {
          console.log("Invalid user, redirecting to login");
          localStorage.removeItem("dashboardSession");
          router.push("/admin-login");
          return;
        }

        // Update session timestamp to extend it
        localStorage.setItem(
          "dashboardSession",
          JSON.stringify({
            user,
            timestamp: currentTime,
          })
        );

        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        setIsLoading(false);
        router.push("/admin-login");
      }
    };

    // Add a short delay to ensure router is ready
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Activity tracking to extend session
  useEffect(() => {
    if (!isAuthenticated) return;

    const extendSession = () => {
      try {
        const sessionData = localStorage.getItem("dashboardSession");
        if (sessionData) {
          const { user } = JSON.parse(sessionData);
          localStorage.setItem(
            "dashboardSession",
            JSON.stringify({
              user,
              timestamp: new Date().getTime(),
            })
          );
        }
      } catch (error) {
        console.error("Error extending session:", error);
      }
    };

    // Extend session on user activity
    window.addEventListener("mousemove", extendSession);
    window.addEventListener("keydown", extendSession);
    window.addEventListener("click", extendSession);

    return () => {
      window.removeEventListener("mousemove", extendSession);
      window.removeEventListener("keydown", extendSession);
      window.removeEventListener("click", extendSession);
    };
  }, [isAuthenticated]);

  // Skip auth check for the login page
  if (
    typeof window !== "undefined" &&
    window.location.pathname === "/admin-login"
  ) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardLayout>{children}</DashboardLayout> : null;
}
