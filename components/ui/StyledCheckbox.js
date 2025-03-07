"use client";

import React from "react";

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

export default StyledCheckbox;
