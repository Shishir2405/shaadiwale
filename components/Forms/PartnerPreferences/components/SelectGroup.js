// Updated SelectGroup.js
import React from 'react';

export const SelectGroup = ({ 
  label, 
  name, 
  options, 
  value, 
  onChange,
  placeholder = "Select...",
  required = false 
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && '*'}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#e71c5d] focus:border-[#e71c5d] border-gray-300"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);