// components/Forms/PartnerPreferences/steps/LocationPreferences.js
import React from "react";
import { FormSection } from "../components/FormSection";
import { SelectGroup } from "../components/SelectGroup";
import { STATES, CITIES } from "../../MultiStepForm/constants/formConstant";

export const LocationPreferences = ({ preferences, handleChange }) => (
  <FormSection title="Location Preferences">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SelectGroup
        label="State"
        name="residingState"
        value={preferences.residingState}
        onChange={handleChange}
        options={STATES.map((state) => ({ value: state, label: state }))}
        placeholder="Select State"
        required
      />
      <SelectGroup
        label="City"
        name="residingCity"
        value={preferences.residingCity}
        onChange={handleChange}
        options={
          preferences.residingState
            ? CITIES[preferences.residingState]?.map((city) => ({
                value: city,
                label: city,
              }))
            : []
        }
        placeholder="Select City"
        required
      />
    </div>
  </FormSection>
);
