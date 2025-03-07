"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Settings, LogOut, User, Home } from "lucide-react";

const Header = ({ user }) => {
  const router = useRouter();

  // Function to handle logout
  const handleLogout = () => {
    try {
      // Remove the user session from localStorage
      localStorage.removeItem("dashboardSession");

      // Clear any other user data
      localStorage.removeItem("rememberedUser");
      localStorage.removeItem("currentUser");

      console.log("User logged out successfully");

      // Redirect to login page
      router.push("/admin-login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            Hello, {user?.name || "admin1"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/">
            {" "}
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Home className="h-4 w-4 mr-2" />
              Front End
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Site Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
