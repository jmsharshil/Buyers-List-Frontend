import React from "react";

const baseClasses = "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer";

const variants = {
  primary: {
    enabled: "bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600",
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
  },
  success: {
    enabled: "bg-green-600 text-white hover:bg-green-700 border border-green-600",
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
  },
  danger: {
    enabled: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
  },
  neutral: {
    enabled: "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300",
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
  },
};

const ExportButton = ({ label, onClick, disabled = false, variant = "success", count }) => {
  const v = variants[variant] || variants.success;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabled ? v.disabled : v.enabled}`}
      type="button"
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/20 border border-white/40">
          {count}
        </span>
      )}
    </button>
  );
};

export default ExportButton;

