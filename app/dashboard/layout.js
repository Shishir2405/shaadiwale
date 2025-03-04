"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

const validUsers = [
  { email: "user1@example.com", password: "password123" },
  { email: "user2@example.com", password: "password456" },
  { email: "user3@example.com", password: "password789" },
];

export default function Layout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   const checkAuth = () => {
  //     // Check if user is logged in
  //     const rememberedUser = localStorage.getItem("rememberedUser");
  //     const currentUser = localStorage.getItem("currentUser");

  //     let isValid = false;

  //     if (rememberedUser || currentUser) {
  //       const userData = JSON.parse(rememberedUser || currentUser);
  //       // Validate against hardcoded users
  //       isValid = validUsers.some(
  //         (user) =>
  //           user.email === userData.email && user.password === userData.password
  //       );
  //     }

  //     if (!isValid) {
  //       router.push("/dashboard/admin-login");
  //       return;
  //     }

  //     setIsAuthenticated(true);
  //     setIsLoading(false);
  //   };

  //   checkAuth();
  // }, [router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
