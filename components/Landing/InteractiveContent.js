import React from 'react';
import { Video, PhoneCall, Clock } from 'lucide-react';

const InteractiveContent = () => {
  return (
    <section className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-12">
      {/* Header Section */}
      <div className="mb-12">
        <h2 className="text-gray-500 uppercase tracking-wider text-sm mb-4">
          MEET FROM HOME
        </h2>
        <h1 className="text-4xl font-bold mb-2">
          Impress them Over the{' '}
          <span className="text-red-500">Distance</span>
        </h1>
      </div>

      {/* Features Section */}
      <div className="space-y-12 ">
        {/* Match Hour Feature */}
        <div className="feature-block group cursor-pointer">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mr-4 shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3">
              <Clock className="w-6 h-6 text-red-500 transform transition-transform group-hover:-rotate-3" />
            </div>
            <div className="relative">
              <h3 className="text-xl font-semibold">Jeevansathi Match Hour</h3>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></div>
            </div>
          </div>
          <p className="text-gray-600 ml-16 transition-colors duration-300 group-hover:text-gray-800">
            Register to join an online event to connect with members of your community in a short time
          </p>
        </div>

        {/* Voice & Video Calling Feature */}
        <div className="feature-block group cursor-pointer">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mr-4 shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3">
              <PhoneCall className="w-6 h-6 text-red-500 transform transition-transform group-hover:-rotate-3" />
            </div>
            <div className="relative">
              <h3 className="text-xl font-semibold">Voice & Video Calling</h3>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></div>
            </div>
          </div>
          <p className="text-gray-600 ml-16 transition-colors duration-300 group-hover:text-gray-800">
            Enjoy secure conversations using our voice & video calling services without revealing your number
          </p>
        </div>

        {/* Video Profiles Feature */}
        <div className="feature-block group cursor-pointer">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mr-4 shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3">
              <Video className="w-6 h-6 text-red-500 transform transition-transform group-hover:-rotate-3" />
            </div>
            <div className="relative">
              <h3 className="text-xl font-semibold">Introducing Video Profiles</h3>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></div>
            </div>
          </div>
          <p className="text-gray-600 ml-16 transition-colors duration-300 group-hover:text-gray-800">
            Stand out amongst others and engage faster! Introduce yourself by adding a video to your profile
          </p>
        </div>
      </div>
    </section>
  );
};

export default InteractiveContent;