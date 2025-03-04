import React from 'react';
import { FormSection } from "../components/FormSection";
import { RadioGroup } from "../components/RadioGroup";
import { RASHI, NAKSHATRAS } from "../constants/formConstant";

export const HoroscopeDetails = ({ formData, handleInputChange }) => (
  <FormSection title="Horoscope Details">
    <div className="col-span-2">
      <RadioGroup
        name="haveDosh"
        value={formData.haveDosh || ''}
        onChange={handleInputChange}
        label="Have Dosh? *"
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]}
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="star" className="block text-sm font-medium text-gray-700">
        Star (Nakshatra) *
      </label>
      <select
        id="star"
        name="star"
        value={formData.star || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Star</option>
        {NAKSHATRAS.map(nakshatra => (
          <option key={nakshatra} value={nakshatra}>{nakshatra}</option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <label htmlFor="raasiMoonsign" className="block text-sm font-medium text-gray-700">
        Raasi/Moon Sign *
      </label>
      <select
        id="raasiMoonsign"
        name="raasiMoonsign"
        value={formData.raasiMoonsign || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Raasi/Moon Sign</option>
        {RASHI.map(rashi => (
          <option key={rashi} value={rashi}>{rashi}</option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700">
        Birth Time *
      </label>
      <input
        id="birthTime"
        type="time"
        name="birthTime"
        value={formData.birthTime || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700">
        Birth Place *
      </label>
      <input
        id="birthPlace"
        type="text"
        name="birthPlace"
        value={formData.birthPlace || ''}
        onChange={handleInputChange}
        placeholder="Enter Birth Place"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      />
    </div>
  </FormSection>
);