// components/Forms/MultiStepForm/components/FormSection.js
export const FormSection = ({ children, title }) => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-4">
        {children}
      </div>
    </div>
  );
  
  // components/Forms/MultiStepForm/components/RadioGroup.js

  // components/Forms/MultiStepForm/components/StepProgress.js
 