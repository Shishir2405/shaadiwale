"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import AdForm from "@/components/AdForm/AdForm";

export default function CreateAdvertisement() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // Redirect if user is not logged in and auth is finished loading
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-4xl mx-auto my-8">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>You must be logged in to create advertisements</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link
            href="/dashboard/advertise"
            className="mr-3 text-gray-500 hover:text-pink-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Create New Advertisement
          </h1>
        </div>
        <p className="text-gray-600 ml-8">
          Fill in the details to create your advertisement
        </p>
      </div>

      <AdForm isEditing={false} />
    </div>
  );
}
