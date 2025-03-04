"use client";
import React, { useState, useEffect } from "react";
import {
  Diamond,
  Crown,
  Gem,
  Star,
  Check,
  ArrowRight,
  Pencil,
  AlertCircle,
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, plan, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSettings, setPaymentSettings] = useState(null);

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
        // Check if Razorpay is enabled and key exists
        if (!settings.razorpay?.enabled || !settings.razorpay?.key) {
          setError("Payment method is not available");
          return;
        }
        setPaymentSettings(settings);
      } else {
        setError("Payment settings not configured");
      }
    } catch (err) {
      console.error("Error fetching payment settings:", err);
      setError("Failed to load payment settings");
    }
  };

  const handlePayment = async () => {
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
          await processMembershipPurchase(response);
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

  const processMembershipPurchase = async (paymentResponse) => {
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
        paymentId: paymentResponse.razorpay_payment_id,
        status: "success",
        createdAt: new Date().toISOString(),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to process payment");
      console.error("Payment processing error:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
          <div className="space-y-4">
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
            {paymentSettings?.razorpay?.enabled ? (
              <Button
                className="w-full"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
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

// Edit Plan Modal Component
const EditPlanModal = ({ isOpen, onClose, plan, onSave }) => {
  const [formData, setFormData] = useState(
    plan || {
      title: "",
      price: "",
      duration: "",
      description: "",
      features: [""],
      icon: "Star",
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-500",
      featured: false,
      active: true,
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...formData,
      price: Number(formData.price),
      duration: Number(formData.duration),
    });
    onClose();
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "New Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label>Price (₹)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label>Duration (months)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label>Icon</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
              >
                <option value="Star">Star</option>
                <option value="Crown">Crown</option>
                <option value="Diamond">Diamond</option>
                <option value="Gem">Gem</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label>Description</label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label>Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features];
                    newFeatures[index] = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      features: newFeatures,
                    }));
                  }}
                  placeholder="Enter feature"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      features: prev.features.filter((_, i) => i !== index),
                    }));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFeature}>
              Add Feature
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    featured: checked,
                  }))
                }
              />
              <label>Featured Plan</label>
            </div>
            <div className="flex items-center gap-4">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    active: checked,
                  }))
                }
              />
              <label>Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {plan ? "Update Plan" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main MembershipCard Component
const MembershipCard = ({ userId, isAdmin = false, onEdit }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userMembership, setUserMembership] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  console.log("MembershipCard mounted");
  console.log("Props:", { userId, isAdmin });

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
        .filter((plan) => plan.active || isAdmin) // Only show active plans to users
        .sort((a, b) => a.price - b.price); // Sort by price

      setPlans(plansData);

      // Fetch user membership if userId exists
      if (userId) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && userDoc.data().membershipPlan) {
          const userData = userDoc.data();
          const userPlan = plansData.find(
            (p) => p.id === userData.membershipPlan
          );
          setUserMembership({
            ...userData,
            plan: userPlan,
          });
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
      // Handle user not logged in - you can add your login modal/redirect here
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  const handleSavePlan = async (planData) => {
    try {
      if (selectedPlan) {
        await updateDoc(doc(db, "membershipPlans", selectedPlan.id), planData);
      } else {
        await addDoc(collection(db, "membershipPlans"), planData);
      }
      fetchData();
    } catch (err) {
      console.error("Error saving plan:", err);
      setError("Failed to save plan");
    }
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

      {/* Admin Controls */}
      {isAdmin && (
        <div className="max-w-6xl mx-auto mb-8">
          <Button onClick={() => handleEditPlan(null)}>Add New Plan</Button>
        </div>
      )}

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const Icon = getIcon(plan.icon);
          const isFeatured = plan.featured;
          const isCurrentPlan = userMembership?.plan?.id === plan.id;

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

              {/* Admin Edit Button */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}

              <div className="p-8 flex-1 flex flex-col">
                {/* Plan Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className={`
                    p-4 rounded-full
                    bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo}
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
                    bg-gradient-to-r ${plan.gradientFrom} ${plan.gradientTo}
                    hover:opacity-90 transition-all
                    ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  onClick={() => !isCurrentPlan && handlePlanSelect(plan)}
                  disabled={isCurrentPlan}
                >
                  <span className="flex items-center gap-2">
                    {isCurrentPlan ? "Current Plan" : `Choose ${plan.title}`}
                    {!isCurrentPlan && <ArrowRight className="w-5 h-5" />}
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
        userId={userId}
        onSuccess={() => {
          setShowPaymentModal(false);
          fetchData();
        }}
      />

      {/* Edit Plan Modal */}
      {isAdmin && (
        <EditPlanModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          plan={selectedPlan}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
};

export default MembershipCard;
