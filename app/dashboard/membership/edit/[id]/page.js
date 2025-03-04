"use client"
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Diamond, Crown, Gem, Star, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";

const EditMembershipPlan = ({ params }) => {
  const router = useRouter();
  const id = React.use(params).id;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    duration: '',
    description: '',
    features: [''],
    icon: 'Star',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-700',
    featured: false
  });

  const icons = {
    Star: Star,
    Crown: Crown,
    Diamond: Diamond,
    Gem: Gem
  };

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const docRef = doc(db, 'membershipPlans', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            ...data,
            price: data.price.toString(),
            duration: data.duration.toString()
          });
        } else {
          toast.error('Membership plan not found');
          router.push('/dashboard/membership');
        }
      } catch (error) {
        console.error('Error fetching plan:', error);
        toast.error('Failed to fetch membership plan');
      }
    };

    fetchPlan();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanFeatures = formData.features.filter(feature => feature.trim() !== '');

      const membershipData = {
        title: formData.title,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        description: formData.description,
        features: cleanFeatures,
        icon: formData.icon,
        gradientFrom: formData.gradientFrom,
        gradientTo: formData.gradientTo,
        featured: formData.featured,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'membershipPlans', id), membershipData);
      
      toast.success('Membership plan updated successfully!');
      router.push('/dashboard/membership');
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error(error.message || 'Failed to update membership plan');
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Membership Plan</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label>Price (₹)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
            required
            disabled={isLoading}
            min="0"
          />
        </div>

        <div>
          <Label>Duration (in months)</Label>
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
            required
            disabled={isLoading}
            min="1"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label>Features</Label>
          {formData.features.map((feature, index) => (
            <div key={index} className="mt-2">
              <Input
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...formData.features];
                  newFeatures[index] = e.target.value;
                  setFormData(prev => ({...prev, features: newFeatures}));
                }}
                required
                disabled={isLoading}
                placeholder={`Feature ${index + 1}`}
              />
            </div>
          ))}
          <Button 
            type="button" 
            onClick={addFeature} 
            className="mt-2"
            variant="outline"
            disabled={isLoading}
          >
            Add Feature
          </Button>
        </div>

        <div>
          <Label>Icon</Label>
          <select
            className="w-full p-2 border rounded"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({...prev, icon: e.target.value}))}
            disabled={isLoading}
          >
            {Object.keys(icons).map(icon => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Gradient From</Label>
          <select
            className="w-full p-2 border rounded"
            value={formData.gradientFrom}
            onChange={(e) => setFormData(prev => ({...prev, gradientFrom: e.target.value}))}
            disabled={isLoading}
          >
            <option value="from-blue-500">Blue</option>
            <option value="from-pink-500">Pink</option>
            <option value="from-purple-500">Purple</option>
            <option value="from-amber-500">Amber</option>
            <option value="from-green-500">Green</option>
          </select>
        </div>

        <div>
          <Label>Gradient To</Label>
          <select
            className="w-full p-2 border rounded"
            value={formData.gradientTo}
            onChange={(e) => setFormData(prev => ({...prev, gradientTo: e.target.value}))}
            disabled={isLoading}
          >
            <option value="to-blue-700">Blue</option>
            <option value="to-pink-700">Pink</option>
            <option value="to-purple-700">Purple</option>
            <option value="to-amber-700">Amber</option>
            <option value="to-green-700">Green</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({...prev, featured: e.target.checked}))}
            className="mr-2"
            disabled={isLoading}
          />
          <Label>Featured Plan</Label>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Plan...
            </>
          ) : (
            'Update Membership Plan'
          )}
        </Button>
      </form>
    </div>
  );
};

export default EditMembershipPlan;