// app/dashboard/settings/fields/page.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

const FieldsSettings = () => {
  const [fields, setFields] = useState({
    basicInfo: {
      name: true,
      email: true,
      phone: true,
      dob: true,
      gender: true,
      profilePhoto: true
    },
    personalInfo: {
      height: true,
      weight: true,
      bloodGroup: true,
      maritalStatus: true,
      physicalStatus: true
    },
    religiousInfo: {
      religion: true,
      caste: true,
      subCaste: true,
      star: true,
      rasi: true,
      dosh: true
    },
    professionalInfo: {
      education: true,
      occupation: true,
      income: true,
      workplace: true
    },
    familyInfo: {
      familyType: true,
      familyStatus: true,
      fatherOccupation: true,
      motherOccupation: true,
      siblings: true
    },
    locationInfo: {
      country: true,
      state: true,
      city: true,
      address: true
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFields = async () => {
      const docRef = doc(db, "siteSettings", "fields");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFields(docSnap.data());
      }
    };
    fetchFields();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "siteSettings", "fields"), fields);
      toast.success('Field settings updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update settings');
    }
    setLoading(false);
  };

  const renderFieldGroup = (group, title) => (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">{title}</h3>
      {Object.entries(fields[group]).map(([field, enabled]) => (
        <div key={field} className="flex items-center justify-between">
          <Label className="capitalize">
            {field.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => 
              setFields(prev => ({
                ...prev,
                [group]: { ...prev[group], [field]: checked }
              }))
            }
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enable/Disable Fields</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {renderFieldGroup('basicInfo', 'Basic Information')}
        {renderFieldGroup('personalInfo', 'Personal Information')}
        {renderFieldGroup('religiousInfo', 'Religious Information')}
        {renderFieldGroup('professionalInfo', 'Professional Information')}
        {renderFieldGroup('familyInfo', 'Family Information')}
        {renderFieldGroup('locationInfo', 'Location Information')}

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default FieldsSettings;





