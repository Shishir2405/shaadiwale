import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";

import { StepProgress } from "./components/StepProgress";
import { steps } from "./constants/formConstant";
import { AccountInfo } from "./steps/AccountInfo";
import { PersonalInfo } from "./steps/PersonalInfo";
import { PhysicalAttributes } from "./steps/PhysicalAttributes";
import { EducationOccupation } from "./steps/EducationOccupation";
import { Habits } from "./steps/Habits";
import { HoroscopeDetails } from "./steps/HoroscopeDetails";
import { FamilyProfile } from "./steps/FamilyProfile";

const MultiStepForm = ({ userId }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    religion: "",
    caste: "",
    willingToMarryOtherCaste: false,
    subCaste: "",
    motherTongue: "",
    countryLivingIn: "india",
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          let formattedDateOfBirth = userData.dateOfBirth || "";

          if (userData.year && userData.month && userData.day) {
            const date = new Date(
              `${userData.year}-${userData.month}-${userData.day}`
            );
            formattedDateOfBirth = date.toISOString().split("T")[0];
          }

          setFormData((prev) => ({
            ...prev,
            ...userData,
            dateOfBirth: formattedDateOfBirth,
          }));
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const userRef = doc(db, "users", userId);
      const birthDate = formData.dateOfBirth
        ? new Date(formData.dateOfBirth)
        : null;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const updatedUserData = {
        // Basic Info
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.mobileNo,

        // Personal Info
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        day: birthDate ? birthDate.getDate().toString().padStart(2, "0") : "",
        month: birthDate ? monthNames[birthDate.getMonth()] : "",
        year: birthDate ? birthDate.getFullYear().toString() : "",
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        caste: formData.caste,
        willingToMarryOtherCaste: formData.willingToMarryOtherCaste,
        subCaste: formData.subCaste,
        motherTongue: formData.motherTongue,

        // Location
        country: formData.countryLivingIn,
        residingState: formData.residingState,
        residingCity: formData.residingCity,

        height: formData.height,
        weight: formData.weight,
        bodyType: formData.bodyType,
        complexion: formData.complexion,
        physicalStatus: formData.physicalStatus,

        // Education & Occupation
        highestEducation: formData.highestEducation,
        additionalDegree: formData.additionalDegree,
        occupation: formData.occupation,
        employedIn: formData.employedIn,
        annualIncome: formData.annualIncome,

        // Habits
        diet: formData.diet,
        smoking: formData.smoking,
        drinking: formData.drinking,

        // Horoscope Details
        haveDosh: formData.haveDosh,
        star: formData.star,
        raasiMoonsign: formData.raasiMoonsign,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,

        // Family Profile
        familyStatus: formData.familyStatus,
        familyType: formData.familyType,
        familyValue: formData.familyValue,
        fatherOccupation: formData.fatherOccupation,
        motherOccupation: formData.motherOccupation,
        noOfBrothers: formData.noOfBrothers,
        noOfSisters: formData.noOfSisters,

        // Metadata
        accountStatus: "active",
        countryCode: "+91",
        hasAcceptedTerms: true,
        profileCreatedBy: "self",
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updatedUserData);
      setIsSubmitted(true);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const props = { formData, handleInputChange };

    switch (step) {
      case 1:
        return <AccountInfo {...props} />;
      case 2:
        return <PersonalInfo {...props} />;
      case 3:
        return <PhysicalAttributes {...props} />;
      case 4:
        return <EducationOccupation {...props} />;
      case 5:
        return <Habits {...props} />;
      case 6:
        return <HoroscopeDetails {...props} />;
      case 7:
        return <FamilyProfile {...props} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e71c5d]"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-6">
      <CardHeader>
        <CardTitle>Registration Form</CardTitle>
        <StepProgress steps={steps} currentStep={step} />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev + 1)}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded ml-auto transition-colors duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded ml-auto flex items-center justify-center min-w-[120px] 
                  bg-blue-500 hover:bg-blue-600 text-white 
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                  disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MultiStepForm;
