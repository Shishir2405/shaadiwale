"use client";

import React, { useState, useEffect } from "react";
import {
  Diamond,
  Crown,
  Gem,
  Star,
  Check,
  ArrowRight,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// Regular User MembershipCard Component
const UserMembershipCard = () => {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userMembership, setUserMembership] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paymentConfigError, setPaymentConfigError] = useState("");

  console.log("UserMembershipCard component rendering");

  // Get user ID from localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        setUserId(parsedUser.email); // Using email as ID
        setUserData(parsedUser);
        console.log("User ID set:", parsedUser.email);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  }, []);

  // Fetch plans regardless of user login status
  useEffect(() => {
    fetchPlans();
    fetchPaymentSettings();
  }, []);

  // Fetch user membership data if user is logged in
  useEffect(() => {
    if (userId) {
      fetchUserMembership();
    }
  }, [userId, plans]);

  const fetchPaymentSettings = async () => {
    try {
      const settingsRef = doc(db, "settings", "payment");
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const settings = settingsSnap.data();
        // Check if Razorpay is enabled and key exists
        if (!settings.razorpay?.enabled || !settings.razorpay?.key) {
          setPaymentConfigError("Payment method is not available");
        } else {
          setPaymentSettings(settings);
        }
      } else {
        setPaymentConfigError("Payment settings not configured");
      }
    } catch (err) {
      console.error("Error fetching payment settings:", err);
      setPaymentConfigError("Failed to load payment settings");
    }
  };

  const fetchPlans = async () => {
    console.log("Fetching membership plans...");
    try {
      const plansSnapshot = await getDocs(collection(db, "membershipPlans"));

      if (plansSnapshot.empty) {
        console.log("No membership plans found in the database");
        setPlans([]);
        setLoading(false);
        return;
      }

      const plansData = plansSnapshot.docs
        .map((doc) => {
          console.log("Plan document:", doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data(),
          };
        })
        .filter((plan) => plan.isActive !== false && plan.active !== false) // Filter active plans
        .sort((a, b) => a.price - b.price); // Sort by price

      console.log("Fetched plans:", plansData.length, plansData);
      setPlans(plansData);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Failed to load membership plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMembership = async () => {
    console.log("Fetching user membership for:", userId);
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.membershipPlan) {
          const userPlan = plans.find((p) => p.id === userData.membershipPlan);

          if (userPlan) {
            setUserMembership({
              ...userData,
              plan: userPlan,
            });
            console.log("User membership found:", userPlan.title);
          }
        }
      } else {
        console.log(
          "User document doesn't exist in Firestore. Will create it during payment."
        );
      }
    } catch (err) {
      console.error("Error fetching user membership:", err);
    }
  };

  const handlePlanSelect = async (plan) => {
    if (!userId) {
      // Handle user not logged in
      alert("Please log in to select a plan");
      return;
    }

    if (processingPayment) {
      return; // Prevent multiple clicks
    }

    // Check if user already has a plan - if not, show payment modal
    if (!userMembership) {
      console.log("User doesn't have a plan yet, showing payment modal");
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    } else {
      // If user already has a plan, process directly
      try {
        setProcessingPayment(true);

        // Process the membership purchase
        await processMembershipPurchase(plan);

        // Redirect to success page
        router.push("/payment-success");
      } catch (error) {
        console.error("Payment processing error:", error);
        setError("Failed to process payment: " + error.message);
        setProcessingPayment(false);
      }
    }
  };

  const handleDirectPayment = async () => {
    if (!selectedPlan) return;

    try {
      setProcessingPayment(true);

      // Process the payment
      await processMembershipPurchase(selectedPlan);

      // Close modal and redirect
      setShowPaymentModal(false);
      router.push("/payment-success");
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentConfigError("Failed to process payment: " + error.message);
      setProcessingPayment(false);
    }
  };

  const processMembershipPurchase = async (plan) => {
    if (!userId) {
      throw new Error("User not logged in");
    }

    // Check if payment settings are available
    if (!paymentSettings || !paymentSettings.razorpay?.key) {
      throw new Error("Payment configuration is not available");
    }

    // Generate mock payment ID for test environment
    const paymentId = "rzp_test_" + Math.random().toString(36).substr(2, 9);

    // Check if user document exists first
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // Calculate membership dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    // Prepare membership data
    const membershipData = {
      membershipPlan: plan.id,
      membershipStatus: "active",
      isPremium: true,
      membershipStartDate: startDate.toISOString(),
      membershipEndDate: endDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("Updating user document with membership data:", membershipData);

    if (userSnap.exists()) {
      // Update existing user document
      await updateDoc(userRef, membershipData);
      console.log("Updated existing user document");
    } else {
      // Create new user document
      const newUserData = {
        ...userData,
        email: userId,
        ...membershipData,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, newUserData);
      console.log("Created new user document with membership data");
    }

    // Record the payment
    await addDoc(collection(db, "payments"), {
      userId,
      planId: plan.id,
      planTitle: plan.title,
      planDuration: plan.duration,
      amount: plan.price,
      paymentId: paymentId,
      status: "success",
      createdAt: new Date().toISOString(),
    });

    console.log("Payment recorded successfully");
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "Diamond":
        return Diamond;
      case "Crown":
        return Crown;
      case "Gem":
        return Gem;
      default:
        return Star;
    }
  };

  // Payment Modal Component
  const PaymentModal = () => {
    if (!selectedPlan) return null;

    return (
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.title}</DialogTitle>
          </DialogHeader>
          {paymentConfigError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4" />
              <AlertDescription>{paymentConfigError}</AlertDescription>
            </Alert>
          )}
          <div className="p-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Plan Duration</span>
                  <span className="font-medium">
                    {selectedPlan?.duration} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-medium">₹{selectedPlan?.price}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleDirectPayment}
                disabled={processingPayment || !!paymentConfigError}
              >
                {processingPayment ? "Processing..." : "Proceed to Payment"}
              </Button>

              {!paymentConfigError && (
                <p className="text-xs text-gray-500 text-center">
                  This is a test environment. No actual payment will be
                  processed.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Handle the case where no plans are available
  if (!plans || plans.length === 0) {
    return (
      <div className="relative px-6 pt-24 pb-12 lg:px-8">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="bg-white rounded-xl shadow-lg p-10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
                <Calendar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No membership plans available at the moment
            </h2>
            <p className="text-gray-600 mb-8">
              Our team is currently working on creating valuable membership
              options for you. Please check back later or contact us for more
              information.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                Contact Support
              </Button>
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 flex items-center gap-2">
                Get Notified
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate px-6 pt-24 pb-12 lg:px-8">
      {/* Current Membership Banner */}
      {userMembership && userMembership.plan && (
        <div className="max-w-6xl mx-auto mb-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg">
                {React.createElement(getIcon(userMembership.plan.icon), {
                  className: "w-6 h-6 text-white",
                })}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {userMembership.plan.title}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">Active Membership</p>
                  <span className="text-sm text-gray-500">•</span>
                  <p className="text-gray-600">₹{userMembership.plan.price}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Valid until{" "}
                {new Date(
                  userMembership.membershipEndDate
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Title */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Choose Your Membership Plan
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your needs and unlock premium features
          to enhance your experience.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          console.log("Rendering plan:", plan.title, plan);
          const Icon = getIcon(plan.icon);
          const isFeatured = plan.featured;
          const isCurrentPlan = userMembership?.plan?.id === plan.id;

          return (
            <div
              key={plan.id || index}
              className={`
                relative group flex flex-col
                bg-white rounded-2xl 
                transition-all duration-500
                ${isFeatured ? "shadow-xl ring-2 ring-pink-500" : "shadow-lg"}
                ${isFeatured ? "lg:scale-110 lg:z-20" : ""}
              `}
            >
              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                {/* Plan Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className={`
                    p-4 rounded-full
                    bg-gradient-to-r ${plan.gradientFrom || "from-pink-500"} ${
                      plan.gradientTo || "to-purple-500"
                    }
                  `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Plan Details */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plan.title}
                  </h3>
                  <div className="mt-4 flex justify-center items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{plan.price}
                    </span>
                    <span className="ml-2 text-gray-500">
                      /{plan.duration} months
                    </span>
                  </div>
                  <p className="mt-2 text-gray-500">{plan.description}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features?.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center space-x-3 text-gray-600"
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  className={`
                    w-full py-6
                    bg-gradient-to-r ${plan.gradientFrom || "from-pink-500"} ${
                    plan.gradientTo || "to-purple-500"
                  }
                    hover:opacity-90 transition-all
                    ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}
                    ${processingPayment ? "opacity-75 cursor-not-allowed" : ""}
                  `}
                  onClick={() =>
                    !isCurrentPlan &&
                    !processingPayment &&
                    handlePlanSelect(plan)
                  }
                  disabled={isCurrentPlan || processingPayment}
                >
                  <span className="flex items-center gap-2">
                    {isCurrentPlan
                      ? "Current Plan"
                      : processingPayment
                      ? "Processing..."
                      : `Choose ${plan.title}`}
                    {!isCurrentPlan && !processingPayment && (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      <PaymentModal />
    </div>
  );
};

export default UserMembershipCard;
