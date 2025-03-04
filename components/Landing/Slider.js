"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SearchComponent from "./SearchComponent";

const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fallback images in case Firebase data isn't available
  const fallbackImages = [
    "https://images.unsplash.com/photo-1621801306185-8c0ccf9c8eb8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1659653928209-e9a7d09abb87?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1682092597591-81f59c80d9ec?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  // Fetch banners from Firebase
  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "siteSettings", "banners");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().items?.length > 0) {
          // Filter out banners without images
          const validBanners = docSnap.data().items.filter(banner => banner.imageUrl);
          if (validBanners.length > 0) {
            setBanners(validBanners);
          } else {
            // Use fallback if no valid banners found
            setBanners(fallbackImages.map(url => ({ imageUrl: url, title: '', description: '', link: '' })));
          }
        } else {
          // Use fallback if no banners found
          setBanners(fallbackImages.map(url => ({ imageUrl: url, title: '', description: '', link: '' })));
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        // Use fallback on error
        setBanners(fallbackImages.map(url => ({ imageUrl: url, title: '', description: '', link: '' })));
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // 5 seconds per slide
    
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  if (loading) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  // If no banners despite our fallbacks, return a simple message
  if (banners.length === 0) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center bg-gray-100">
        <div className="text-center px-4">
          <p className="text-2xl font-semibold text-gray-700">No banners available</p>
          <p className="mt-2 text-gray-500">Please add banners in the admin dashboard.</p>
        </div>
        <SearchComponent />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Image Slider */}
      <div className="relative h-[70%]">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Banner Image */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${banner.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Banner Content - Only show if title or description exists */}
            {(banner.title || banner.description) && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center max-w-3xl px-6">
                 
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Controls */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-8 z-20">
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800 group-hover:text-black" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/80 shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-800 group-hover:text-black" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Search Component */}
      <SearchComponent />
    </div>
  );
};

export default Hero;