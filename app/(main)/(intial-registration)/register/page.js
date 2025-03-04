"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  Users,
  UserCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  Coffee,
  Star,
  Users2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useAuthState } from "react-firebase-hooks/auth";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CASTES,
  LANGUAGES,
  SUB_CASTES,
  STATES,
  CITIES,
  DEGREES,
  OCCUPATIONS,
  NAKSHATRAS,
  RASHI,
  HEIGHTS,
  WEIGHTS,
} from "@/components/Forms/MultiStepForm/constants/formConstant";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from 'next/navigation';


// Step indicator component
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

// Form section component
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

const StyledCheckbox = ({ label, name, checked, onChange }) => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <label
        htmlFor={name}
        className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full 
          bg-gradient-to-tr from-pink-500 via-purple-500 to-pink-300 p-1.5 
          duration-200 hover:p-2 cursor-pointer"
      >
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer hidden"
        />
        <label
          htmlFor={name}
          className="h-full w-full rounded-full bg-white peer-checked:h-0 peer-checked:w-0
            transition-all duration-300"
        />
        <div
          className="absolute left-[0.8rem] h-[3px] w-[16px] -translate-y-6 translate-x-6 
            rotate-[-41deg] rounded-sm bg-white duration-300 
            peer-checked:translate-x-0 peer-checked:translate-y-0"
        />
        <div
          className="absolute left-2 top-4 h-[3px] w-[10px] -translate-x-6 -translate-y-6 
            rotate-[45deg] rounded-sm bg-white duration-300 
            peer-checked:translate-x-0 peer-checked:translate-y-0"
        />
      </label>
    </div>
    <label htmlFor={name} className="text-sm text-gray-700 cursor-pointer">
      {label}
    </label>
  </div>
);

// Input field component
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

// Select field component
const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && "*"}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-50"
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

// Radio group component
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

export default function EnhancedRegistrationForm({ userId }) {
  const [user, authLoading] = useAuthState(auth);
  // Fetch user data on component mount
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    gender: "",
    dateOfBirth: "",
    religion: "",
    caste: "",
    subCaste: "",
    willingToMarryOtherCaste: false,
    motherTongue: "",
    countryLivingIn: "India",
    residingState: "",
    residingCity: "",
    height: "",
    weight: "",
    bodyType: "",
    complexion: "",
    physicalStatus: "",
    highestEducation: "",
    additionalDegree: "",
    occupation: "",
    employedIn: "",
    annualIncome: "",
    diet: "",
    smoking: "",
    drinking: "",
    haveDosh: "",
    star: "",
    raasiMoonsign: "",
    birthTime: "",
    birthPlace: "",
    familyStatus: "",
    familyType: "",
    familyValue: "",
    fatherOccupation: "",
    motherOccupation: "",
    noOfBrothers: "",
    noOfSisters: "",
  });

  // Move useEffect inside component
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Format the data before setting state
          setFormData((prevData) => ({
            ...prevData,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            mobileNo: userData.phone || "",
            gender: userData.gender || "",
            dateOfBirth: userData.dateOfBirth || "",
            religion: userData.religion || "",
            caste: userData.caste || "",
            subCaste: userData.subCaste || "",
            willingToMarryOtherCaste:
              userData.willingToMarryOtherCaste || false,
            motherTongue: userData.motherTongue || "",
            residingState: userData.residingState || "",
            residingCity: userData.residingCity || "",
            height: userData.height || "",
            weight: userData.weight || "",
            bodyType: userData.bodyType || "",
            complexion: userData.complexion || "",
            physicalStatus: userData.physicalStatus || "",
            highestEducation: userData.highestEducation || "",
            occupation: userData.occupation || "",
            employedIn: userData.employedIn || "",
            annualIncome: userData.annualIncome || "",
            diet: userData.diet || "",
            smoking: userData.smoking || "",
            drinking: userData.drinking || "",
            haveDosh: userData.haveDosh || "",
            star: userData.star || "",
            raasiMoonsign: userData.raasiMoonsign || "",
            birthTime: userData.birthTime || "",
            birthPlace: userData.birthPlace || "",
            familyStatus: userData.familyStatus || "",
            familyType: userData.familyType || "",
            fatherOccupation: userData.fatherOccupation || "",
            motherOccupation: userData.motherOccupation || "",
            noOfBrothers: userData.noOfBrothers || "",
            noOfSisters: userData.noOfSisters || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Move loadUserData useEffect inside component
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Loaded user data:", userData);

          setFormData((prevData) => ({
            ...prevData,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            mobileNo: userData.phone || "",
            // ... rest of your field mappings
          }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const steps = [
    {
      title: "Basic Details",
      description: "Let's start with your basic information",
      icon: UserCircle2,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <FormInput
            label="Mobile Number"
            type="tel"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleInputChange}
            required
          />
        </div>
      ),
    },
    {
      title: "Personal Information",
      description: "Tell us more about yourself",
      icon: Users,
      content: (
        <div className="space-y-6">
          <RadioGroup
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            required
          />
          {/* Date of Birth Picker */}
          {/* Date of Birth Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateOfBirth ? (
                    format(new Date(formData.dateOfBirth), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formData.dateOfBirth
                      ? new Date(formData.dateOfBirth)
                      : undefined
                  }
                  onSelect={(date) =>
                    handleInputChange({
                      target: {
                        name: "dateOfBirth",
                        value: date ? date.toISOString().split("T")[0] : "",
                      },
                    })
                  }
                  disabled={(date) =>
                    date > new Date() || date < new Date("1940-01-01")
                  }
                  captionLayout="dropdown-buttons"
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
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
              required
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
          <StyledCheckbox
            label="Willing to Marry Outside Caste"
            name="willingToMarryOtherCaste"
            checked={formData.willingToMarryOtherCaste}
            onChange={handleInputChange}
          />
        </div>
      ),
    },
    {
      title: "Physical Attributes",
      description: "Tell us about your physical characteristics",
      icon: UserCircle2,
      content: (
        <div className="space-y-6">
          <FormSelect
            label="Height"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            options={HEIGHTS.map((height) => ({
              value: height,
              label: height,
            }))}
            required
          />
          <FormSelect
            label="Weight"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            options={WEIGHTS.map((weight) => ({
              value: weight,
              label: weight,
            }))}
            required
          />
          <RadioGroup
            label="Body Type"
            name="bodyType"
            value={formData.bodyType}
            onChange={handleInputChange}
            options={[
              { value: "slim", label: "Slim" },
              { value: "average", label: "Average" },
              { value: "athletic", label: "Athletic" },
              { value: "heavy", label: "Heavy" },
            ]}
            required
          />
          <RadioGroup
            label="Complexion"
            name="complexion"
            value={formData.complexion}
            onChange={handleInputChange}
            options={[
              { value: "fair", label: "Fair" },
              { value: "wheatish", label: "Wheatish" },
              { value: "dark", label: "Dark" },
            ]}
            required
          />
        </div>
      ),
    },
    {
      title: "Education & Career",
      description: "Share your educational and professional background",
      icon: Briefcase,
      content: (
        <div className="space-y-6">
          <FormSelect
            label="Highest Education"
            name="highestEducation"
            value={formData.highestEducation}
            onChange={handleInputChange}
            options={DEGREES.map((highestEducation) => ({
              value: highestEducation,
              label: highestEducation,
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
          <FormInput
            label="Annual Income"
            name="annualIncome"
            value={formData.annualIncome}
            onChange={handleInputChange}
            placeholder="e.g., ₹10 LPA"
            required
          />
          <RadioGroup
            label="Employed In"
            name="employedIn"
            value={formData.employedIn}
            onChange={handleInputChange}
            options={[
              { value: "private", label: "Private" },
              { value: "government", label: "Government" },
              { value: "business", label: "Business" },
              { value: "freelance", label: "Freelance" },
            ]}
            required
          />
        </div>
      ),
    },
    {
      title: "Lifestyle",
      description: "Tell us about your lifestyle preferences",
      icon: Coffee,
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
            ]}
            required
          />
        </div>
      ),
    },
    {
      title: "Horoscope Details",
      description: "Share your astrological information",
      icon: Star,
      content: (
        <div className="space-y-6">
          <RadioGroup
            label="Have Dosh"
            name="haveDosh"
            value={formData.haveDosh}
            onChange={handleInputChange}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            required
          />
          <FormSelect
            label="Star (Nakshatra)"
            name="star"
            value={formData.star}
            onChange={handleInputChange}
            options={NAKSHATRAS.map((nakshatra) => ({
              value: nakshatra.toLowerCase(),
              label: nakshatra,
            }))}
            required
          />
          <FormSelect
            label="Raasi/Moon Sign"
            name="raasiMoonsign"
            value={formData.raasiMoonsign}
            onChange={handleInputChange}
            options={RASHI.map((rashi) => ({
              value: rashi.split(" ")[0].toLowerCase(),
              label: rashi,
            }))}
            required
          />
          <FormInput
            label="Birth Time"
            type="time"
            name="birthTime"
            value={formData.birthTime}
            onChange={handleInputChange}
            required
          />
          <FormInput
            label="Birth Place"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleInputChange}
            required
          />
        </div>
      ),
    },
    {
      title: "Family Details",
      description: "Tell us about your family background",
      icon: Users2,
      content: (
        <div className="space-y-6">
          <RadioGroup
            label="Family Status"
            name="familyStatus"
            value={formData.familyStatus}
            onChange={handleInputChange}
            options={[
              { value: "middleClass", label: "Middle Class" },
              { value: "upperMiddleClass", label: "Upper Middle Class" },
              { value: "rich", label: "Rich" },
            ]}
            required
          />
          <RadioGroup
            label="Family Type"
            name="familyType"
            value={formData.familyType}
            onChange={handleInputChange}
            options={[
              { value: "joint", label: "Joint" },
              { value: "nuclear", label: "Nuclear" },
            ]}
            required
          />
          <FormSelect
            label="Father's Occupation"
            name="fatherOccupation"
            value={formData.fatherOccupation}
            onChange={handleInputChange}
            options={[
              { value: "business", label: "Business" },
              { value: "service", label: "Service" },
              { value: "retired", label: "Retired" },
            ]}
            required
          />
          <FormSelect
            label="Mother's Occupation"
            name="motherOccupation"
            value={formData.motherOccupation}
            onChange={handleInputChange}
            options={[
              { value: "homemaker", label: "Homemaker" },
              { value: "working", label: "Working" },
              { value: "retired", label: "Retired" },
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
      console.log("Saving data for user:", user.uid);
      console.log("Data being saved:", formData);

      const userRef = doc(db, "users", user.uid);

      const dataToSave = {
        ...formData,
        updatedAt: new Date().toISOString(),
        uid: user.uid,
      };

      console.log("Final data being saved:", dataToSave);

      await setDoc(userRef, dataToSave, { merge: true });

      console.log("Data saved successfully");
      router.push("/preference");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Your Profile
        </h1>
        <p className="text-gray-600">
          Find your perfect match with a detailed profile
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
                  <Users2 className="w-4 h-4" />
                  <span>Complete Profile</span>
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
