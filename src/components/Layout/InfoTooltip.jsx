import React from "react";
import { Info } from "lucide-react";

const InfoTooltip = ({ message, size = 16 }) => {
  return (
    <div className="relative flex items-center group">
      <Info
        className="text-gray-500 hover:text-gray-700 ml-1.5 cursor-help transition-colors duration-200"
        style={{ width: size, height: size }}
      />

      {/* Tooltip for desktop (shown below) */}
      <div className="absolute left-1/2 top-full mt-2 z-[9999] w-[220px] -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
        {/* Arrow pointing up */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2">
          <div className="border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-gray-800"></div>
        </div>

        {/* Tooltip Content */}
        <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words">
          {message}
        </div>
      </div>

      {/* Tooltip for mobile (shown right) */}
      <div className="absolute left-full top-1/2 ml-2 z-[9999] max-w-xs -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 md:hidden">
        {/* Arrow */}
        <div className="absolute right-full top-1/2 -translate-y-1/2">
          <div className="border-t-6 border-b-6 border-r-6 border-t-transparent border-b-transparent border-r-gray-800"></div>
        </div>

        {/* Tooltip Content */}
        <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words">
          {message}
        </div>
      </div>
    </div>
  );
};

export default InfoTooltip;
