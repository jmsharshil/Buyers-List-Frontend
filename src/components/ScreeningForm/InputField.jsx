import React, { useState, useEffect } from "react";
import CustomDatePicker from "../ui/CustomDatePicker";

const InputField = ({ label, placeholder, type = "text", value, onChange, multiline = false, rows = 4, min, max }) => {
  const [localValue, setLocalValue] = useState(value || "");

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleDateChange = (e) => {
    // For date inputs, we receive the formatted date directly in dd-mm-yyyy format
    setLocalValue(e.target.value);
    // Only call onChange when the date is confirmed (not on every keystroke)
    if (onChange) {
      onChange(e);
    }
  };

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
    // For non-date inputs, call onChange immediately
    if (onChange && type !== "date") {
      onChange(e);
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      {multiline ? (
        <textarea
          rows={rows}
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        />
      ) : type === "date" ? (
        <CustomDatePicker
          label=""
          value={localValue}
          onChange={handleDateChange}
          placeholder={placeholder || "dd/mm/yyyy"}
          min={min}
          max={max}
        />
      ) : (
        <input
          type={type}
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        />
      )}
    </div>
  );
};

export default InputField;