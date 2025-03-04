"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Trash2, Upload, Loader2 } from 'lucide-react';

const BrandingSettings = () => {
  const [settings, setSettings] = useState({
    favicon: '',
    logo: '',
    mobileLogo: '',
    // Store storage paths separately from URLs
    storagePaths: {
      favicon: '',
      logo: '',
      mobileLogo: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    favicon: false,
    logo: false,
    mobileLogo: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "siteSettings", "branding");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          favicon: data.favicon || '',
          logo: data.logo || '',
          mobileLogo: data.mobileLogo || '',
          storagePaths: data.storagePaths || {
            favicon: '',
            logo: '',
            mobileLogo: ''
          }
        });
      }
    };
    fetchSettings();
  }, []);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadProgress(prev => ({ ...prev, [type]: true }));

    try {
      // Create a storage path for the new file
      const storagePath = `branding/${type}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Upload the new file
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Delete old file if it exists
      if (settings.storagePaths[type]) {
        try {
          const oldImageRef = ref(storage, settings.storagePaths[type]);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Update settings with new URL and storage path
      setSettings(prev => ({
        ...prev,
        [type]: downloadURL,
        storagePaths: {
          ...prev.storagePaths,
          [type]: storagePath
        }
      }));

      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to upload ${type}`);
    }

    setUploadProgress(prev => ({ ...prev, [type]: false }));
  };

  const handleDeleteImage = async (type) => {
    if (!settings.storagePaths[type]) return;

    try {
      const imageRef = ref(storage, settings.storagePaths[type]);
      await deleteObject(imageRef);
      
      setSettings(prev => ({
        ...prev,
        [type]: '',
        storagePaths: {
          ...prev.storagePaths,
          [type]: ''
        }
      }));
      
      toast.success(`${type} deleted successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save both URLs and storage paths to Firestore
      const dataToSave = {
        favicon: settings.favicon,
        logo: settings.logo,
        mobileLogo: settings.mobileLogo,
        storagePaths: settings.storagePaths
      };
      
      await setDoc(doc(db, "siteSettings", "branding"), dataToSave);
      toast.success('Branding settings updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update settings');
    }
    setLoading(false);
  };

  const ImageUploadField = ({ type, label }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, type)}
            className="hidden"
            id={`${type}-upload`}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById(`${type}-upload`).click()}
            disabled={uploadProgress[type]}
          >
            {uploadProgress[type] ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload {label}
          </Button>
          {settings[type] && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteImage(type)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        {settings[type] && (
          <div className="relative group">
            <img
              src={settings[type]}
              alt={`${label} Preview`}
              className={`mt-2 ${type === 'favicon' ? 'w-8 h-8' : 'h-20 object-contain'}`}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update Favicon & Logo</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUploadField type="favicon" label="Favicon" />
        <ImageUploadField type="logo" label="Logo" />
        <ImageUploadField type="mobileLogo" label="Mobile Logo" />

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </div>
  );
};

export default BrandingSettings;