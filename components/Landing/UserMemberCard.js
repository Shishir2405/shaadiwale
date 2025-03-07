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
  CreditCard,
  QrCode,
  Building,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// Enhanced Payment Modal Component with Multiple Payment Options
const UserPaymentModal = ({ isOpen, onClose, plan, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("razorpay");

  // Fetch payment settings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentSettings();
    }
  }, [isOpen]);

  const fetchPaymentSettings = async () => {
    try {
      const settingsRef = doc(db, "settings", "payment");
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const settings = settingsSnap.data();
        setPaymentSettings(settings);

        // Set default payment method to the first available one
        if (settings.razorpay?.enabled) {
          setSelectedPaymentMethod("razorpay");
        } else if (settings.qr?.enabled) {
          setSelectedPaymentMethod("qr");
        } else if (settings.bank?.enabled) {
          setSelectedPaymentMethod("bank");
        } else {
          setError("No payment methods are currently available");
        }
      } else {
        setError("Payment settings not configured");
      }
    } catch (err) {
      console.error("Error fetching payment settings:", err);
      setError("Failed to load payment settings");
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);

      if (!paymentSettings?.razorpay?.key) {
        throw new Error("Payment configuration is missing");
      }

      const options = {
        key: paymentSettings.razorpay.key,
        amount: plan.price * 100,
        currency: "INR",
        name: "Matrimony Platform",
        description: `${plan.title} Membership`,
        handler: async (response) => {
          await processMembershipPurchase(response, "razorpay");
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
        theme: {
          color: "#EC4899",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.message || "Payment failed to initialize");
      console.error("Payment error:", err);
      setLoading(false);
    }
  };

  const handleQRPayment = async () => {
    try {
      setLoading(true);
      // Record the payment intent with pending status
      const paymentRef = await addDoc(collection(db, "payments"), {
        userId,
        planId: plan.id,
        amount: plan.price,
        method: "qr",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Update user with pending membership
      const userRef = doc(db, "users", userId);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      await updateDoc(userRef, {
        membershipPlan: plan.id,
        membershipStatus: "pending",
        membershipStartDate: new Date().toISOString(),
        membershipEndDate: endDate.toISOString(),
        pendingPaymentId: paymentRef.id,
      });

      setLoading(false);
      onSuccess("pending");
      onClose();
    } catch (err) {
      setError("Failed to process QR payment request");
      console.error("QR payment processing error:", err);
      setLoading(false);
    }
  };

  const handleBankTransferPayment = async () => {
    try {
      setLoading(true);
      // Record the payment intent with pending status
      const paymentRef = await addDoc(collection(db, "payments"), {
        userId,
        planId: plan.id,
        amount: plan.price,
        method: "bank",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Update user with pending membership
      const userRef = doc(db, "users", userId);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      await updateDoc(userRef, {
        membershipPlan: plan.id,
        membershipStatus: "pending",
        membershipStartDate: new Date().toISOString(),
        membershipEndDate: endDate.toISOString(),
        pendingPaymentId: paymentRef.id,
      });

      setLoading(false);
      onSuccess("pending");
      onClose();
    } catch (err) {
      setError("Failed to process bank transfer request");
      console.error("Bank transfer processing error:", err);
      setLoading(false);
    }
  };

  const processMembershipPurchase = async (paymentResponse, method) => {
    try {
      const userRef = doc(db, "users", userId);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      await updateDoc(userRef, {
        membershipPlan: plan.id,
        membershipStatus: "active",
        membershipStartDate: new Date().toISOString(),
        membershipEndDate: endDate.toISOString(),
      });

      await addDoc(collection(db, "payments"), {
        userId,
        planId: plan.id,
        amount: plan.price,
        method: method,
        paymentId:
          method === "razorpay" ? paymentResponse.razorpay_payment_id : null,
        status: "success",
        createdAt: new Date().toISOString(),
      });

      onSuccess("active");
      onClose();
    } catch (err) {
      setError("Failed to process payment");
      console.error("Payment processing error:", err);
    }
  };

  // Helper to check if a payment method is enabled
  const isPaymentMethodEnabled = (method) => {
    return paymentSettings?.[method]?.enabled === true;
  };

  // Count how many payment methods are available
  const availableMethodsCount = paymentSettings
    ? [
        isPaymentMethodEnabled("razorpay"),
        isPaymentMethodEnabled("qr"),
        isPaymentMethodEnabled("bank"),
      ].filter(Boolean).length
    : 0;

  const handlePayment = () => {
    switch (selectedPaymentMethod) {
      case "razorpay":
        handleRazorpayPayment();
        break;
      case "qr":
        handleQRPayment();
        break;
      case "bank":
        handleBankTransferPayment();
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upgrade to {plan?.title}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-4">
          <div className="space-y-6">
            {/* Plan summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Plan Duration</span>
                <span className="font-medium">{plan?.duration} months</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-medium">₹{plan?.price}</span>
              </div>
            </div>

            {/* Payment method tabs - only show if we have at least one enabled method */}
            {availableMethodsCount > 0 ? (
              <>
                <div className="space-y-4">
                  {availableMethodsCount > 1 && (
                    <div className="space-y-2">
                      <Label>Select Payment Method</Label>
                      <Tabs
                        value={selectedPaymentMethod}
                        onValueChange={setSelectedPaymentMethod}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-3">
                          {isPaymentMethodEnabled("razorpay") && (
                            <TabsTrigger
                              value="razorpay"
                              className="flex items-center gap-2"
                            >
                              <CreditCard className="h-4 w-4" />
                              <span>Razorpay</span>
                            </TabsTrigger>
                          )}
                          {isPaymentMethodEnabled("qr") && (
                            <TabsTrigger
                              value="qr"
                              className="flex items-center gap-2"
                            >
                              <QrCode className="h-4 w-4" />
                              <span>QR Code</span>
                            </TabsTrigger>
                          )}
                          {isPaymentMethodEnabled("bank") && (
                            <TabsTrigger
                              value="bank"
                              className="flex items-center gap-2"
                            >
                              <Building className="h-4 w-4" />
                              <span>Bank</span>
                            </TabsTrigger>
                          )}
                        </TabsList>

                        {isPaymentMethodEnabled("qr") && (
                          <TabsContent value="qr" className="mt-4">
                            <div className="space-y-4">
                              {paymentSettings?.qr?.imageUrl && (
                                <div className="flex justify-center p-4 border rounded-lg">
                                  <img
                                    src={paymentSettings.qr.imageUrl}
                                    alt="Payment QR Code"
                                    className="max-w-full h-auto max-h-48"
                                  />
                                </div>
                              )}
                              <div className="text-sm text-gray-600">
                                <p>
                                  {paymentSettings?.qr?.instructions ||
                                    "Scan the QR code to make payment. After payment, click 'Confirm Payment' below."}
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                        )}

                        {isPaymentMethodEnabled("bank") && (
                          <TabsContent value="bank" className="mt-4">
                            <div className="space-y-4 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Account Name:</div>
                                <div>{paymentSettings?.bank?.accountName}</div>

                                <div className="font-medium">
                                  Account Number:
                                </div>
                                <div>
                                  {paymentSettings?.bank?.accountNumber}
                                </div>

                                <div className="font-medium">Bank Name:</div>
                                <div>{paymentSettings?.bank?.bankName}</div>

                                <div className="font-medium">IFSC Code:</div>
                                <div>{paymentSettings?.bank?.ifscCode}</div>

                                <div className="font-medium">Branch:</div>
                                <div>{paymentSettings?.bank?.branch}</div>
                              </div>
                              <p className="text-gray-600">
                                Please transfer the amount to the above account.
                                After payment, click 'Confirm Payment' below.
                              </p>
                            </div>
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : selectedPaymentMethod === "razorpay"
                      ? "Proceed to Payment"
                      : "Confirm Payment"}
                  </Button>
                </div>
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  Payment system is currently unavailable. Please try again
                  later.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// User Membership Card Component
const UserMembershipCard = ({ userId }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userMembership, setUserMembership] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  console.log("UserMembershipCard mounted with userId:", userId);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch plans
      const plansSnapshot = await getDocs(collection(db, "membershipPlans"));
      const plansData = plansSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((plan) => plan.active) // Only show active plans to users
        .sort((a, b) => a.price - b.price); // Sort by price

      setPlans(plansData);

      // Fetch user membership if userId exists
      if (userId) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.membershipPlan) {
            const userPlan = plansData.find(
              (p) => p.id === userData.membershipPlan
            );

            if (userPlan) {
              setUserMembership({
                ...userData,
                plan: userPlan,
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load membership data");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    if (!userId) {
      console.log("User not logged in, redirecting to login page");
      // Redirect to login page or show login modal
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
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

  // If no plans found
  if (plans.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-medium text-gray-700">
          No membership plans available at the moment
        </h3>
        <p className="text-gray-500 mt-2">
          Please check back later for our membership options
        </p>
      </div>
    );
  }

  return (
    <div className="relative isolate px-6 pt-12 pb-12 lg:px-8">
      {/* Current Membership Banner */}
      {userMembership && userMembership.plan && (
        <div className="max-w-6xl mx-auto mb-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
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
                  <p className="text-gray-600">
                    {userMembership.membershipStatus === "pending"
                      ? "Pending Activation"
                      : "Active Membership"}
                  </p>
                  <span className="text-sm text-gray-500">•</span>
                  <p className="text-gray-600">₹{userMembership.plan.price}</p>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              {userMembership.membershipStatus === "pending" ? (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm inline-block">
                  Payment Pending
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Valid until{" "}
                  {new Date(
                    userMembership.membershipEndDate
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = getIcon(plan.icon);
          const isFeatured = plan.featured;
          const isCurrentPlan = userMembership?.plan?.id === plan.id;
          const isPendingPlan =
            isCurrentPlan && userMembership?.membershipStatus === "pending";

          return (
            <div
              key={plan.id}
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
                    bg-gradient-to-r ${plan.gradientFrom || "from-blue-500"} ${
                      plan.gradientTo || "to-cyan-500"
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
                    bg-gradient-to-r ${plan.gradientFrom || "from-blue-500"} ${
                    plan.gradientTo || "to-cyan-500"
                  }
                    hover:opacity-90 transition-all
                    ${
                      isCurrentPlan && !isPendingPlan
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                  onClick={() => !isCurrentPlan && handlePlanSelect(plan)}
                  disabled={isCurrentPlan && !isPendingPlan}
                >
                  <span className="flex items-center gap-2">
                    {isCurrentPlan && !isPendingPlan
                      ? "Current Plan"
                      : isPendingPlan
                      ? "Payment Pending"
                      : `Choose ${plan.title}`}
                    {!isCurrentPlan && !isPendingPlan && (
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
      <UserPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
        userId={userId}
        onSuccess={(status) => {
          setShowPaymentModal(false);
          fetchData();

          // Show appropriate message based on payment status
          if (status === "pending") {
            // You could show a toast message here about pending payment
            console.log("Payment is pending verification");
          }
        }}
      />
    </div>
  );
};

export default UserMembershipCard;
