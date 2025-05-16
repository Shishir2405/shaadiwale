"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  BookOpen,
  Globe,
  EyeOff,
  Eye,
  CheckCircle,
  Heart,
  Star,
  Shield,
  GiftIcon,
  Sparkles,
  Flag
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

// Initialize Firestore
const db = getFirestore();

// Validation rules
const VALIDATION_RULES = {
  phone: {
    pattern: /^\d{10}$/,
    message: "Phone number must be 10 digits",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    message:
      "Password must be at least 8 characters and include letters and numbers",
  },
};

// Format date for consistent storage
const formatDate = (day, month, year) => {
  const monthMap = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  return `${year}-${monthMap[month]}-${day}`;
};

const RegistrationForm = () => {
  const router = useRouter();

  // Animation states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [floatingIcons, setFloatingIcons] = useState([]);

  // Form data state
  const [formData, setFormData] = useState({
    profileCreatedBy: "",
    gender: "",
    firstName: "",
    lastName: "",
    day: "",
    month: "",
    year: "",
    religion: "",
    motherTongue: "",
    country: "",
    countryCode: "+91",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // UI states
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stageComplete, setStageComplete] = useState({
    1: false,
    2: false,
    3: false,
  });
  const [showAgePopup, setShowAgePopup] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPreVerification, setShowPreVerification] = useState(true);

  // Generate random floating icons on component mount
  useEffect(() => {
    const icons = [];
    for (let i = 0; i < 8; i++) {
      icons.push({
        id: i,
        icon: Math.floor(Math.random() * 5), // 0-4 for different icon types
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 18 + 10,
        speed: Math.random() * 6 + 4,
        opacity: Math.random() * 0.2 + 0.05,
        rotation: Math.random() * 20 - 10,
      });
    }
    setFloatingIcons(icons);

    // Start the animation sequence
    setTimeout(() => setIsLoaded(true), 300);

    // Update mouse position for subtle hover effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Check for email verification on component mount
  useEffect(() => {
    const checkVerification = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          const email = window.localStorage.getItem("emailForSignIn");
          const pendingData = JSON.parse(
            localStorage.getItem("pendingRegistration")
          );

          if (email && pendingData) {
            setIsLoading(true);

            const credential = await signInWithEmailLink(
              auth,
              email,
              window.location.href
            );
            const user = credential.user;

            // Update user document with verified status
            await setDoc(doc(db, "users", user.uid), {
              ...pendingData,
              emailVerified: true,
              accountStatus: "active",
              lastLoginAt: new Date().toISOString(),
            });

            // Clear storage
            window.localStorage.removeItem("emailForSignIn");
            window.localStorage.removeItem("pendingRegistration");

            setShowPreVerification(false);
            setSuccessMessage(
              "Account created and verified successfully! Redirecting to dashboard..."
            );

            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } catch (error) {
          console.error("Verification error:", error);
          setErrorMessage(`Email verification failed: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkVerification();
  }, [router]);

  // Check stage completion
  useEffect(() => {
    // Stage 1 validation
    if (
      formData.profileCreatedBy &&
      formData.gender &&
      formData.firstName &&
      formData.lastName
    ) {
      setStageComplete((prev) => ({ ...prev, 1: true }));
    } else {
      setStageComplete((prev) => ({ ...prev, 1: false }));
    }

    // Stage 2 validation
    if (
      formData.day &&
      formData.month &&
      formData.year &&
      formData.religion &&
      formData.motherTongue &&
      formData.country
    ) {
      setStageComplete((prev) => ({ ...prev, 2: true }));
    } else {
      setStageComplete((prev) => ({ ...prev, 2: false }));
    }

    // Stage 3 validation
    if (
      formData.phone &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      formData.acceptTerms
    ) {
      setStageComplete((prev) => ({ ...prev, 3: true }));
    } else {
      setStageComplete((prev) => ({ ...prev, 3: false }));
    }
  }, [formData]);

  const handleSendVerification = async (email) => {
    if (!VALIDATION_RULES.email.pattern.test(email)) {
      setErrorMessage("Invalid email");
      return false;
    }

    setIsLoading(true);
    try {
      // Create auth user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        formData.password
      );

      // Format the date of birth properly
      const dateOfBirth = formatDate(
        formData.day,
        formData.month,
        formData.year
      );

      // Prepare complete user data for Firestore
      const userData = {
        // Basic Info
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: email,
        phone: formData.phone,
        countryCode: formData.countryCode,

        // Profile Details
        profileCreatedBy: formData.profileCreatedBy,
        gender: formData.gender,
        dateOfBirth: dateOfBirth,
        religion: formData.religion,
        motherTongue: formData.motherTongue,
        country: formData.country,

        // System Fields
        uid: user.uid,
        emailVerified: false,
        accountStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasAcceptedTerms: formData.acceptTerms,

        // Optional default values
        profileImageUrl: "", // You can set a default image URL if needed
        lastLoginAt: new Date().toISOString(),
      };

      // Store complete user data in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });

      // Store email for verification
      window.localStorage.setItem("emailForSignIn", email);

      // Store complete registration data in localStorage
      window.localStorage.setItem(
        "pendingRegistration",
        JSON.stringify(userData)
      );

      await signOut(auth);

      setVerificationSent(true);
      setSuccessMessage("Verification email sent! Please check your inbox.");
      return true;
    } catch (error) {
      console.error("Error:", error);
      let errorMsg = "Registration failed. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        errorMsg = "This email is already registered";
      }
      setErrorMessage(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (day, month, year) => {
    const dob = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const validateForm = () => {
    const requiredFields = {
      profileCreatedBy: "Profile Creator",
      gender: "Gender",
      firstName: "First Name",
      lastName: "Last Name",
      day: "Day",
      month: "Month",
      year: "Year",
      religion: "Religion",
      motherTongue: "Mother Tongue",
      country: "Country",
      phone: "Phone Number",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
    };

    if (formData.year && formData.month && formData.day) {
      const age = calculateAge(formData.day, formData.month, formData.year);
      if (age < 20) {
        setShowAgePopup(true);
        return false;
      }
    }

    const emptyFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (emptyFields.length > 0) {
      setErrorMessage(`Please fill in: ${emptyFields.join(", ")}`);
      return false;
    }

    if (!VALIDATION_RULES.phone.pattern.test(formData.phone)) {
      setErrorMessage(VALIDATION_RULES.phone.message);
      return false;
    }

    if (!VALIDATION_RULES.password.pattern.test(formData.password)) {
      setErrorMessage(VALIDATION_RULES.password.message);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return false;
    }

    if (!formData.acceptTerms) {
      setErrorMessage("Please accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const verificationSuccess = await handleSendVerification(formData.email);

    if (!verificationSuccess) {
      return;
    }

    setSuccessMessage("Please check your email to verify your account.");
  };

  // Render floating background icons
  const renderFloatingIcons = () => {
    return floatingIcons.map((icon) => {
      let IconComponent;
      switch (icon.icon) {
        case 0:
          IconComponent = Heart;
          break;
        case 1:
          IconComponent = Star;
          break;
        case 2:
          IconComponent = Shield;
          break;
        case 3:
          IconComponent = User;
          break;
        default:
          IconComponent = Sparkles;
      }

      return (
        <div
          key={icon.id}
          className="absolute pointer-events-none"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            opacity: icon.opacity,
            transform: `rotate(${icon.rotation}deg)`,
            animation: `float-${icon.id} ${icon.speed}s infinite ease-in-out alternate`,
          }}
        >
          <IconComponent size={icon.size} className="text-pink-200/20" />
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 to-pink-700 p-4 overflow-hidden">
      {/* Simple background with subtle parallax */}
      <div
        className="fixed inset-0 z-0"
        style={{
          transform: `translate(${mousePosition.x * -10}px, ${
            mousePosition.y * -10
          }px)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-pink-700"></div>

        {/* Subtle light effect */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-purple-400/10 blur-3xl"></div>

        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden">
          {renderFloatingIcons()}
        </div>
      </div>

      {/* Main content */}
      <div
        className={`relative z-10 w-full max-w-3xl transition-all duration-700 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Register Your Account
          </h1>
          <p className="text-pink-100/80 mt-2">
            Complete the form below to join our community
          </p>
        </div>

        {/* Age popup */}
        {showAgePopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 p-8 rounded-xl border border-white/20 backdrop-blur-xl shadow-2xl text-white">
              <svg
                className="w-16 h-16 text-pink-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-2xl font-bold mb-2 text-center">
                Age Restriction
              </h3>
              <p className="mb-6 text-center text-white/80">
                You must be at least 20 years old to register.
              </p>
              <button
                onClick={() => {
                  setShowAgePopup(false);
                  window.location.href = "/";
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-full hover:opacity-90 transition font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Card with multi-stage form */}
        <Card className="relative w-full overflow-hidden backdrop-blur-md bg-white/5 border border-white/20 shadow-xl rounded-xl p-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center w-full mb-2">
              {[1, 2, 3].map((stage) => (
                <div
                  key={stage}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStage === stage
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-110"
                      : currentStage > stage
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                      : "bg-white/20 text-white/60"
                  }`}
                >
                  {currentStage > stage ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{stage}</span>
                  )}

                  {/* Subtle pulse animation for current stage */}
                  {currentStage === stage && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-pink-400"></span>
                  )}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
                style={{ width: `${(currentStage - 1) * 50}%` }}
              ></div>
            </div>
          </div>

          {/* Error and success messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-300 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-300 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Stage 1: Basic Info */}
            <div
              className={`space-y-5 transition-all duration-300 ${
                currentStage === 1 ? "block opacity-100" : "hidden opacity-0"
              }`}
            >
              <h2 className="text-xl font-semibold text-white flex items-center">
                <User className="mr-2 text-pink-400" size={20} />
                Personal Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-xs mb-1 block">
                    Profile Created By
                  </label>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
                    <select
                      name="profileCreatedBy"
                      value={formData.profileCreatedBy}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-transparent text-white text-sm outline-none"
                    >
                      <option value="" disabled className="bg-purple-900">
                        Profile Created By
                      </option>
                      <option value="self" className="bg-purple-900">
                        Self
                      </option>
                      <option value="parent" className="bg-purple-900">
                        Parent
                      </option>
                      <option value="sibling" className="bg-purple-900">
                        Sibling
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-white/80 text-xs mb-1 block">
                    Gender
                  </label>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-transparent text-white text-sm outline-none"
                    >
                      <option value="" disabled className="bg-purple-900">
                        Select Gender
                      </option>
                      <option value="male" className="bg-purple-900">
                        Male
                      </option>
                      <option value="female" className="bg-purple-900">
                        Female
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-xs mb-1 block">
                    First Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-pink-400">
                      <User size={16} />
                    </span>
                    <Input
                      name="firstName"
                      placeholder="Your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:border-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/80 text-xs mb-1 block">
                    Last Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-pink-400">
                      <User size={16} />
                    </span>
                    <Input
                      name="lastName"
                      placeholder="Your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:border-pink-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => stageComplete[1] && setCurrentStage(2)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
                    stageComplete[1]
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                      : "bg-white/10 text-white/60 cursor-not-allowed"
                  }`}
                >
                  Continue
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="ml-2"
                  >
                    <path
                      fill="currentColor"
                      d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stage 2: Additional Info */}
            <div
              className={`space-y-5 transition-all duration-300 ${
                currentStage === 2 ? "block opacity-100" : "hidden opacity-0"
              }`}
            >
              <h2 className="text-xl font-semibold text-white flex items-center">
                <BookOpen className="mr-2 text-pink-400" size={20} />
                Background Information
              </h2>

              <div>
                <label className="text-white/80 text-xs mb-1 block">
                  Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-pink-400">
                      <Calendar size={16} />
                    </span>
                    <select
                      name="day"
                      value={formData.day}
                      onChange={handleInputChange}
                      className="w-full pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:border-pink-400"
                    >
                      <option value="" className="bg-purple-900">
                        Day
                      </option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option
                          key={i + 1}
                          value={String(i + 1).padStart(2, "0")}
                          className="bg-purple-900"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:border-pink-400"
                  >
                    <option value="" className="bg-purple-900">
                      Month
                    </option>
                    {[
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ].map((month) => (
                      <option
                        key={month}
                        value={month}
                        className="bg-purple-900"
                      >
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:border-pink-400"
                  >
                    <option value="" className="bg-purple-900">
                      Year
                    </option>
                    {Array.from({ length: 50 }, (_, i) => (
                      <option
                        key={i}
                        value={2024 - i}
                        className="bg-purple-900"
                      >
                        {2024 - i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/80 text-xs mb-1 block">
                  Religion
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-pink-400">
                    <Flag size={16} />
                  </span>
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    className="w-full pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:border-pink-400"
                  >
                    <option value="" className="bg-purple-900">
                      Select Your Religion
                    </option>
                    <option value="hindu" className="bg-purple-900">
                      Hindu
                    </option>
                    <option value="muslim" className="bg-purple-900">
                      Muslim
                    </option>
                    <option value="christian" className="bg-purple-900">
                      Christian
                    </option>
                    <option value="sikh" className="bg-purple-900">
                      Sikh
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/80 text-xs mb-1 block">
                    Mother Tongue
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-pink-400">
                      <BookOpen size={16} />
                    </span>
                    <select
                      name="motherTongue"
                      value={formData.motherTongue}
                      onChange={handleInputChange}
                      className="w-full pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:border-pink-400"
                    >
                      <option value="" className="bg-purple-900">
                        Mother Tongue
                      </option>
                      <option value="hindi" className="bg-purple-900">
                        Hindi
                      </option>
                      <option value="english" className="bg-purple-900">
                        English
                      </option>
                      <option value="tamil" className="bg-purple-900">
                        Tamil
                      </option>
                      <option value="telugu" className="bg-purple-900">
                        Telugu
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-white/80 text-xs mb-1 block">
                    Country
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-pink-400">
                      <Globe size={16} />
                    </span>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:border-pink-400"
                    >
                      <option value="" className="bg-purple-900">
                        Country
                      </option>
                      <option value="india" className="bg-purple-900">
                        India
                      </option>
                      <option value="usa" className="bg-purple-900">
                        USA
                      </option>
                      <option value="uk" className="bg-purple-900">
                        UK
                      </option>
                      <option value="canada" className="bg-purple-900">
                        Canada
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStage(1)}
                  className="px-5 py-2 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all duration-300 flex items-center"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="mr-2"
                  >
                    <path
                      fill="currentColor"
                      d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"
                    />
                  </svg>
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => stageComplete[2] && setCurrentStage(3)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center ${
                    stageComplete[2]
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                      : "bg-white/10 text-white/60 cursor-not-allowed"
                  }`}
                >
                  Continue
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="ml-2"
                  >
                    <path
                      fill="currentColor"
                      d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stage 3: Contact & Security */}
            <div
              className={`space-y-5 transition-all duration-300 ${
                currentStage === 3 ? "block opacity-100" : "hidden opacity-0"
              }`}
            >
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Shield className="mr-2 text-pink-400" size={20} />
                Contact & Security
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-white/80 text-xs mb-1 block">
                    Country Code
                  </label>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:border-pink-400"
                  >
                    <option value="+91" className="bg-purple-900">
                      +91
                    </option>
                    <option value="+1" className="bg-purple-900">
                      +1
                    </option>
                    <option value="+44" className="bg-purple-900">
                      +44
                    </option>
                    <option value="+61" className="bg-purple-900">
                      +61
                    </option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-white/80 text-xs mb-1 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-pink-400">
                      <Phone size={16} />
                    </span>
                    <Input
                      name="phone"
                      placeholder="Your 10 digit number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:border-pink-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white/80 text-xs mb-1 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-pink-400">
                    <Mail size={16} />
                  </span>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:border-pink-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/80 text-xs mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-pink-400">
                    <Lock size={16} />
                  </span>
                  <Input
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:border-pink-400"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-2 text-pink-400"
                  >
                    {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  At least 8 characters with letters and numbers
                </p>
              </div>

              <div>
                <label className="text-white/80 text-xs mb-1 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-pink-400">
                    <Lock size={16} />
                  </span>
                  <Input
                    name="confirmPassword"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-9 p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:border-pink-400"
                  />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 bg-white/10 border-2 border-pink-400 rounded checked:bg-pink-500 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="terms" className="ml-3 text-xs text-white/80">
                  I accept the{" "}
                  <span className="text-pink-400 hover:text-pink-300 cursor-pointer transition-colors">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-pink-400 hover:text-pink-300 cursor-pointer transition-colors">
                    Privacy Policy
                  </span>
                </label>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStage(2)}
                  className="px-5 py-2 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition-all duration-300 flex items-center"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    className="mr-2"
                  >
                    <path
                      fill="currentColor"
                      d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"
                    />
                  </svg>
                  Back
                </button>

                <button
                  type="submit"
                  disabled={!stageComplete[3] || isLoading}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    stageComplete[3] && !isLoading
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                      : "bg-white/10 text-white/60 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Register Now</span>
                      <Sparkles className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Card>

        {/* Bottom text */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-pink-400 font-medium hover:text-pink-300 transition-colors"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>

      {/* CSS animations for floating icons */}
      <style jsx global>{`
        ${floatingIcons
          .map(
            (icon) => `
         @keyframes float-${icon.id} {
           0% {
             transform: translateY(0px) rotate(${icon.rotation}deg);
           }
           50% {
             transform: translateY(-${5 + Math.random() * 15}px) rotate(${
              icon.rotation + 5
            }deg);
           }
           100% {
             transform: translateY(0px) rotate(${icon.rotation}deg);
           }
         }
       `
          )
          .join("\n")}
      `}</style>
    </div>
  );
};

export default RegistrationForm;
