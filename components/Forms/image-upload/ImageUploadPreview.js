"use client"
import React, { useState } from 'react';
import { UserCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';

const ImageUploadPreview = ({ userId, onContinue }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateImageUrl = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

  const handleImageUpload = async () => {
    if (!imageUrl || !userId) return;

    if (!validateImageUrl(imageUrl)) {
      toast({
        title: "Invalid Image URL",
        description: "Please enter a valid image URL (jpeg, jpg, gif, png)",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      
      // First get existing user data
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      // Prepare new photos object maintaining any existing photos
      const updatedPhotos = {
        ...userData?.photos,
        profile: {
          url: imageUrl,
          uploadedAt: new Date().toISOString(),
          isMain: true,
          updatedBy: userId
        }
      };

      await updateDoc(userRef, {
        photos: updatedPhotos
      });

      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });

      if (onContinue) onContinue(imageUrl);
      
    } catch (error) {
      console.error('Error updating photo:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto bg-white shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-8">
          <div 
            className={`w-48 h-48 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border-4 transition-all duration-300 ${
              isHovered ? 'border-[#e71c5d] scale-105' : 'border-gray-200'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            ) : (
              <UserCircle className={`w-32 h-32 transition-colors duration-300 ${
                isHovered ? 'text-[#e71c5d]' : 'text-gray-400'
              }`} />
            )}
          </div>
          
          <div className="w-full space-y-3">
            <label className="block text-base font-semibold text-gray-800">
              Profile Image URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL here"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e71c5d] focus:border-[#e71c5d] transition-all duration-300 outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <p className="text-sm text-gray-500 ml-1">
              Supported formats: JPG, JPEG, PNG, GIF
            </p>
          </div>

          <button
            onClick={handleImageUpload}
            disabled={!imageUrl || isLoading}
            className="w-full px-6 py-3.5 bg-[#e71c5d] text-white rounded-lg font-medium text-lg
              transform transition-all duration-300
              hover:bg-[#d41a54] hover:shadow-md hover:-translate-y-0.5
              focus:outline-none focus:ring-2 focus:ring-[#e71c5d] focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
              flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload & Continue'
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadPreview;