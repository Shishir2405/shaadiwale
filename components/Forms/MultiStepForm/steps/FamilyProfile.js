  // steps/FamilyProfile.js

  import { FormSection } from "../components/FormSection";
  import { RadioGroup } from "../components/RadioGroup";
  import { OCCUPATIONS } from "../constants/formConstant";
  export const FamilyProfile = ({ formData, handleInputChange }) => (
    <FormSection title="Family Profile">
      <RadioGroup
        name="familyStatus"
        value={formData.familyStatus}
        onChange={handleInputChange}
        label="Family Status *"
        options={[
          { value: 'middleClass', label: 'Middle Class' },
          { value: 'upperMiddleClass', label: 'Upper Middle Class' },
          { value: 'rich', label: 'Rich' }
        ]}
      />
  
      <RadioGroup
        name="familyType"
        value={formData.familyType}
        onChange={handleInputChange}
        label="Family Type *"
        options={[
          { value: 'joint', label: 'Joint' },
          { value: 'nuclear', label: 'Nuclear' }
        ]}
      />
  
      <RadioGroup
        name="familyValue"
        value={formData.familyValue}
        onChange={handleInputChange}
        label="Family Values *"
        options={[
          { value: 'traditional', label: 'Traditional' },
          { value: 'moderate', label: 'Moderate' },
          { value: 'liberal', label: 'Liberal' }
        ]}
      />
  
      <select
        name="fatherOccupation"
        value={formData.fatherOccupation}
        onChange={handleInputChange}
        className="p-2 border rounded"
      >
        <option value="">Select Father's Occupation *</option>
        {OCCUPATIONS.map(occupation => (
          <option key={occupation} value={occupation}>{occupation}</option>
        ))}
      </select>
  
      <select
        name="motherOccupation"
        value={formData.motherOccupation}
        onChange={handleInputChange}
        className="p-2 border rounded"
      >
        <option value="">Select Mother's Occupation *</option>
        {OCCUPATIONS.map(occupation => (
          <option key={occupation} value={occupation}>{occupation}</option>
        ))}
      </select>
  
      <select
        name="noOfBrothers"
        value={formData.noOfBrothers}
        onChange={handleInputChange}
        className="p-2 border rounded"
      >
        <option value="">Number of Brothers *</option>
        {Array.from({ length: 5 }, (_, i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
  
      <select
        name="noOfSisters"
        value={formData.noOfSisters}
        onChange={handleInputChange}
        className="p-2 border rounded"
      >
        <option value="">Number of Sisters *</option>
        {Array.from({ length: 5 }, (_, i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
    </FormSection>
  );