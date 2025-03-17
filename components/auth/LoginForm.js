"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Shield,
  Phone,
  User,
  Heart,
  Star,
  ShoppingBag,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
// Add this to the top of your imports
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export default function LoginForm() {
  const router = useRouter();

  // Animation states
  const [showAnimation, setShowAnimation] = useState(false);

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Phone auth states
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationId, setVerificationId] = useState(null);

  // Refs
  const recaptchaWrapperRef = useRef(null);

  // Initialize animation on page load
  useEffect(() => {
    setShowAnimation(true);
  }, []);

  // Clear recaptcha when component unmounts or phone mode changes
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (error) {
          console.error("Error clearing recaptcha:", error);
        }
      }
    };
  }, []);

  // Initialize App Check for phone authentication
  useEffect(() => {
    // Only run on client side and only once
    if (typeof window !== "undefined" && !window.appCheckInitialized) {
      try {
        // Initialize App Check with your reCAPTCHA v3 site key
        const appCheck = initializeAppCheck(auth.app, {
          provider: new ReCaptchaV3Provider(
            "6LevS_cqAAAAACsL-4-oGdF77yLu5gRf_2vQpXGI"
          ),
          isTokenAutoRefreshEnabled: true,
        });

        // Mark as initialized to prevent duplicate initialization
        window.appCheckInitialized = true;
        console.log("App Check initialized successfully");
      } catch (error) {
        console.error("Error initializing App Check:", error);
      }
    }
  }, []);
  // Inside your component
  useEffect(() => {
    // Initialize reCAPTCHA only once when component mounts
    if (isPhoneMode && !window.recaptchaVerifier) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          // Create a recaptchaVerifier instance directly with invisible size
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible", // Change to invisible for better UX
              callback: () => {
                // This callback is called when the reCAPTCHA is solved
                console.log("reCAPTCHA solved");
              },
            }
          );
        } catch (error) {
          console.error("Error initializing reCAPTCHA:", error);
          setErrorMessage(
            "Failed to initialize verification. Please refresh and try again."
          );
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isPhoneMode]);

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      // Update last login timestamp
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSuccessMessage("Login successful! Redirecting...");

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone verification
  const handleSendCode = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber, countryCode);

      if (!window.recaptchaVerifier) {
        throw new Error(
          "Verification system not initialized. Please refresh the page."
        );
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        window.recaptchaVerifier
      );

      setVerificationId(confirmationResult);
      setIsCodeSent(true);
      setSuccessMessage("Verification code sent to your phone!");
    } catch (error) {
      console.error("Error sending verification code:", error);
      setErrorMessage(`Failed to send code: ${error.message}`);

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing recaptcha after failure:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verificationId.confirm(verificationCode);
      const user = result.user;

      // Update or create user document
      await setDoc(
        doc(db, "users", user.uid),
        {
          phone: user.phoneNumber,
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSuccessMessage("Phone verified successfully! Redirecting...");

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage(
        `Verification failed: ${getAuthErrorMessage(error.code)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleForgotPassword = async () => {
    clearMessages();

    if (!email) {
      setErrorMessage("Please enter your email address first");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to initial state
  const resetPhoneFlow = () => {
    setIsCodeSent(false);
    setVerificationCode("");
    clearMessages();

    // Clear recaptcha if needed
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {
        console.error("Error clearing recaptcha on reset:", e);
      }
    }
  };

  // Toggle between email and phone login
  const toggleLoginMode = () => {
    clearMessages();
    resetPhoneFlow();
    setIsPhoneMode(!isPhoneMode);
  };

  // Utility functions
  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const validatePhoneNumber = (phone) => {
    return phone && phone.length >= 10;
  };

  const formatPhoneNumber = (phone, countryCode) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    return `${countryCode}${cleaned}`;
  };

  const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email address format";
      case "auth/user-disabled":
        return "This account has been disabled";
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/too-many-requests":
        return "Too many unsuccessful login attempts. Please try again later";
      case "auth/invalid-phone-number":
        return "The phone number is invalid";
      case "auth/invalid-verification-code":
        return "The verification code is invalid";
      case "auth/code-expired":
        return "The verification code has expired";
      case "auth/missing-verification-code":
        return "Please enter the verification code";
      case "auth/captcha-check-failed":
        return "reCAPTCHA verification failed. Please try again";
      default:
        return "An error occurred during authentication. Please try again";
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background with overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2187&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Animated gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-900/90 via-pink-800/80 to-pink-900/90"></div>

      {/* Floating animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-20 animate-float-slow">
          <ShoppingBag size={80} className="text-white" />
        </div>
        <div className="absolute top-40 right-20 opacity-20 animate-float-medium">
          <User size={100} className="text-white" />
        </div>
        <div className="absolute bottom-40 left-20 opacity-20 animate-float-fast">
          <Heart size={60} className="text-white" />
        </div>
        <div className="absolute bottom-60 right-10 opacity-20 animate-float-medium">
          <Star size={90} className="text-white" />
        </div>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ${
          showAnimation
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-pink-200 mt-2">Sign in to access your account</p>
        </div>

        <Card className="w-full backdrop-blur-md bg-white/95 shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-pink-700 p-6">
            <CardTitle className="text-3xl font-bold text-center text-white flex items-center justify-center">
              <User className="mr-3 h-8 w-8" />
              {isPhoneMode ? "Phone Login" : "Account Login"}
            </CardTitle>
            <CardDescription className="text-center text-pink-100 mt-2">
              {isPhoneMode
                ? "Sign in with your phone number"
                : "Sign in with your email and password"}
            </CardDescription>
          </div>

          <CardContent className="p-8">
            {errorMessage && (
              <Alert
                variant="destructive"
                className="mb-6 bg-red-50 border-red-200"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {isPhoneMode ? (
              // Phone authentication form
              <form
                onSubmit={isCodeSent ? handleVerifyCode : handleSendCode}
                className="space-y-6"
              >
                {!isCodeSent ? (
                  // Phone number input
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">
                        Phone Number
                      </Label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-24 p-2 border border-pink-200 rounded-md focus:border-pink-400 focus:ring-pink-400"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+61">+61</option>
                        </select>
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-pink-500" />
                          </div>
                          <Input
                            id="phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              setPhoneNumber(e.target.value.replace(/\D/g, ""));
                              clearMessages();
                            }}
                            className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                            placeholder="Enter your phone number"
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* reCAPTCHA container - critical for phone auth */}
                    <div
                      id="recaptcha-container"
                      ref={recaptchaWrapperRef}
                      className="flex justify-center my-4"
                    ></div>

                    <Button
                      type="submit"
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Code...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Send Verification Code</span>
                          <ArrowRight className="ml-2" />
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  // Verification code input
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="verificationCode"
                        className="flex items-center text-gray-700"
                      >
                        <Shield className="h-4 w-4 mr-2 text-pink-500" />
                        Verification Code
                      </Label>
                      <Input
                        id="verificationCode"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          );
                          clearMessages();
                        }}
                        className="text-center text-xl tracking-wider border-pink-200 focus:border-pink-400 focus:ring-pink-400 py-6 font-medium"
                        placeholder="Enter 6-digit code"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        We've sent a 6-digit code to {countryCode} {phoneNumber}
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Verify Code</span>
                          <Shield className="ml-2 h-4 w-4" />
                        </div>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2 border-pink-200 text-pink-700 hover:bg-pink-50"
                      onClick={resetPhoneFlow}
                    >
                      Try Different Number
                    </Button>
                  </div>
                )}
              </form>
            ) : (
              // Email/Password login form
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-pink-500" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearMessages();
                        }}
                        className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-pink-500" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearMessages();
                        }}
                        className="pl-10 pr-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-pink-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-pink-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-pink-600 hover:text-pink-800"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Sign In to Your Account</span>
                      <ArrowRight className="ml-2" />
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="px-8 py-4 flex flex-col space-y-4 items-center border-t border-pink-100 bg-pink-50/80 rounded-b-lg">
            <button
              onClick={toggleLoginMode}
              className="text-pink-600 hover:text-pink-800 flex items-center text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {isPhoneMode
                ? "Sign in with email instead"
                : "Sign in with phone instead"}
            </button>
            <p className="text-xs text-pink-600 text-center">
              Secure login protected with advanced encryption
            </p>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-white/80 text-sm">
          <p>
            Don't have an account?{" "}
            <Link href="/register" className="text-white underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>

      {/* Add animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
