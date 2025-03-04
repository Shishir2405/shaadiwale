"use client"
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle,
  MessageCircle,
  Users,
  Star,
  Heart,
  Check,
  ArrowRight,
  Crown,
  Calendar,
  Shield,
  Clock,
  X,
} from "lucide-react";

const ExclusiveSection = () => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [activeFeature, setActiveFeature] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const features = [
    {
      image:
        "https://img.freepik.com/free-photo/couple-christmas-dinner_23-2147715636.jpg",
      icon: UserCircle,
      title: "Premium Matchmaking",
      description:
        "Our expert matchmakers personally curate compatible profiles based on your preferences",
      benefits: [
        "Dedicated relationship manager",
        "Personalized match suggestions",
        "Priority profile visibility",
      ],
      details:
        "Get matched with highly compatible partners through our AI-powered algorithm and human expertise",
    },
    {
      image:
        "https://img.freepik.com/free-photo/serious-young-businessman-showing-presentation-pc-tablet_1262-18054.jpg",
      icon: Star,
      title: "Elite Experience",
      description:
        "Enjoy exclusive benefits and premium features designed for serious relationship seekers",
      benefits: [
        "Background verification",
        "Video consultations",
        "Professional photoshoot",
      ],
      details:
        "Access exclusive events and get priority support from our elite matchmaking team",
    },
    {
      image:
        "https://img.freepik.com/free-photo/couple-eating-theme-park_23-2148011765.jpg",
      icon: Heart,
      title: "Offline Meetings",
      description:
        "We arrange face-to-face meetings with potential matches in a safe environment",
      benefits: [
        "Curated meetup venues",
        "Pre-arranged meetings",
        "Safety assured events",
      ],
      details:
        "Meet your matches in person at premium venues with complete privacy and security",
    },
  ];


  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-1 rounded-full text-sm font-medium mb-6"
          >
            PREMIUM SERVICE
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Exclusive
            <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Matchmaking
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience personalized matchmaking at its finest with our premium
            services
          </p>
        </motion.div>

        {/* Features Grid with Interactive Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="group relative"
              whileHover={{ y: -10 }}
            >
              {/* Image Card */}
              <div className="relative h-64 mb-8 rounded-2xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                <motion.img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <feature.icon className="w-16 h-16 text-white" />
                </motion.div>
              </div>

              {/* Content Card */}
              <motion.div
                className="bg-white p-8 rounded-2xl shadow-lg"
                whileHover={{
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <feature.icon className="w-6 h-6 text-red-500" />
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div className="space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2 text-gray-700"
                      whileHover={{ x: 5 }}
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFeature(feature)}
                  className="mt-6 text-red-500 font-medium flex items-center gap-2"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Pricing Section */}

      </div>
    </div>
  );
};

export default ExclusiveSection;
