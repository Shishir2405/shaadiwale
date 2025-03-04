// components/Forms/PartnerPreferences/steps/BasicPreferences.js
import React from "react";
import { FormSection } from "../components/FormSection";
import { SelectGroup } from "../components/SelectGroup";
import { AGE_RANGE, HEIGHT_OPTIONS } from "../constants/steps";

export const BasicPreferences = ({ preferences, handleChange }) => (
  <div className="max-w-4xl mx-auto">
    {" "}
    <FormSection title="Basic Preferences">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <SelectGroup
          label="Age From"
          name="ageFrom"
          value={preferences.ageFrom}
          onChange={handleChange}
          options={AGE_RANGE}
          placeholder="Select Age From"
          required
        />
        <SelectGroup
          label="Age To"
          name="ageTo"
          value={preferences.ageTo}
          onChange={handleChange}
          options={AGE_RANGE}
          placeholder="Select Age To"
          required
        />
        <SelectGroup
          label="Height From"
          name="heightFrom"
          value={preferences.heightFrom}
          onChange={handleChange}
          options={HEIGHT_OPTIONS}
          placeholder="Select Height From"
          required
        />
        <SelectGroup
          label="Height To"
          name="heightTo"
          value={preferences.heightTo}
          onChange={handleChange}
          options={HEIGHT_OPTIONS}
          placeholder="Select Height To"
          required
        />
      </div>
    </FormSection>
  </div>
);
