import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import Dropdown from "./Dropdown";
import { fetchCountries } from "../../store/slice/databaseOverviewSlice";

const TooltipDropdownWrapper = ({ children, text }) => {
  const containerRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

  const handleMouseOver = (e) => {
    if (containerRef.current) {
      const button = containerRef.current.querySelector("button");
      if (button && button.contains(e.target)) {
        const span = button.querySelector("span.truncate");
        if (span) {
          const truncated = span.scrollWidth > span.clientWidth;
          setIsTruncated(truncated);
          if (truncated) {
            const rect = span.getBoundingClientRect();
            setTooltipCoords({
              top: rect.bottom,
              left: rect.left + rect.width / 2,
            });
            setShowTooltip(true);
          }
        }
      } else {
        setShowTooltip(false);
      }
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = () => {
    setShowTooltip(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="w-full"
    >
      {children}
      {isTruncated &&
        showTooltip &&
        createPortal(
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
                {text}
              </div>
            </div>

            {/* Tooltip for mobile */}
            <div className="md:hidden max-w-[200px]">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-b-[6px] border-b-gray-800"></div>
              </div>
              <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words whitespace-normal text-center">
                {text}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const CountryCriteria = ({ countries, addCountry, updateCountry, removeCountry, category = "gpc" }) => {
  const dispatch = useDispatch();

  // Fetch countries from redux (GPC only)
  const { countries: gpcCountryOptions, loading, error } = useSelector(
    (state) => state.databaseOverview
  );

  const { tsaSummary } = useSelector(
    (state) => state.tsaDashboard
  );

  useEffect(() => {
    // Only fetch GPC countries when category is "gpc"
    if (category === "gpc" && !gpcCountryOptions?.countries?.length) {
      dispatch(fetchCountries());
    }
  }, [dispatch, category, gpcCountryOptions?.countries?.length]);

  // Resolve country list based on category
  const resolvedCountries = category === "tsa"
    ? (tsaSummary?.countries || [])
    : (gpcCountryOptions?.countries || []);

  // Create dropdown options with "Others" at the end
  const countryNames = [
    "Select Country",
    ...(resolvedCountries.map((c) => (typeof c === "string" ? c : c.name)) || []),
  ];

  if (category === "gpc" && loading) return <div>Loading countries...</div>;
  if (category === "gpc" && error) return <div>Error loading countries: {error}</div>;

  return (
    <div className="bg-blue-50 rounded-xl w-full p-6 border-2 border-blue-600">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Country Criteria
          </h2>
          {/* {totalCount !== undefined && (
            <p className="text-gray-700 text-sm">
              Total matched companies: {totalCount}
            </p>
          )} */}
        </div>

        <div className="space-y-4">
          {countries.map((c, idx) => (
            <div key={idx} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country {idx + 1}
              </label>
              
              {/* Show dropdown if not "Others" selected */}
              {c !== "Others" && !c?.startsWith("custom:") && (
                <TooltipDropdownWrapper text={c || "Select Country"}>
                  <Dropdown
                    options={countryNames}
                    value={c || "Select Country"}
                    onChange={(val) => {
                      if (val === "Others") {
                        updateCountry(idx, "custom:");
                      } else {
                        updateCountry(idx, val);
                      }
                    }}
                    compact={false}
                    searchable={true}
                  />
                </TooltipDropdownWrapper>
              )}

              {/* Show text input if "Others" is selected */}
              {(c === "Others" || c?.startsWith("custom:")) && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter custom country name"
                    value={c?.startsWith("custom:") ? c.replace("custom:", "") : ""}
                    onChange={(e) => updateCountry(idx, `custom:${e.target.value}`)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => updateCountry(idx, "")}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    ← Back to dropdown
                  </button>
                </div>
              )}

              {/* Remove button */}
              {countries.length > 1 && removeCountry && (
                <button
                  onClick={() => removeCountry(idx)}
                  className="absolute top-0 right-0 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove country"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={addCountry}
            disabled={countries.length >= 5}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg shadow transition ${
              countries.length >= 5
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add More Country
          </button>
          {countries.length >= 5 && (
            <p className="text-sm text-red-600 mt-2 text-center">
              Maximum 5 countries allowed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountryCriteria;
