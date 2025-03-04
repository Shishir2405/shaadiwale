"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Landing/Slider";
import MatrimonySplitSection from "@/components/Landing/ImageSection";
import MembershipCards from "@/components/Landing/MembershipCards";
import JourneySteps from "@/components/Landing/StepsSection";
import ExclusiveSection from "@/components/Landing/ExclusiveSection";
import Testimonials from "@/components/Landing/Testimonial";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem("user");
        console.log("Raw user string:", userStr);
        
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          console.log("Parsed user data:", parsedUser);
          
          setIsLoggedIn(true);
          setUserData({
            ...parsedUser,
            uid: parsedUser.email // Using email as ID since that's what's available
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  // Debug logs
  console.log("Current userData:", userData);
  console.log("User ID being passed:", userData?.uid);

  return (
    <>
      <Hero />
      <MatrimonySplitSection />
      <section className="w-full py-12 bg-gray-50">
        <MembershipCards
          userId={userData?.uid}
          isAdmin={userData?.role === "Verifier"}
          onEdit={(planId) => {
            console.log("Edit plan:", planId);
          }}
        />
      </section>
      <JourneySteps />
      <ExclusiveSection />
      <Testimonials />
    </>
  );
}