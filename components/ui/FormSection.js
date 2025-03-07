'use client';

import React from 'react';

const FormSection = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-pink-50 rounded-lg">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

export default FormSection;