"use client";

import { useState, useEffect } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
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
import "@/public/css/input.css";
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
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  return `${year}-${monthMap[month]}-${day}`;
};

const SignUpForm = () => {
  const router = useRouter();

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

  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAgePopup, setShowAgePopup] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPreVerification, setShowPreVerification] = useState(true);

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
      const dateOfBirth = `${formData.year}-${formData.month}-${formData.day}`;
  
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
        lastLoginAt: new Date().toISOString()
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
      confirmPassword: "Confirm Password"
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

  // JSX remains the same as your original component...
  return (
    <>
      {showAgePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 p-8 rounded-xl border border-white/20 backdrop-blur-xl shadow-2xl text-white">
            <svg
              className="w-16 h-16 text-[#e71c5d] mx-auto mb-4"
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
              className="w-full bg-gradient-to-r from-[#e71c5d] to-rose-600 text-white py-3 rounded-full hover:opacity-90 transition font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      <Card className="w-[400px] p-6 bg-white/5 backdrop-blur-xl border border-white/40 shadow-2xl rounded-xl">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-md text-green-500 text-sm">
            {successMessage}
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-6">REGISTER NOW</h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Your existing form JSX... */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <select
                name="profileCreatedBy"
                value={formData.profileCreatedBy}
                onChange={handleInputChange}
                className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
              >
                <option value="">Profile Created By</option>
                <option value="self">Self</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
              </select>
            </div>
            <div className="space-y-2">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="firstName"
              placeholder="Enter First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/40 text-white placeholder-white"
            />
            <Input
              name="lastName"
              placeholder="Enter Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/40 text-white placeholder-white"
            />
          </div>

          <Input
            name="email"
            type="email"
            placeholder="Enter Email Address"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 text-white placeholder-white"
          />

          <div className="grid grid-cols-3 gap-4">
            <select
              name="day"
              value={formData.day}
              onChange={handleInputChange}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
            >
              <option value="">Month</option>
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
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
            >
              <option value="">Year</option>
              {Array.from({ length: 50 }, (_, i) => (
                <option key={i} value={2024 - i}>
                  {2024 - i}
                </option>
              ))}
            </select>
          </div>

          <select
            name="religion"
            value={formData.religion}
            onChange={handleInputChange}
            className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
          >
            <option value="">Select Your Religion</option>
            <option value="hindu">Hindu</option>
            <option value="muslim">Muslim</option>
            <option value="christian">Christian</option>
            <option value="sikh">Sikh</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <select
              name="motherTongue"
              value={formData.motherTongue}
              onChange={handleInputChange}
              className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
            >
              <option value="">Mother Tongue</option>
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
            </select>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
            >
              <option value="">Country</option>
              <option value="india">India</option>
              <option value="usa">USA</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleInputChange}
              className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 rounded-md text-sm text-white"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <Input
              name="phone"
              placeholder="Enter Your 10 Digit No"
              value={formData.phone}
              onChange={handleInputChange}
              className="p-2 bg-white/10 backdrop-blur-sm border border-white/40 text-white"
            />
          </div>

          {/* Password field with toggle visibility */}
          <div className="relative">
            <Input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 text-white pr-10 placeholder-white"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
            >
              {passwordVisible ? (
                <EyeOffIcon size={20} />
              ) : (
                <EyeIcon size={20} />
              )}
            </button>
          </div>

          {/* Confirm password field */}
          <Input
            type={passwordVisible ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/40 text-white placeholder-white"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="w-4 h-4 bg-white/10 border border-white/40 rounded"
            />
            <label htmlFor="terms" className="text-xs text-white/80">
              I accept{" "}
              <span className="text-[#e71c5d]">terms & conditions</span> and{" "}
              <span className="text-[#e71c5d]">privacy policy</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#e71c5d] to-rose-600 text-white py-2 rounded-full hover:opacity-90 transition font-semibold shadow-lg backdrop-blur-sm disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Register Now"}
          </button>
        </form>
      </Card>
    </>
  );
};

export default SignUpForm;