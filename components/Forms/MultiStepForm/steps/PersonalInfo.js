import React from "react";
import { FormSection } from "../components/FormSection";
import {
  CASTES,
  SUB_CASTES,
  LANGUAGES,
  STATES,
  CITIES,
} from "../constants/formConstant";

export const PersonalInfo = ({ formData, handleInputChange }) => {
  // Function to get cities based on selected state
  const getCitiesForState = (state) => {
    return state && CITIES[state] ? CITIES[state] : [];
  };

  // Function to capitalize first letter
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <FormSection title="Personal Information">
      <select
        name="gender"
        value={formData.gender || ""}
        onChange={handleInputChange}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Gender *</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <input
        type="date"
        name="dateOfBirth"
        value={formData.dateOfBirth || ""}
        onChange={handleInputChange}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />

      <select
        name="religion"
        value={formData.religion || ""}
        onChange={handleInputChange}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Religion *</option>
        {Object.keys(CASTES).map((religion) => (
          <option key={religion} value={religion}>
            {capitalize(religion)}
          </option>
        ))}
      </select>

      <select
        name="caste"
        value={formData.caste || ""}
        onChange={handleInputChange}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={!formData.religion}
      >
        <option value="">Select Caste *</option>
        {formData.religion &&
          CASTES[formData.religion]?.map((caste) => (
            <option key={caste} value={caste}>
              {caste}
            </option>
          ))}
      </select>

      <div className="col-span-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name="willingToMarryOtherCaste"
            checked={formData.willingToMarryOtherCaste || false}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Willing to Marry Outside Caste</span>
        </label>
      </div>

      {/* Only show sub-caste if available for selected caste */}
      {SUB_CASTES[formData.caste] && (
        <select
          name="subCaste"
          value={formData.subCaste || ""}
          onChange={handleInputChange}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Sub-Caste</option>
          {SUB_CASTES[formData.caste].map((subCaste) => (
            <option key={subCaste} value={subCaste}>
              {subCaste}
            </option>
          ))}
        </select>
      )}

      <select
        name="motherTongue"
        value={formData.motherTongue || ""}
        onChange={handleInputChange}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Mother Tongue *</option>
        {LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="countryLivingIn"
        value={formData.countryLivingIn || "India"}
        onChange={handleInputChange}
        placeholder="Enter Country of Residence"
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
      
      
      <select
        name="residingState"
        value={formData.residingState || ""}
        onChange={handleInputChange}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select State *</option>
        {STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <select
        name="residingCity"
        value={formData.residingCity || ""}
        onChange={handleInputChange}
        className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        disabled={!formData.residingState}
      >
        <option value="">Select City</option>
        {getCitiesForState(formData.residingState).map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </FormSection>
  );
};
