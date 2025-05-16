"use client";

import React, { useState, useEffect } from "react";
import {
  Diamond,
  Crown,
  Gem,
  Star,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import Link from "next/link";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Admin MembershipCard Component
const AdminMembershipCard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchPlans();
  }, [refreshTrigger]);

  const checkAdminStatus = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        // Check if user has admin or verifier role
        const role = parsedUser.role?.name || parsedUser.role;
        setIsAdmin(
          role === "Admin" || role === "Verifier" || role === "Seller"
        );

        if (
          !role ||
          (role !== "Admin" && role !== "Verifier" && role !== "Seller")
        ) {
          setError("You don't have permission to access this page");
        }
      } else {
        setError("You must be logged in to access this page");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setError("Authentication error");
    }
  };

  const fetchPlans = async () => {
    try {
      const plansSnapshot = await getDocs(collection(db, "membershipPlans"));
      const plansData = plansSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.price - b.price); // Sort by price

      setPlans(plansData);
      console.log("Admin loaded plans:", plansData.length);
    } catch (err) {
      console.error("Error fetching plans:", err);
      setError("Failed to load membership plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewPlan = () => {
    setSelectedPlan(null);
    setShowEditModal(true);
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setShowEditModal(true);
  };

  const handleDeletePlan = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const confirmDeletePlan = async () => {
    try {
      if (!selectedPlan?.id) return;

      await deleteDoc(doc(db, "membershipPlans", selectedPlan.id));
      setShowDeleteModal(false);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError("Failed to delete plan");
    }
  };

  const handleSavePlan = async (planData) => {
    try {
      if (selectedPlan?.id) {
        await updateDoc(doc(db, "membershipPlans", selectedPlan.id), planData);
      } else {
        await addDoc(collection(db, "membershipPlans"), planData);
      }
      setShowEditModal(false);
      setRefreshTrigger((prev) => prev + 1);
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
        gradientFrom: "from-pink-500",
        gradientTo: "to-purple-500",
        featured: false,
        active: true,
      }
    );

    // Reset form data when the plan changes
    useEffect(() => {
      if (plan) {
        setFormData(plan);
      } else {
        setFormData({
          title: "",
          price: "",
          duration: "",
          description: "",
          features: [""],
          icon: "Star",
          gradientFrom: "from-pink-500",
          gradientTo: "to-purple-500",
          featured: false,
          active: true,
        });
      }
    }, [plan]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      await onSave({
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
      });
    };

    const addFeature = () => {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), ""],
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
                  value={formData.title || ""}
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
                  value={formData.price || ""}
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
                  value={formData.duration || ""}
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
                <Select
                  value={formData.icon || "Star"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      icon: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Star">Star</SelectItem>
                    <SelectItem value="Crown">Crown</SelectItem>
                    <SelectItem value="Diamond">Diamond</SelectItem>
                    <SelectItem value="Gem">Gem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label>Description</label>
              <Input
                value={formData.description || ""}
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
              <label>Gradient From</label>
              <Select
                value={formData.gradientFrom || "from-pink-500"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    gradientFrom: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gradient start" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="from-pink-500">Pink</SelectItem>
                  <SelectItem value="from-blue-500">Blue</SelectItem>
                  <SelectItem value="from-green-500">Green</SelectItem>
                  <SelectItem value="from-purple-500">Purple</SelectItem>
                  <SelectItem value="from-orange-500">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Gradient To</label>
              <Select
                value={formData.gradientTo || "to-purple-500"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    gradientTo: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gradient end" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-pink-500">Pink</SelectItem>
                  <SelectItem value="to-blue-500">Blue</SelectItem>
                  <SelectItem value="to-green-500">Green</SelectItem>
                  <SelectItem value="to-purple-500">Purple</SelectItem>
                  <SelectItem value="to-orange-500">Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Features</label>
              {(formData.features || []).map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...(formData.features || [])];
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
                        features: (prev.features || []).filter(
                          (_, i) => i !== index
                        ),
                      }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Feature
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.featured || false}
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
                  checked={formData.active !== false}
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

  // Delete Confirmation Modal
  const DeleteModal = ({ isOpen, onClose, plan, onConfirm }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{plan?.title}" plan? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </DialogFooter>
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

  if (!isAdmin) {
    return (
      <Alert className="max-w-xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative isolate px-6 pt-12 pb-12 lg:px-8">
      {/* Admin Controls */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Manage Membership Plans
        </h2>
        <Link href="/dashboard/membership/add">
          <Button className="bg-gradient-to-r from-pink-600 to-purple-600">
            <Plus className="h-4 w-4 mr-2" /> Add New Plan
          </Button>
        </Link>
      </div>

      {/* Status Summary */}
      <div className="max-w-6xl mx-auto mb-8 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Total Plans</p>
          <p className="text-2xl font-bold">{plans.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Active Plans</p>
          <p className="text-2xl font-bold">
            {plans.filter((p) => p.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500">Featured Plans</p>
          <p className="text-2xl font-bold">
            {plans.filter((p) => p.featured).length}
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = getIcon(plan.icon);
          const isFeatured = plan.featured;
          const isActive = plan.active !== false;

          return (
            <div
              key={plan.id}
              className={`
                relative group flex flex-col
                bg-white rounded-2xl 
                transition-all duration-500
                ${isFeatured ? "shadow-xl ring-2 ring-pink-500" : "shadow-lg"}
                ${!isActive ? "opacity-60" : ""}
              `}
            >
              {/* Status Badge */}
              {!isActive && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Inactive
                  </span>
                </div>
              )}

              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Featured
                  </span>
                </div>
              )}

              {/* Admin Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPlan(plan)}
                  className="bg-white bg-opacity-80 hover:bg-opacity-100"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePlan(plan)}
                  className="bg-white bg-opacity-80 hover:bg-opacity-100 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

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
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <EditPlanModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        plan={selectedPlan}
        onSave={handleSavePlan}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        plan={selectedPlan}
        onConfirm={confirmDeletePlan}
      />
    </div>
  );
};

export default AdminMembershipCard;
