"use client"
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { StepProgress } from "../MultiStepForm/components/StepProgress";
import { steps } from "./constants/steps";
import { BasicPreferences } from "./steps/BasicPreferences";
import { LifestylePreferences } from "./steps/LifestylePreferences";
import { ReligionPreferences } from "./steps/ReligionPreferences";
import { LocationPreferences } from "./steps/LocationPreferences";
import { CareerPreferences } from "./steps/CareerPreferences";

const defaultPreferences = {
  // Basic
  ageFrom: "",
  ageTo: "",
  heightFrom: "",
  heightTo: "",
  
  // Religion
  religion: "",
  haveDosh: "",
  motherTongue: "",
  
  // Location
  countryLivingIn: "india",
  residingState: "",
  residingCity: "",
  
  // Lifestyle
  maritalStatus: "",
  physicalStatus: "",
  eatingHabits: "",
  smokingHabits: "",
  drinkingHabits: "",
  
  // Career
  education: "",
  occupation: "", 
  annualIncome: "",

  // Additional
  about: "",
  hobbies: "",
  expectations: "",
  dealBreakers: "",
  matchPreferences: {
    mustHave: [],
    niceToHave: [],
    cannotHave: []
  },
  
  // Metadata
  createdAt: "",
  updatedAt: "",
  isComplete: false,
  completedSteps: [],
  currentStep: 1
};

const PartnerPreferencesForm = ({ userId }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().partnerPreferences) {
          setPreferences(prev => ({
            ...prev,
            ...userSnap.data().partnerPreferences
          }));
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to load preferences",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [userId, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return preferences.ageFrom && preferences.ageTo && 
               preferences.heightFrom && preferences.heightTo;
      case 2:
        return preferences.maritalStatus && preferences.physicalStatus && 
               preferences.eatingHabits;
      case 3:
        return preferences.religion && preferences.motherTongue;
      case 4:
        return preferences.residingState && preferences.residingCity;
      case 5:
        return preferences.education && preferences.occupation;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const userRef = doc(db, "users", userId);
      
      const completedSteps = [...new Set([
        ...preferences.completedSteps,
        step
      ])].sort();

      const updatedPreferences = {
        ...preferences,
        updatedAt: new Date().toISOString(),
        completedSteps,
        isComplete: completedSteps.length === steps.length,
        currentStep: step
      };

      if (!updatedPreferences.createdAt) {
        updatedPreferences.createdAt = new Date().toISOString();
      }

      await updateDoc(userRef, {
        partnerPreferences: updatedPreferences
      });

      toast({
        title: "Success",
        description: "Preferences updated successfully!"
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const props = { preferences, handleChange };
    const steps = {
      1: <BasicPreferences {...props} />,
      2: <LifestylePreferences {...props} />,
      3: <ReligionPreferences {...props} />,
      4: <LocationPreferences {...props} />,
      5: <CareerPreferences {...props} />
    };
    return steps[step] || null;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  const canProceed = isStepValid();

  return (
    <Card className="w-full max-w-4xl mx-auto my-6">
      <CardHeader>
        <CardTitle>Partner Preferences</CardTitle>
        <StepProgress steps={steps} currentStep={step} />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
            )}
            {step < steps.length ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                disabled={!canProceed}
                className="flex items-center px-4 py-2 bg-[#e71c5d] hover:bg-opacity-90 text-white rounded ml-auto
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !canProceed}
                className="flex items-center px-6 py-2 bg-[#e71c5d] hover:bg-opacity-90 text-white rounded ml-auto
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartnerPreferencesForm;