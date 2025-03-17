// File: /app/admin/terms-conditions/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import QuillPolicyEditor from "@/components/dashboard/Editor";
import { Loader2 } from "lucide-react";

export default function TermsConditionsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
     
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-pink-500" />
          <p className="mt-4 text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <QuillPolicyEditor
        policyType="termsConditions"
        policyTitle="Terms & Conditions"
      />
    </div>
  );
}
