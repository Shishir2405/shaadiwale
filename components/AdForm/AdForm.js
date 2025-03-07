"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Upload,
  Save,
  ChevronLeft,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import StepIndicator from "@/components/ui/StepIndicator";
import FormSection from "@/components/ui/FormSection";
import StyledCheckbox from "@/components/ui/StyledCheckbox";

// Form Input component for text inputs
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
      {label} {required && <span className="text-pink-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
      required={required}
      {...props}
    />
  </div>
);

// Form Select component for dropdowns
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
      {label} {required && <span className="text-pink-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-50"
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
      {label} {required && <span className="text-pink-500">*</span>}
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

export default function AdForm({ adData, isEditing }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    level: "1",
    contactPerson: "",
    date: new Date().toISOString().split("T")[0],
    link: "",
    contactNumber: "",
    status: "Active",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (adData) {
      setFormData({
        name: adData.name || "",
        level: adData.level || "1",
        contactPerson: adData.contactPerson || "",
        date: adData.date || new Date().toISOString().split("T")[0],
        link: adData.link || "",
        contactNumber: adData.contactNumber || "",
        status: adData.status || "Active",
      });
      if (adData.imageUrl) {
        setImagePreview(adData.imageUrl);
      }
    }
  }, [adData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getLevelDimensions = (level) => {
    switch (level) {
      case "1":
        return "160×600";
      case "2":
        return "250×600";
      case "3":
        return "1170×80";
      default:
        return "160×600";
    }
  };

  const steps = [
    {
      title: "Advertisement Details",
      description: "Basic information about your advertisement",
      icon: CalendarIcon,
      content: (
        <div className="space-y-6">
          <FormInput
            label="Advertisement Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <FormSelect
            label="Advertisement Level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            options={[
              { value: "1", label: "Level 1 - 160×600" },
              { value: "2", label: "Level 2 - 250×600" },
              { value: "3", label: "Level 3 - 1170×80" },
            ]}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Advertisement Date <span className="text-pink-500">*</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(new Date(formData.date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) =>
                    handleChange({
                      target: {
                        name: "date",
                        value: date ? date.toISOString().split("T")[0] : "",
                      },
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <FormInput
            label="Advertisement Link"
            type="url"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://example.com"
          />

          <RadioGroup
            label="Advertisement Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
            required
          />
        </div>
      ),
    },
    {
      title: "Contact Information",
      description: "Who to contact about this advertisement",
      icon: Upload,
      content: (
        <div className="space-y-6">
          <FormInput
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            required
          />

          <FormInput
            label="Contact Number"
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Advertisement Image{" "}
              {!isEditing && <span className="text-pink-500">*</span>}
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold text-pink-500">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Recommended size: {getLevelDimensions(formData.level)}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!isEditing && !imagePreview}
                />
              </label>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Image Preview:
                </p>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={imagePreview}
                    alt="Advertisement preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setUploading(true);
    setError("");

    try {
      let imageUrl = adData?.imageUrl || "";

      // Upload image if a new one is selected
      if (image) {
        const storageRef = ref(storage, `ads/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Progress tracking could be added here
            },
            (error) => {
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to save advertisements");
        setUploading(false);
        return;
      }

      const adDataToSave = {
        ...formData,
        imageUrl,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      };

      if (isEditing && adData.id) {
        // Update existing document
        await updateDoc(doc(db, "advertisements", adData.id), adDataToSave);
      } else {
        // Add new document
        adDataToSave.createdAt = new Date().toISOString();
        await addDoc(collection(db, "advertisements"), adDataToSave);
      }

      router.push("/dashboard/advertise");
    } catch (err) {
      console.error("Error saving advertisement:", err);
      setError("Failed to save advertisement. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <StepIndicator currentStep={currentStep} totalSteps={steps.length} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <FormSection
          title={steps[currentStep].title}
          description={steps[currentStep].description}
          icon={steps[currentStep].icon}
        >
          {steps[currentStep].content}
        </FormSection>

        <div className="flex justify-between mt-6">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 flex items-center text-gray-700 hover:text-pink-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/dashboard/advertise")}
              className="px-4 py-2 flex items-center text-gray-700 hover:text-pink-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back to Ads</span>
            </button>
          )}

          <button
            type="submit"
            disabled={uploading}
            className={`px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg 
              hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-70 
              flex items-center gap-2`}
          >
            {uploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Save className="w-4 h-4" />
                <span>
                  {isEditing ? "Update Advertisement" : "Create Advertisement"}
                </span>
              </>
            ) : (
              <span>Next</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
