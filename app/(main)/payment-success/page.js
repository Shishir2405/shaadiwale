"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeftIcon, HomeIcon } from "lucide-react";

const PaymentSuccessPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-10 text-center">
        <div className="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-8">
          <Check className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          Payment Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Thank you for upgrading your membership. Your premium features are now
          active.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h2 className="font-medium text-gray-700 mb-3">
            Membership Details:
          </h2>
          <ul className="space-y-2 text-left">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>Your membership is now active</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>You now have access to all premium features</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <span>You can view your plan details in your profile</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Go Back
          </Button>

          <Button
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center gap-2"
            onClick={() => router.push("/")}
          >
            <HomeIcon className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
