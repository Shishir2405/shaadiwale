// app/dashboard/approvals/page.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const ApprovalsPage = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "approvals"));
        const approvals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPendingApprovals(approvals);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const handleApproval = async (id, status) => {
    try {
      await updateDoc(doc(db, "approvals", id), { status });
      toast.success(`Item ${status === 'approved' ? 'approved' : 'rejected'}`);
      // Refresh list
      setPendingApprovals(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error:', error);
      toast.error('Action failed');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Approvals</h1>
      
      <div className="space-y-4">
        {pendingApprovals.map(item => (
          <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{item.type}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <div className="space-x-2">
              <Button 
                onClick={() => handleApproval(item.id, 'approved')}
                variant="outline"
                className="bg-green-50 hover:bg-green-100"
              >
                Approve
              </Button>
              <Button 
                onClick={() => handleApproval(item.id, 'rejected')}
                variant="outline"
                className="bg-red-50 hover:bg-red-100"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalsPage;