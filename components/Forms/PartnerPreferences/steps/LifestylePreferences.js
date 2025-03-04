// components/Forms/PartnerPreferences/steps/LifestylePreferences.js
import React from "react";
import { FormSection } from "../components/FormSection";
import { CheckboxGroup } from "../components/CheckboxGroup";
import {
  MARITAL_STATUS_OPTIONS,
  PHYSICAL_STATUS_OPTIONS,
  DIET_OPTIONS,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS,
} from "../constants/steps";
import { RadioGroup } from "../components/RadioGroup";

// Update LifestylePreferences.js
export const LifestylePreferences = ({ preferences, handleChange }) => (
  <FormSection title="Lifestyle Preferences">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RadioGroup
        label="Marital Status"
        name="maritalStatus"
        options={MARITAL_STATUS_OPTIONS}
        value={preferences.maritalStatus}
        onChange={handleChange}
      />
      <RadioGroup
        label="Physical Status"
        name="physicalStatus"
        options={PHYSICAL_STATUS_OPTIONS}
        value={preferences.physicalStatus}
        onChange={handleChange}
      />
      <RadioGroup
        label="Diet"
        name="eatingHabits"
        options={DIET_OPTIONS}
        value={preferences.eatingHabits}
        onChange={handleChange}
      />
      <div className="space-y-4">
        <RadioGroup
          label="Smoking Habits"
          name="smokingHabits"
          options={SMOKING_OPTIONS}
          value={preferences.smokingHabits}
          onChange={handleChange}
        />
        <RadioGroup
          label="Drinking Habits"
          name="drinkingHabits"
          options={DRINKING_OPTIONS}
          value={preferences.drinkingHabits}
          onChange={handleChange}
        />
      </div>
    </div>
  </FormSection>
);
