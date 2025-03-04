import React from 'react';
import { FormSection } from "../components/FormSection";
import { HEIGHTS, WEIGHTS } from "../constants/formConstant";
import { RadioGroup } from "../components/RadioGroup";

export const PhysicalAttributes = ({ formData, handleInputChange }) => (
  <FormSection title="Physical Attributes">
    <div className="space-y-2">
      <label htmlFor="height" className="block text-sm font-medium text-gray-700">
        Height *
      </label>
      <select
        id="height"
        name="height"
        value={formData.height || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Height</option>
        {HEIGHTS.map((height) => (
          <option key={height} value={height}>{height}</option>
        ))}
      </select>
    </div>

    <div className="space-y-2">
      <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
        Weight *
      </label>
      <select
        id="weight"
        name="weight"
        value={formData.weight || ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select Weight</option>
        {WEIGHTS.map((weight) => (
          <option key={weight} value={weight}>{weight}</option>
        ))}
      </select>
    </div>

    <div className="col-span-2">
      <RadioGroup
        name="bodyType"
        value={formData.bodyType || ''}
        onChange={handleInputChange}
        label="Body Type *"
        options={[
          { value: "slim", label: "Slim" },
          { value: "average", label: "Average" },
          { value: "athletic", label: "Athletic" },
          { value: "heavy", label: "Heavy" },
        ]}
      />
    </div>

    <div className="col-span-2">
      <RadioGroup
        name="complexion"
        value={formData.complexion || ''}
        onChange={handleInputChange}
        label="Complexion *"
        options={[
          { value: "fair", label: "Fair" },
          { value: "wheatish", label: "Wheatish" },
          { value: "dark", label: "Dark" },
        ]}
      />
    </div>

    <div className="col-span-2">
      <RadioGroup
        name="physicalStatus"
        value={formData.physicalStatus || ''}
        onChange={handleInputChange}
        label="Physical Status *"
        options={[
          { value: "normal", label: "Normal" },
          { value: "differentlyAbled", label: "Differently Abled" },
        ]}
      />
    </div>
  </FormSection>
);