import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const AnimatedLogo = () => {
  return (
    <div className="relative overflow-hidden h-10 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        {/* Heart Icon with proper fill */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{
            scale: [0.9, 1, 0.9],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative flex items-center justify-center"
        >
          {/* This is a colored background for the heart */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full opacity-20" />

          {/* Actual heart icon with fill */}
          <Heart
            size={24}
            className="text-pink-500"
            fill="#e71c5d"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Logo Text */}
        <motion.div
          className="font-bold text-xl tracking-wide uppercase"
          style={{
            background: "linear-gradient(90deg, #ff3399, #9c27b0)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          SHADIWALE
        </motion.div>
      </div>

      {/* Animated Underline */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default AnimatedLogo;
