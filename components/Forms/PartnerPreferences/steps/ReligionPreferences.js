// components/Forms/PartnerPreferences/steps/ReligionPreferences.js
import React from "react";
import { FormSection } from "../components/FormSection";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { SelectGroup } from "../components/SelectGroup";
import { RELIGION_OPTIONS } from "../constants/steps";
import { RadioGroup } from "../components/RadioGroup";

// Update ReligionPreferences.js
export const ReligionPreferences = ({ preferences, handleChange }) => (
  <FormSection title="Religion Preferences">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RadioGroup
        label="Religion"
        name="religion"
        options={RELIGION_OPTIONS}
        value={preferences.religion}
        onChange={handleChange}
      />
      <SelectGroup
        label="Have Dosh"
        name="haveDosh"
        value={preferences.haveDosh}
        onChange={handleChange}
        options={[
          { value: "doesnotmatter", label: "Doesn't Matter" },
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
      <RadioGroup
        label="Mother Tongue"
        name="motherTongue"
        options={[
          { value: "hindi", label: "Hindi" },
          { value: "english", label: "English" },
          { value: "punjabi", label: "Punjabi" },
        ]}
        value={preferences.motherTongue}
        onChange={handleChange}
      />
    </div>
  </FormSection>
);
