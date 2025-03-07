"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import AdForm from "@/components/AdForm/AdForm";

export default function EditAdvertisement() {
  const params = useParams();
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if user is not logged in and auth is finished loading
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchAd = async () => {
      if (authLoading || !user) return;
      if (!params.id) {
        router.push("/dashboard/advertise");
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, "advertisements", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const adData = docSnap.data();

          // Verify that this ad belongs to the current user
          if (adData.userId !== user.uid) {
            setError("You don't have permission to edit this advertisement");
            setTimeout(() => router.push("/dashboard/advertise"), 3000);
            return;
          }

          setAd({
            id: docSnap.id,
            ...adData,
          });
        } else {
          setError("Advertisement not found");
          setTimeout(() => router.push("/dashboard/advertise"), 3000);
        }
      } catch (err) {
        console.error("Error fetching advertisement:", err);
        setError("Failed to load advertisement");
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [params.id, router, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/dashboard/advertise"
            className="text-pink-500 hover:text-pink-700 transition-colors"
          >
            Return to advertisement list
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-4xl mx-auto my-8">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>You must be logged in to edit advertisements</span>
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
            Edit Advertisement
          </h1>
        </div>
        <p className="text-gray-600 ml-8">Update your advertisement details</p>
      </div>

      {ad && <AdForm adData={ad} isEditing={true} />}
    </div>
  );
}
