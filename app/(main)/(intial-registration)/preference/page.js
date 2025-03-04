"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc ,updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  Users,
  UserCircle2,
  Calendar as CalendarIcon,
  Briefcase,
  Heart,
  Users2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from 'next/navigation';
import {
  CASTES,
  LANGUAGES,
  SUB_CASTES,
  STATES,
  CITIES,
  DEGREES,
  OCCUPATIONS,
  HEIGHTS,
  WEIGHTS,
} from "@/components/Forms/MultiStepForm/constants/formConstant";

// Reuse the same styled components from EnhancedRegistrationForm
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center space-x-2 mb-6">
    {[...Array(totalSteps)].map((_, index) => (
      <div
        key={index}
        className={`h-2 rounded-full transition-all duration-300 ${
          index === currentStep
            ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
            : "w-2 bg-gray-200"
        }`}
      />
    ))}
  </div>
);

const FormSection = ({ title, description, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-pink-50 rounded-lg">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-6 space-y-4">{children}</div>
  </div>
);

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  ...props
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
      required={required}
      {...props}
    />
  </div>
);

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && "*"}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
      required={required}
    >
      <option value="">{`Select ${label}`}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && "*"}
    </label>
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`px-4 py-2 rounded-lg cursor-pointer transition-all duration-200
            ${
              value === option.value
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50"
            }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            className="hidden"
            required={required}
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const RangeSelect = ({ label, fromName, toName, fromValue, toValue, onChange, options, required = false }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && "*"}
    </label>
    <div className="grid grid-cols-2 gap-4">
      <select
        name={fromName}
        value={fromValue}
        onChange={onChange}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
        required={required}
      >
        <option value="">From</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        name={toName}
        value={toValue}
        onChange={onChange}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
        required={required}
      >
        <option value="">To</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default function PartnerPreferencesForm() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ageFrom: "",
    ageTo: "",
    heightFrom: "",
    heightTo: "",
    maritalStatus: "",
    religion: "",
    caste: "",
    subCaste: "",
    motherTongue: "",
    education: "",
    occupation: "",
    annualIncomeFrom: "",
    annualIncomeTo: "",
    diet: "",
    smoking: "",
    drinking: "",
    residingState: "",
    residingCity: "",
    familyType: "",
    familyStatus: "",
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().partnerPreferences) {
          setFormData(userSnap.data().partnerPreferences);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const steps = [
    {
      title: "Basic Preferences",
      description: "Set your basic partner preferences",
      icon: UserCircle2,
      content: (
        <div className="space-y-6">
          <RangeSelect
            label="Age"
            fromName="ageFrom"
            toName="ageTo"
            fromValue={formData.ageFrom}
            toValue={formData.ageTo}
            onChange={handleInputChange}
            options={Array.from({ length: 43 }, (_, i) => ({
              value: String(18 + i),
              label: String(18 + i),
            }))}
            required
          />
          <RangeSelect
            label="Height"
            fromName="heightFrom"
            toName="heightTo"
            fromValue={formData.heightFrom}
            toValue={formData.heightTo}
            onChange={handleInputChange}
            options={HEIGHTS.map(height => ({
              value: height,
              label: height,
            }))}
            required
          />
          <RadioGroup
            label="Marital Status"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            options={[
              { value: "neverMarried", label: "Never Married" },
              { value: "divorced", label: "Divorced" },
              { value: "widowed", label: "Widowed" },
            ]}
            required
          />
        </div>
      ),
    },
    {
      title: "Religious Background",
      description: "Specify religious preferences",
      icon: Heart,
      content: (
        <div className="space-y-6">
          <FormSelect
            label="Religion"
            name="religion"
            value={formData.religion}
            onChange={handleInputChange}
            options={Object.keys(CASTES).map((religion) => ({
              value: religion,
              label: religion.charAt(0).toUpperCase() + religion.slice(1),
            }))}
            required
          />
          {formData.religion && (
            <FormSelect
              label="Caste"
              name="caste"
              value={formData.caste}
              onChange={handleInputChange}
              options={CASTES[formData.religion].map((caste) => ({
                value: caste,
                label: caste,
              }))}
            />
          )}
          {formData.caste && SUB_CASTES[formData.caste] && (
            <FormSelect
              label="Sub Caste"
              name="subCaste"
              value={formData.subCaste}
              onChange={handleInputChange}
              options={SUB_CASTES[formData.caste].map((subCaste) => ({
                value: subCaste,
                label: subCaste,
              }))}
            />
          )}
          <FormSelect
            label="Mother Tongue"
            name="motherTongue"
            value={formData.motherTongue}
            onChange={handleInputChange}
            options={LANGUAGES.map((language) => ({
              value: language.toLowerCase(),
              label: language,
            }))}
            required
          />
        </div>
      ),
    },
    {
      title: "Education & Career",
      description: "Set educational and professional preferences",
      icon: Briefcase,
      content: (
        <div className="space-y-6">
          <FormSelect
            label="Education"
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            options={DEGREES.map((education) => ({
              value: education,
              label: education,
            }))}
            required
          />
          <FormSelect
            label="Occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleInputChange}
            options={OCCUPATIONS.map((occupation) => ({
              value: occupation,
              label: occupation,
            }))}
            required
          />
          <RangeSelect
            label="Annual Income (LPA)"
            fromName="annualIncomeFrom"
            toName="annualIncomeTo"
            fromValue={formData.annualIncomeFrom}
            toValue={formData.annualIncomeTo}
            onChange={handleInputChange}
            options={Array.from({ length: 21 }, (_, i) => ({
              value: String(i * 5),
              label: `${i * 5}+ LPA`,
            }))}
            required
          />
        </div>
      ),
    },
    {
      title: "Lifestyle",
      description: "Set lifestyle preferences",
      icon: Users,
      content: (
        <div className="space-y-6">
          <RadioGroup
            label="Diet"
            name="diet"
            value={formData.diet}
            onChange={handleInputChange}
            options={[
              { value: "vegetarian", label: "Vegetarian" },
              { value: "nonVegetarian", label: "Non-Vegetarian" },
              { value: "eggetarian", label: "Eggetarian" },
              { value: "dontMatter", label: "Doesn't Matter" },
            ]}
            required
          />
          <RadioGroup
            label="Smoking"
            name="smoking"
            value={formData.smoking}
            onChange={handleInputChange}
            options={[
              { value: "no", label: "No" },
              { value: "occasionally", label: "Occasionally" },
              { value: "yes", label: "Yes" },
              { value: "dontMatter", label: "Doesn't Matter" },
            ]}
            required
          />
          <RadioGroup
            label="Drinking"
            name="drinking"
            value={formData.drinking}
            onChange={handleInputChange}
            options={[
              { value: "no", label: "No" },
              { value: "occasionally", label: "Occasionally" },
              { value: "yes", label: "Yes" },
              { value: "dontMatter", label: "Doesn't Matter" },
            ]}
            required
          />
        </div>
      ),
    },
    {
      title: "Location & Family",
      description: "Set location and family preferences",
      icon: Users2,
      content: (
        <div className="space-y-6">
          <FormSelect
            label="State"
            name="residingState"
            value={formData.residingState}
            onChange={handleInputChange}
            options={STATES.map((state) => ({
              value: state,
              label: state,
            }))}
            required
          />
          {formData.residingState && (
            <FormSelect
              label="City"
              name="residingCity"
              value={formData.residingCity}
              onChange={handleInputChange}
              options={CITIES[formData.residingState].map((city) => ({
              value: city,
              label: city,
            }))}
            required
          />
          )}
          <RadioGroup
            label="Family Type"
            name="familyType"
            value={formData.familyType}
            onChange={handleInputChange}
            options={[
              { value: "joint", label: "Joint" },
              { value: "nuclear", label: "Nuclear" },
              { value: "dontMatter", label: "Doesn't Matter" },
            ]}
            required
          />
          <RadioGroup
            label="Family Status"
            name="familyStatus"
            value={formData.familyStatus}
            onChange={handleInputChange}
            options={[
              { value: "middleClass", label: "Middle Class" },
              { value: "upperMiddleClass", label: "Upper Middle Class" },
              { value: "rich", label: "Rich" },
              { value: "dontMatter", label: "Doesn't Matter" },
            ]}
            required
          />
        </div>
      ),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.log("No user found");
      return;
    }

    try {
      setLoading(true);
      console.log("Saving preferences for user:", user.uid);
      console.log("Preferences being saved:", formData);

      const userRef = doc(db, "users", user.uid);

      const dataToSave = {
        partnerPreferences: {
          ...formData,
          updatedAt: new Date().toISOString(),
        }
      };

      console.log("Final preferences being saved:", dataToSave);

      await updateDoc(userRef, dataToSave);

      console.log("Preferences saved successfully");
      router.push("/photo-upload");
      alert("Partner preferences updated successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences. Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Partner Preferences
        </h1>
        <p className="text-gray-600">
          Tell us about your ideal life partner
        </p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={steps.length} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          icon={steps[currentStep].icon}
        >
          {steps[currentStep].content}
        </FormSection>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 flex items-center space-x-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg 
                hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-50 
                flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
              }
              className="px-4 py-2 text-pink-600 flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}