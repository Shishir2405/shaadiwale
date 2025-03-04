"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, EyeOffIcon, Mail, Lock, Loader2, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  signInWithEmail,
  validatePhoneNumber,
  formatPhoneNumber,
  getAuthErrorMessage,
} from "./auth-utils";

// Initialize Firestore
const db = getFirestore();

// Background components remain the same...
const FloatingBubbles = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-r from-pink-100 to-purple-100"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          scale: 0,
        }}
        animate={{
          x: [
            Math.random() * window.innerWidth,
            Math.random() * window.innerWidth,
          ],
          y: [
            Math.random() * window.innerHeight,
            Math.random() * window.innerHeight,
          ],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={{
          width: Math.random() * 300 + 100,
          height: Math.random() * 300 + 100,
          filter: "blur(60px)",
          opacity: 0.4,
        }}
      />
    ))}
  </div>
);

// Interactive gradient background component
const InteractiveBackground = () => (
  <div className="fixed inset-0 -z-20">
    <div className="w-full h-full bg-gradient-to-br from-pink-50 via-purple-50 to-white" />
  </div>
);

const LoginForm = () => {
  const router = useRouter();

  // States for email/password login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // States for phone login
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const recaptchaContainerRef = useRef(null);

  // Initialize reCAPTCHA when phone dialog opens
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isPhoneDialogOpen &&
      !recaptchaVerifier
    ) {
      // Clear existing instances
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      const verifierDiv = recaptchaContainerRef.current;
      if (!verifierDiv) return;

      try {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "normal",
          callback: () => {
            setErrorMessage("");
          },
          "expired-callback": () => {
            setErrorMessage("reCAPTCHA expired. Please try again.");
          },
        });

        verifier.render().then(() => {
          setRecaptchaVerifier(verifier);
        });

        return () => {
          if (verifier) {
            verifier.clear();
            setRecaptchaVerifier(null);
          }
        };
      } catch (error) {
        console.error("reCAPTCHA initialization error:", error);
        setErrorMessage("Failed to initialize phone authentication.");
      }
    }
  }, [isPhoneDialogOpen]);

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
      const { user, userData } = await signInWithEmail(email, password);

      if (!user.emailVerified) {
        setErrorMessage("Please verify your email before logging in");
        return;
      }

      setSuccessMessage("Login successful! Redirecting...");

      // Update last login timestamp
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone number verification
  const handleSendCode = async () => {
    clearMessages();

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage("Please enter a valid phone number");
      return;
    }

    if (!recaptchaVerifier) {
      setErrorMessage("Please wait for the verification system to load");
      return;
    }

    setIsLoading(true);
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber, countryCode);

      // Check if phone number exists in any user document
      const userSnapshot = await getDocs(
        query(collection(db, "users"), where("phone", "==", phoneNumber))
      );

      if (userSnapshot.empty) {
        setErrorMessage("No account found with this phone number");
        return;
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        recaptchaVerifier
      );

      setVerificationId(confirmationResult);
      setIsCodeSent(true);
      setSuccessMessage("Verification code sent!");
    } catch (error) {
      console.error("Error sending code:", error);
      setErrorMessage(getAuthErrorMessage(error.code));

      // Reset reCAPTCHA on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyCode = async () => {
    clearMessages();

    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage("Please enter a valid verification code");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verificationId.confirm(verificationCode);
      const user = result.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }

      // Update last login
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSuccessMessage("Phone verified! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage(getAuthErrorMessage(error.code));
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

  // Utility functions
  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDialogClose = () => {
    setIsPhoneDialogOpen(false);
    setIsCodeSent(false);
    setPhoneNumber("");
    setVerificationCode("");
    clearMessages();

    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
  };

  // JSX remains mostly the same as your original component...
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <InteractiveBackground />
      <FloatingBubbles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card Component */}
        <Card className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-xl shadow-xl rounded-xl border-purple-100">
          {/* Header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please sign in to continue
            </p>
          </motion.div>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {errorMessage}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    focusedInput === "email"
                      ? "text-purple-500"
                      : "text-gray-400"
                  }`}
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearMessages();
                  }}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  className="pl-10 border-purple-100 focus:border-purple-300"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    focusedInput === "password"
                      ? "text-purple-500"
                      : "text-gray-400"
                  }`}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearMessages();
                  }}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  className="pl-10 border-purple-100 focus:border-purple-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500"
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-purple-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Phone Authentication Dialog */}
          <div className="space-y-3">
            <Dialog
              open={isPhoneDialogOpen}
              onOpenChange={(open) => {
                if (!open) handleDialogClose();
                else setIsPhoneDialogOpen(true);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-purple-100 hover:bg-purple-50"
                  onClick={() => {
                    setIsPhoneDialogOpen(true);
                    clearMessages();
                  }}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Login with Phone
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-purple-600">
                    Phone Authentication
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {!isCodeSent ? (
                    <>
                      {/* Country Code and Phone Input */}
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-24 p-2 border border-purple-100 rounded-md focus:border-purple-300 focus:outline-none"
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          {/* Add more country codes as needed */}
                        </select>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value.replace(/\D/g, ""));
                            clearMessages();
                          }}
                          className="flex-1 border-purple-100"
                          maxLength={10}
                        />
                      </div>

                      {/* ReCAPTCHA Container */}
                      <div
                        id="recaptcha-container"
                        ref={recaptchaContainerRef}
                        className="flex justify-center"
                      />

                      {/* Send Code Button */}
                      <Button
                        onClick={handleSendCode}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Send Code"
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Verification Code Input */}
                      <Input
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          );
                          clearMessages();
                        }}
                        maxLength={6}
                        className="text-center text-lg tracking-wider border-purple-100"
                      />

                      {/* Verify Code Button */}
                      <Button
                        onClick={handleVerifyCode}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Verify Code"
                        )}
                      </Button>

                      {/* Try Different Number Button */}
                      <Button
                        variant="outline"
                        className="w-full border-purple-100 hover:bg-purple-50"
                        onClick={() => {
                          setIsCodeSent(false);
                          setVerificationCode("");
                          clearMessages();
                          if (recaptchaVerifier) {
                            recaptchaVerifier.clear();
                            setRecaptchaVerifier(null);
                          }
                        }}
                        disabled={isLoading}
                      >
                        Try Different Number
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-purple-600 hover:text-purple-700 hover:underline"
            >
              Register here
            </a>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
