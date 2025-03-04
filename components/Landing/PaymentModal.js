"use client";
import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { doc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Payment Processing Component
export const PaymentModal = ({ isOpen, onClose, plan, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setLoading(true);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: plan.price * 100,
        currency: "INR",
        name: "Matrimony Platform",
        description: `${plan.title} Membership`,
        handler: async (response) => {
          await processMembershipPurchase(response);
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
        },
        theme: {
          color: "#EC4899"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Payment failed to initialize');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processMembershipPurchase = async (paymentResponse) => {
    try {
      const userRef = doc(db, 'users', userId);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      await updateDoc(userRef, {
        membershipPlan: plan.id,
        membershipStatus: 'active',
        membershipStartDate: new Date().toISOString(),
        membershipEndDate: endDate.toISOString(),
      });

      await addDoc(collection(db, 'payments'), {
        userId,
        planId: plan.id,
        amount: plan.price,
        paymentId: paymentResponse.razorpay_payment_id,
        status: 'success',
        createdAt: new Date().toISOString()
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to process payment');
      console.error('Payment processing error:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to {plan?.title}</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="p-4">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Plan Duration</span>
                <span className="font-medium">{plan?.duration} months</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-medium">₹{plan?.price}</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit Plan Modal Component
export const EditPlanModal = ({ isOpen, onClose, plan, onSave }) => {
  const [formData, setFormData] = useState(plan || {
    title: '',
    price: '',
    duration: '',
    description: '',
    features: [''],
    icon: 'Star',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    featured: false,
    active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'New Plan'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label>Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label>Price (₹)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  price: e.target.value
                }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label>Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                description: e.target.value
              }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label>Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features];
                    newFeatures[index] = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      features: newFeatures
                    }));
                  }}
                  placeholder="Enter feature"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      features: prev.features.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFeature}>
              Add Feature
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                featured: checked
              }))}
            />
            <label>Featured Plan</label>
          </div>
          <DialogFooter>
            <Button type="submit">
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};