"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import {
  getAuth,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const PhoneVerification = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sentOTP, setSentOTP] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid);
      } else {
        router.push("/login");
      }
    });

    // Setup reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            toast({
              title: "reCAPTCHA Expired",
              description: "Please solve the reCAPTCHA again",
              variant: "destructive",
            });
          },
        }
      );
    }

    return () => unsubscribe();
  }, [router]);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPhone(userData.countryCode + userData.phone);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        appVerifier
      );
      setConfirmationResult(confirmationResult);
      setSentOTP(true);

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phone}`,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          window.grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);

      await updateDoc(doc(db, "users", userId), {
        isPhoneVerified: true,
        phoneVerifiedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Phone number verified successfully!",
      });

      setTimeout(() => {
        router.push("/register");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px] mx-auto my-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#e71c5d]">
          Verify Your Phone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            value={phone}
            disabled
            className="w-full p-2 bg-gray-100"
          />
        </div>

        {!sentOTP && (
          <div className="space-y-4">
            <div id="recaptcha-container"></div>
            <button
              onClick={sendOTP}
              disabled={isLoading}
              className="w-full bg-[#e71c5d] text-white py-2 rounded-lg hover:bg-opacity-90 transition
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        )}

        {sentOTP && (
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={verifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-[#e71c5d] text-white py-2 rounded-lg hover:bg-opacity-90 transition
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneVerification;
