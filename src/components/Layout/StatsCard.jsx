// src/components/Layout/StatsCard.jsx
import React from "react";

const StatsCard = ({ 
  icon: Icon,   // <-- can be an icon component
  number, 
  label, 
  bgColor = "bg-white",
  iconBg = "bg-gray-100",
  textColor = "text-gray-900",
  labelColor = "text-gray-600",
  className = ""
}) => (
  <div
    className={`${bgColor} rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-300 hover:border-gray-200 ${className}`}
  >
    <div className="flex flex-col sm:flex-row items-center justify-evenly gap-4">
      <div className={`${iconBg} w-16 h-16 rounded-xl flex items-center justify-center shadow-sm`}>
        {Icon ? (
          typeof Icon === "string" ? (
            <img src={Icon} alt={label || "stat icon"} className="w-10 h-10 object-contain" />
          ) : (
            <Icon className="w-10 h-10 " /> 
          )
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
        )}
      </div>
      <div className="text-center sm:text-right">
        <div className={`text-2xl sm:text-3xl font-bold ${textColor} mb-1`}>
          {typeof number === "number" ? number.toLocaleString() : number}
        </div>
        {label && <div className={`text-sm ${labelColor} font-medium`}>{label}</div>}
      </div>
    </div>
  </div>
);

export default StatsCard;
