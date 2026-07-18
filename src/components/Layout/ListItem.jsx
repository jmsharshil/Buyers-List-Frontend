import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import InfoTooltip from "./InfoTooltip";

// Minimal country map for ISO codes
// You can expand this or replace with a full ISO map later
const countryCodeMap = {
  "United States": "US",
  India: "IN",
  "United Kingdom": "GB",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Japan: "JP",
  China: "CN",
  Brazil: "BR",
};

const ListItem = ({ name, count, percentage, color }) => {
  // Handle variations for TSA countries
  const getNormalizedName = (countryName) => {
    if (!countryName) return "";
    let cleanName = countryName.replace(" (Primary)", "").trim();
    if (cleanName === "United States of America") cleanName = "United States";
    return cleanName;
  };

  const code = countryCodeMap[getNormalizedName(name)] || countryCodeMap[name];

  const spanRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (spanRef.current) {
      const truncated = spanRef.current.scrollWidth > spanRef.current.clientWidth;
      setIsTruncated(truncated);
      if (truncated) {
        const rect = spanRef.current.getBoundingClientRect();
        setTooltipCoords({
          top: rect.bottom,
          left: rect.left + rect.width / 2,
        });
        setShowTooltip(true);
      }
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className="flex items-center text-sm overflow-visible py-2 hover:bg-gray-100 rounded-md px-2 -mx-2 transition-colors duration-150"
      role="listitem"
    >
      {/* Flag or Dot */}
      <div className="flex-shrink-0 mr-3">
        {code ? (
          <img
            src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
            alt={`${name} flag`}
            className="h-5 "
          />
        ) : (
          <span
            className="w-3 h-3 rounded-full inline-block shadow-sm"
            style={{ backgroundColor: color }}
          ></span>
        )}
      </div>

      {/* Country Name */}
      <div className="flex-grow min-w-0 mr-4 flex items-center">
        <div
          className="relative flex items-center min-w-0 cursor-default"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span
            ref={spanRef}
            className={`text-sm md:text-base font-medium text-gray-900 truncate ${isTruncated ? "cursor-pointer" : ""}`}
          >
            {name}
          </span>

          {/* Portal Tooltip for truncated names */}
          {isTruncated && showTooltip && createPortal(
            <div
              className="fixed z-[9999] pointer-events-none transition-opacity duration-200"
              style={{
                top: `${tooltipCoords.top + 8}px`,
                left: `${tooltipCoords.left}px`,
                transform: "translateX(-50%)",
              }}
            >
              {/* Tooltip for desktop */}
              <div className="hidden md:block w-max max-w-[220px]">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                  <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-b-[6px] border-b-gray-800"></div>
                </div>
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words text-center">
                  {name}
                </div>
              </div>

              {/* Tooltip for mobile */}
              <div className="md:hidden max-w-[200px]">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                  <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-b-[6px] border-b-gray-800"></div>
                </div>
                <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words whitespace-normal text-center">
                  {name}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
        {name === "Others" && (
          <InfoTooltip message="It includes all countries across mainland Europe except the UK, and all developed nations in Asia excluding Australia and Israel." />
        )}
      </div>

      {/* Count + Progress Bar */}
      <div className="flex-shrink-0 flex items-center space-x-3">
        <span className="font-semibold text-sm md:text-base text-gray-700 text-right min-w-[60px]">
          {count.toLocaleString()}
        </span>
        <div className="w-16 md:w-20 h-2.5 bg-gray-200 rounded-full shadow-inner">
          <div
            className="h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
