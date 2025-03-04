export const RadioGroup = ({ name, options, value, onChange, label }) => (
    <div className="space-y-2">
      <label className="block font-medium">{label}</label>
      <div className="flex gap-4">
        {options.map(option => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="form-radio"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
  