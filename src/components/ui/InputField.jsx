// src/components/ui/InputField.jsx
import React from "react";

const InputField = ({ label, type = "text", value, onChange, options, placeholder, required = false }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === "select" ? (
        <select
          value={value}
          onChange={onChange}
          className="mt-2 block w-full p-3 border rounded-lg border-gray-200  bg-gray-50"
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-2 block w-full p-3 border border-gray-200 rounded-lg  bg-gray-50"
          required={required}
        />
      )}
    </div>
  );
};

export default InputField;