// components/Forms/PartnerPreferences/steps/CareerPreferences.js
import React from "react";
import { FormSection } from "../components/FormSection";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { RadioGroup } from "../components/RadioGroup";
import { SelectGroup } from "../components/SelectGroup";
import {
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
  INCOME_RANGES,
} from "../constants/steps";

// Update CareerPreferences.js
export const CareerPreferences = ({ preferences, handleChange }) => (
  <FormSection title="Education & Career Preferences">
    <div className="grid grid-cols-1 gap-6">
      <RadioGroup
        label="Education"
        name="education"
        options={EDUCATION_OPTIONS}
        value={preferences.education}
        onChange={handleChange}
      />
      <RadioGroup
        label="Occupation"
        name="occupation"
        options={OCCUPATION_OPTIONS}
        value={preferences.occupation}
        onChange={handleChange}
      />
      <SelectGroup
        label="Minimum Annual Income"
        name="annualIncome"
        value={preferences.annualIncome}
        onChange={handleChange}
        options={INCOME_RANGES}
        placeholder="Select Minimum Income"
      />
    </div>
  </FormSection>
);



