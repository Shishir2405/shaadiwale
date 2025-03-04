import React from 'react';
import { FormSection } from "../components/FormSection";
import { RadioGroup } from "../components/RadioGroup";

export const Habits = ({ formData, handleInputChange }) => (
  <FormSection title="Habits">
    <div className="col-span-2">
      <RadioGroup
        name="diet"
        value={formData.diet || ''}
        onChange={handleInputChange}
        label="Diet *"
        options={[
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'nonVegetarian', label: 'Non-Vegetarian' },
          { value: 'eggetarian', label: 'Eggetarian' }
        ]}
      />
    </div>

    <div className="col-span-2">
      <RadioGroup
        name="smoking"
        value={formData.smoking || ''}
        onChange={handleInputChange}
        label="Smoking *"
        options={[
          { value: 'no', label: 'No' },
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'yes', label: 'Yes' }
        ]}
      />
    </div>

    <div className="col-span-2">
      <RadioGroup
        name="drinking"
        value={formData.drinking || ''}
        onChange={handleInputChange}
        label="Drinking *"
        options={[
          { value: 'no', label: 'No' },
          { value: 'occasionally', label: 'Occasionally' },
          { value: 'yes', label: 'Yes' }
        ]}
      />
    </div>
  </FormSection>
);