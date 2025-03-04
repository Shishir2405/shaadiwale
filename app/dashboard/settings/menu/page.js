// app/dashboard/settings/menu/page.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

const MenuSettings = () => {
  const [menuItems, setMenuItems] = useState({
    header: {
      search: true,
      matches: true,
      inbox: true,
      notifications: true,
      profile: true
    },
    footer: {
      about: true,
      contact: true,
      privacy: true,
      terms: true,
      careers: true,
      help: true
    },
    dashboard: {
      analytics: true,
      settings: true,
      preferences: true,
      payments: true,
      reports: true
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const docRef = doc(db, "siteSettings", "menuItems");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMenuItems(docSnap.data());
      }
    };
    fetchMenuItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "siteSettings", "menuItems"), menuItems);
      toast.success('Menu settings updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update settings');
    }
    setLoading(false);
  };

  const renderMenuGroup = (group, title) => (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">{title}</h3>
      {Object.entries(menuItems[group]).map(([item, enabled]) => (
        <div key={item} className="flex items-center justify-between">
          <Label className="capitalize">{item}</Label>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => 
              setMenuItems(prev => ({
                ...prev,
                [group]: { ...prev[group], [item]: checked }
              }))
            }
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enable/Disable Menu Items</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderMenuGroup('header', 'Header Menu')}
        {renderMenuGroup('footer', 'Footer Menu')}
        {renderMenuGroup('dashboard', 'Dashboard Menu')}

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default MenuSettings;