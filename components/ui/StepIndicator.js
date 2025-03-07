'use client';

import React from 'react';

const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center space-x-2 mb-6">
    {[...Array(totalSteps)].map((_, index) => (
      <div
        key={index}
        className={`h-2 rounded-full transition-all duration-300 ${
          index === currentStep
            ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
            : "w-2 bg-gray-200"
        }`}
      />
    ))}
  </div>
);

export default StepIndicator;