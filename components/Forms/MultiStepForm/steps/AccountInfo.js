import React from 'react';
import { FormSection } from "../components/FormSection";

export const AccountInfo = ({ formData, handleInputChange }) => (
  <FormSection title="Account Information">
    <div className="space-y-2">
      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
        First Name *
      </label>
      <input
        id="firstName"
        type="text"
        name="firstName"
        value={formData.firstName || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
        Last Name *
      </label>
      <input
        id="lastName"
        type="text"
        name="lastName"
        value={formData.lastName || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email Address *
      </label>
      <input
        id="email"
        type="email"
        name="email"
        value={formData.email || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">
        Mobile Number *
      </label>
      <input
        id="mobileNo"
        type="tel"
        name="mobileNo"
        value={formData.mobileNo || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>
  </FormSection>
);