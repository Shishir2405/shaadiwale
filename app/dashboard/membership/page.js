// app/dashboard/membership/page.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MembershipCards from '@/components/Landing/MembershipCards';
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil } from "lucide-react";
import { useRouter } from 'next/navigation';

const MembershipPage = () => {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "membershipPlans"));
        const plansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlans(plansData);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleAddNew = () => {
    router.push('/dashboard/membership/add');
  };

  const handleEdit = (planId) => {
    router.push(`/dashboard/membership/edit/${planId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-red-600 mb-4">Error loading plans</p>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Membership Plans</h1>
      </div>
      <MembershipCards 
        plans={plans} 
        isAdmin={true}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default MembershipPage;
