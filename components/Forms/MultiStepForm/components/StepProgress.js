import { Check } from "lucide-react";

export const StepProgress = ({ steps, currentStep }) => (
  <div className="mt-8 mb-12">
    <div className="relative">
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />
      <div
        className="absolute top-5 left-0 h-1 bg-[#e71c5d] transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />
      <div className="relative flex justify-between">
        {steps.map((s) => (
          <div key={s.id} className="relative flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-white
              ${
                currentStep > s.id
                  ? "border-[#e71c5d] bg-[#e71c5d] text-[#e71c5d]"
                  : currentStep === s.id
                  ? "border-[#e71c5d] text-[#e71c5d]"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              {currentStep > s.id ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{s.id}</span>
              )}
            </div>
            <div
              className={`mt-2 text-xs font-medium ${
                currentStep >= s.id ? "text-[#e71c5d]" : "text-gray-500"
              }`}
            >
              {s.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
