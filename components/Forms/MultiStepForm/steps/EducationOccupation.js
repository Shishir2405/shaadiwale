import React from 'react';
import { FormSection } from "../components/FormSection";
import { DEGREES, OCCUPATIONS } from "../constants/formConstant";
import { RadioGroup } from "../components/RadioGroup";

export const EducationOccupation = ({ formData, handleInputChange }) => (
  <FormSection title="Education & Occupation">
    <div className="space-y-2">
      <label htmlFor="highestEducation" className="block text-sm font-medium text-gray-700">
        Highest Education *
      </label>
      <select
        id="highestEducation"
        name="highestEducation"
        value={formData.highestEducation || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Highest Education</option>
        {DEGREES.map(degree => (
          <option key={degree} value={degree}>{degree}</option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <label htmlFor="additionalDegree" className="block text-sm font-medium text-gray-700">
        Additional Degree
      </label>
      <select
        id="additionalDegree"
        name="additionalDegree"
        value={formData.additionalDegree || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Additional Degree</option>
        {DEGREES.map(degree => (
          <option key={degree} value={degree}>{degree}</option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
        Occupation *
      </label>
      <select
        id="occupation"
        name="occupation"
        value={formData.occupation || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Occupation</option>
        {OCCUPATIONS.map(occupation => (
          <option key={occupation} value={occupation}>{occupation}</option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700">
        Annual Income *
      </label>
      <input
        id="annualIncome"
        type="text"
        name="annualIncome"
        value={formData.annualIncome || ''}
        onChange={handleInputChange}
        placeholder="e.g., ₹10 LPA"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>

    <div className="col-span-2">
      <RadioGroup
        name="employedIn"
        value={formData.employedIn || ''}
        onChange={handleInputChange}
        label="Employed In *"
        options={[
          { value: 'private', label: 'Private' },
          { value: 'government', label: 'Government' },
          { value: 'business', label: 'Business' },
          { value: 'freelance', label: 'Freelance' }
        ]}
      />
    </div>
  </FormSection>
);