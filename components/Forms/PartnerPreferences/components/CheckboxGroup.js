// Updated CheckboxGroup.js
import React from 'react';

export const CheckboxGroup = ({ label, name, options, selected = [], onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={selected.includes(option.value)}
            onChange={onChange}
            className="rounded border-gray-300 text-[#e71c5d] focus:ring-[#e71c5d]"
          />
          <span className="text-sm text-gray-600">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);