"use client";

import React, { useState, useCallback, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Save,
  Book,
  Users,
  Heart,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Gift,
  Home,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Church,
  X,
} from "lucide-react";
import {
  HEIGHT_OPTIONS,
  MARITAL_STATUS,
  RELIGIONS,
  EDUCATION,
  OCCUPATIONS,
  ANNUAL_INCOME,
  CASTES,
  INDIAN_STATES,
} from "@/lib/constant/serach";


const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center space-x-2 mb-6">
    {[...Array(totalSteps)].map((_, index) => (
      <motion.div
        key={index}
        className={`h-2 rounded-full ${
          index === currentStep
            ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
            : "w-2 bg-gray-200"
        }`}
        animate={{ scale: index === currentStep ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      />
    ))}
  </div>
);

const SearchStep = ({ title, description, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-pink-50 rounded-lg">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const InputField = ({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  type = "text",
}) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <motion.div className="relative group" whileHover={{ scale: 1.01 }}>
      <Icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600" />
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
      />
    </motion.div>
  </div>
);

const SelectField = ({ icon: Icon, label, name, value, onChange, options }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <motion.div className="relative group" whileHover={{ scale: 1.01 }}>
      <Icon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600" />
      <select
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </motion.div>
  </div>
);

export default function EnhancedProfileEdit() {
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    location: "",

    // Education & Career
    education: "",
    degree: "",
    occupation: "",
    company: "",
    annualIncome: "",
    workLocation: "",

    // Family Background
    familyType: "",
    familyStatus: "",
    fatherOccupation: "",
    motherOccupation: "",
    siblings: "",
    familyLocation: "",

    // Partner Preferences
    ageRangeFrom: "",
    ageRangeTo: "",
    preferredLocation: "",
    minEducation: "",
    occupationPreference: "",
    religionPreference: "",
    castePreference: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setFormData(userDoc.data());
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Error loading your profile data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage("");
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), formData);
        setMessage("Profile updated successfully");

        // Clear success message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Error saving changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6"
        >
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
                <User className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Edit Profile
                </h1>
                <p className="text-gray-600 text-sm">
                  Update your profile information
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-6 pb-4"
              >
                <div
                  className={`
                  p-3 rounded-lg flex items-center space-x-2 text-sm
                  ${
                    message.includes("Error")
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-green-50 text-green-700 border border-green-100"
                  }
                `}
                >
                  {message.includes("Error") ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <SearchStep
              key="personal"
              title="Personal Details"
              description="Your basic information"
              icon={User}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={User}
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={User}
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Calendar}
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  type="date"
                />
                <InputField
                  icon={Phone}
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Mail}
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                />
                <InputField
                  icon={MapPin}
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
            </SearchStep>
          )}

          {currentStep === 1 && (
            <SearchStep
              key="education"
              title="Education & Career"
              description="Your educational and professional details"
              icon={Book}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={Book}
                  label="Education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Book}
                  label="Degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Briefcase}
                  label="Occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Briefcase}
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Briefcase}
                  label="Annual Income"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={MapPin}
                  label="Work Location"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                />
              </div>
            </SearchStep>
          )}

          {currentStep === 2 && (
            <SearchStep
              key="family"
              title="Family Background"
              description="Information about your family"
              icon={Users}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={Users}
                  label="Family Type"
                  name="familyType"
                  value={formData.familyType}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Users}
                  label="Family Status"
                  name="familyStatus"
                  value={formData.familyStatus}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Briefcase}
                  label="Father's Occupation"
                  name="fatherOccupation"
                  value={formData.fatherOccupation}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Briefcase}
                  label="Mother's Occupation"
                  name="motherOccupation"
                  value={formData.motherOccupation}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Users}
                  label="Number of Siblings"
                  name="siblings"
                  value={formData.siblings}
                  onChange={handleInputChange}
                  type="number"
                />
                <InputField
                  icon={Home}
                  label="Family Location"
                  name="familyLocation"
                  value={formData.familyLocation}
                  onChange={handleInputChange}
                />
              </div>
            </SearchStep>
          )}

          {currentStep === 3 && (
            <SearchStep
              key="preferences"
              title="Partner Preferences"
              description="Your preferences for a life partner"
              icon={Heart}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  icon={Calendar}
                  label="Preferred Age From"
                  name="ageRangeFrom"
                  value={formData.ageRangeFrom}
                  onChange={handleInputChange}
                  type="number"
                />
                <InputField
                  icon={Calendar}
                  label="Preferred Age To"
                  name="ageRangeTo"
                  value={formData.ageRangeTo}
                  onChange={handleInputChange}
                  type="number"
                />
                <InputField
                  icon={MapPin}
                  label="Preferred Location"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Book}
                  label="Minimum Education"
                  name="minEducation"
                  value={formData.minEducation}
                  onChange={handleInputChange}
                />
                <SelectField
                  icon={Church}
                  label="Religion Preference"
                  name="religionPreference"
                  value={formData.religionPreference}
                  onChange={handleInputChange}
                  options={RELIGIONS}
                />
                <SelectField
                  icon={Church}
                  label="Caste Preference"
                  name="castePreference"
                  value={formData.castePreference}
                  onChange={handleInputChange}
                  options={
                    formData.religionPreference
                      ? CASTES[formData.religionPreference.toLowerCase()]
                      : []
                  }
                  disabled={!formData.religionPreference}
                />
                <InputField
                  icon={Briefcase}
                  label="Occupation Preference"
                  name="occupationPreference"
                  value={formData.occupationPreference}
                  onChange={handleInputChange}
                />
              </div>
            </SearchStep>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>

          {currentStep < totalSteps - 1 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
              }
              className="px-4 py-2 text-pink-600 flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-center"
              >
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-4 border-pink-200 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-1 border-4 border-t-pink-500 border-transparent rounded-full"
                  />
                </div>
                <p className="text-gray-600">Loading your profile...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
