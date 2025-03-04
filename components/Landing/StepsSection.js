import React from 'react';
import { Heart, Search, MessageCircle } from 'lucide-react';

const JourneySteps = () => {
  const steps = [
    {
      number: "01",
      icon: Heart,
      title: "Create Your Profile",
      description: "Tell us about yourself and what you're looking for in a partner",
      gradient: "from-pink-500 to-red-500"
    },
    {
      number: "02",
      icon: Search,
      title: "Discover Matches",
      description: "Explore curated matches based on your preferences",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      number: "03",
      icon: MessageCircle,
      title: "Start Connecting",
      description: "Begin your journey to finding the perfect match",
      gradient: "from-rose-500 to-pink-500"
    }
  ];

  return (
    <div className="relative">
      {/* Modern Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2% 5%, rgba(255, 182, 255, 0.15) 0%, transparent 25%),
                           radial-gradient(circle at 98% 85%, rgba(189, 182, 255, 0.15) 0%, transparent 25%),
                           radial-gradient(circle at 50% 50%, rgba(255, 182, 212, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Animated Header */}
          <div className="text-center mb-20 relative">
            <span className="block w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto mb-6" />
            <h2 className="text-sm font-semibold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 mb-4">
              START YOUR JOURNEY
            </h2>
            <h1 className="text-4xl md:text-5xl font-bold relative inline-block">
              <span className="relative z-5">Find Your Perfect Match</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-100 to-purple-100 blur-lg opacity-50 z-0" />
            </h1>
          </div>

          {/* Steps with 3D Effect */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative group perspective-1000">
                <div className={`
                  relative bg-white rounded-2xl p-8
                  transform transition-all duration-500
                  group-hover:rotate-y-12 group-hover:shadow-2xl
                  border border-transparent group-hover:border-pink-100
                `}>
                  {/* Floating Number */}
                  <div className={`
                    absolute -top-4 -right-4 w-12 h-12
                    bg-gradient-to-br ${step.gradient}
                    rounded-xl text-white flex items-center justify-center
                    transform transition-transform duration-500
                    group-hover:scale-110 group-hover:rotate-12
                  `}>
                    {step.number}
                  </div>

                  {/* Icon with Glow */}
                  <div className={`
                    relative w-16 h-16 mx-auto mb-6 rounded-xl
                    bg-gradient-to-r ${step.gradient}
                    flex items-center justify-center
                    transform transition-all duration-500
                    group-hover:scale-110
                  `}>
                    <div className="absolute inset-0 rounded-xl bg-white opacity-20 blur-lg" />
                    <step.icon className="w-8 h-8 text-white relative z-10" />
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Glowing CTA Button */}
          <div className="text-center mt-16">
            <button className="
              relative px-8 py-4 rounded-xl
              bg-gradient-to-r from-pink-500 to-purple-500
              text-white font-semibold
              transform transition-all duration-300
              hover:shadow-lg hover:-translate-y-1
              overflow-hidden group
            ">
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <span className="relative z-10">Begin Your Journey</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneySteps;