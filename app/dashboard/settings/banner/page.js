"use client"

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Loader2, Eye, X, ChevronLeft, ChevronRight, Link as LinkIcon, FileWarning } from 'lucide-react';

const BannerSettings = () => {
  const [banners, setBanners] = useState([
    { imageUrl: '', title: '', description: '', link: '', storagePath: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      setFetchLoading(true);
      try {
        const docRef = doc(db, "siteSettings", "banners");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().items?.length > 0) {
          setBanners(docSnap.data().items);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        toast.error('Failed to load banners');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadProgress(prev => ({ ...prev, [index]: true }));

    try {
      const storagePath = `banners/banner_${index}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Delete old image if exists
      if (banners[index].storagePath) {
        try {
          const oldImageRef = ref(storage, banners[index].storagePath);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      handleBannerChange(index, 'imageUrl', downloadURL);
      handleBannerChange(index, 'storagePath', storagePath);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload image');
    }

    setUploadProgress(prev => ({ ...prev, [index]: false }));
  };

  const handleAddBanner = () => {
    setBanners([...banners, { imageUrl: '', title: '', description: '', link: '', storagePath: '' }]);
  };

  const handleRemoveBanner = async (index) => {
    if (banners[index].storagePath) {
      try {
        const imageRef = ref(storage, banners[index].storagePath);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    setBanners(banners.filter((_, i) => i !== index));
  };

  const handleBannerChange = (index, field, value) => {
    const newBanners = [...banners];
    newBanners[index][field] = value;
    setBanners(newBanners);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "siteSettings", "banners"), { items: banners });
      toast.success('Banners updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update banners');
    }
    setLoading(false);
  };

  const nextPreview = () => {
    setPreviewIndex((prev) => (prev + 1) % validPreviewBanners.length);
  };

  const prevPreview = () => {
    setPreviewIndex((prev) => 
      prev === 0 ? validPreviewBanners.length - 1 : prev - 1
    );
  };

  // Only show banners with images in the preview
  const validPreviewBanners = banners.filter(banner => banner.imageUrl);

  const BannerCard = ({ banner, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-6 bg-white rounded-lg space-y-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Banner {index + 1}
        </h3>
        {banners.length > 1 && (
          <Button 
            type="button" 
            variant="ghost"
            onClick={() => handleRemoveBanner(index)}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-gray-600">Banner Image</Label>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, index)}
                className="hidden"
                id={`banner-${index}-upload`}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full border border-gray-200 hover:border-gray-300 transition-colors"
                onClick={() => document.getElementById(`banner-${index}-upload`).click()}
                disabled={uploadProgress[index]}
              >
                {uploadProgress[index] ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Image
              </Button>
            </div>
            {banner.imageUrl ? (
              <div className="mt-4 relative group">
                <img 
                  src={banner.imageUrl} 
                  alt={`Banner ${index + 1}`} 
                  className="w-full h-40 object-cover rounded-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-md" />
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center h-40 bg-gray-100 rounded-md border border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <FileWarning className="w-8 h-8 mx-auto mb-2" />
                  <p>No image uploaded</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="text-gray-600">Title</Label>
          <Input
            value={banner.title}
            onChange={(e) => handleBannerChange(index, 'title', e.target.value)}
            className="border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            placeholder="Enter banner title"
          />
        </div>

        <div>
          <Label className="text-gray-600">Description</Label>
          <Textarea
            value={banner.description}
            onChange={(e) => handleBannerChange(index, 'description', e.target.value)}
            className="border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            placeholder="Enter banner description"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-gray-600">Link URL</Label>
          <div className="relative">
            <Input
              type="url"
              value={banner.link}
              onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
              className="border-gray-200 focus:border-gray-300 focus:ring-gray-200 pl-9"
              placeholder="https://example.com/page"
            />
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const BannerPreview = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-gray-900">Banner Preview</h2>
          <Button 
            onClick={() => setShowPreview(false)} 
            variant="ghost" 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {validPreviewBanners.length > 0 ? (
          <div className="relative">
            {/* Preview Slider */}
            <div className="relative h-[500px] overflow-hidden rounded-lg">
              {validPreviewBanners.map((banner, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === previewIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${banner.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  
                  {/* Banner Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center max-w-2xl px-6">
                      {banner.title && (
                        <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                          {banner.title}
                        </h3>
                      )}
                      {banner.description && (
                        <p className="text-xl text-white mb-6 drop-shadow-md">
                          {banner.description}
                        </p>
                      )}
                      {banner.link && (
                        <a 
                          href={banner.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-3 bg-white text-gray-900 font-medium rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          Learn More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Navigation Controls */}
              {validPreviewBanners.length > 1 && (
                <>
                  <button
                    onClick={prevPreview}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-lg z-10 hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextPreview}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-lg z-10 hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
              
              {/* Indicators */}
              {validPreviewBanners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {validPreviewBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPreviewIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === previewIndex ? "w-8 bg-white" : "bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Preview Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Previewing banner {previewIndex + 1} of {validPreviewBanners.length}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 bg-gray-50 rounded-lg">
            <FileWarning className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Banners to Preview</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              Upload at least one banner image to see a preview of how it will appear on your site.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (fetchLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">
            Home Page Banners
          </h1>
          <p className="text-gray-500 mt-1">
            Manage the banners that appear on your home page carousel
          </p>
        </div>
        <Button
          onClick={() => setShowPreview(true)}
          variant="outline"
          className="text-gray-700 hover:bg-gray-50"
          disabled={validPreviewBanners.length === 0}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {banners.map((banner, index) => (
            <BannerCard key={index} banner={banner} index={index} />
          ))}
        </AnimatePresence>

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={handleAddBanner}
            className="text-gray-700 hover:bg-gray-50"
          >
            Add Banner
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>

      <AnimatePresence>
        {showPreview && <BannerPreview />}
      </AnimatePresence>
    </div>
  );
};

export default BannerSettings;