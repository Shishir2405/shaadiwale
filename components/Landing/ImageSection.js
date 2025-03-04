import React from "react";
import InteractiveContent from "./InteractiveContent";

const MatrimonySplitSection = () => {
  const images = [
    "https://www.thestatesman.com/wp-content/uploads/2020/02/QT-O4-9.jpg", // Indian wedding
    "https://images.unsplash.com/photo-1654156577076-e0350ba86cc1?q=80&w=2640&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Ceremony
    "https://plus.unsplash.com/premium_photo-1698500034542-0ac2a1aede25?q=80&w=2788&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Couple
    "https://images.unsplash.com/photo-1601482438629-346a273776af?q=80&w=2811&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Celebration
    "https://images.unsplash.com/photo-1567878673047-0451c851056e?q=80&w=2835&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Traditional
  ];

  return (
    <div className="relative flex h-screen">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2% 5%, rgba(255, 182, 255, 0.15) 0%, transparent 25%),
                           radial-gradient(circle at 98% 85%, rgba(189, 182, 255, 0.15) 0%, transparent 25%),
                           radial-gradient(circle at 50% 50%, rgba(255, 182, 212, 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex w-full">
        {/* Left Content Section */}
        <InteractiveContent />

        {/* Right Image Gallery Section */}
        <section className="w-full lg:w-1/2 flex-col justify-center hidden min-[940px]:flex pb-8">
          <div className="relative h-[500px] xl:h-[600px] p-8 grid grid-cols-3 gap-4">
            {/* First Row */}
            <div className="col-span-2 relative overflow-hidden rounded-lg group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={images[0]}
                alt="Wedding Ceremony"
                className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={images[1]}
                alt="Traditional Ceremony"
                className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
              />
            </div>

            {/* Second Row */}
            <div className="relative overflow-hidden rounded-lg group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={images[2]}
                alt="Happy Couple"
                className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={images[3]}
                alt="Celebration"
                className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
              />
            </div>
            <div className="relative overflow-hidden rounded-lg group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src={images[4]}
                alt="Wedding Traditions"
                className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
              />
            </div>

            {/* Gradient Lines */}
            <div className="absolute top-3 w-40 h-1 bg-gradient-to-tr from-red-600 to-[#e71c5d] rounded-md z-10" />
            <div className="absolute bottom-0 right-8 w-40 h-1 bg-gradient-to-tr from-red-600 to-[#e71c5d] rounded-md z-10" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default MatrimonySplitSection;
