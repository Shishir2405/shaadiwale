"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Landing/Slider";
import MatrimonySplitSection from "@/components/Landing/ImageSection";
import UserMembershipCard from "@/components/Landing/UserMemberCard";
import JourneySteps from "@/components/Landing/StepsSection";
import ExclusiveSection from "@/components/Landing/ExclusiveSection";
import Testimonials from "@/components/Landing/Testimonial";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            uid: parsedUser.email, // Using email as ID since that's what's available
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "membershipPlans"));
        const plansData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched plans:", plansData);
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Debug logs
  console.log("Current userData:", userData);
  console.log("User ID being passed:", userData?.uid);
  console.log("Plans loaded:", plans.length);

  return (
    <>
      <Hero />
      <MatrimonySplitSection />
      <section className="w-full py-12 bg-gray-50">
        <div className="container mx-auto">

          <UserMembershipCard />
        </div>
      </section>
      <JourneySteps />
      <ExclusiveSection />
      <Testimonials />
    </>
  );
}
