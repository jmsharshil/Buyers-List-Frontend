import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * props:
 * - label (optional)
 * - options (array)
 * - value
 * - onChange
 * - searchable (bool)
 * - compact (bool)
 * - multiselect (bool)
 */
const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  searchable = false,
  compact = false,
  multiselect = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const isPlaceholderOption = (opt) => {
    if (typeof opt !== "string") return false;
    const lower = opt.toLowerCase();
    return lower.includes("select") || lower.includes("loading") || lower.includes("choose");
  };

  const placeholder = options[0] && isPlaceholderOption(options[0]) ? options[0] : "Select...";

  const displayValue = () => {
    if (multiselect) {
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div className="flex flex-wrap gap-2 mr-2">
            {value.map((item) => (
              <div
                key={item}
                className="truncate inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                <span className="truncate">{item}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((v) => v !== item));
                  }}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  type="button"
                >
                  <X className="w-3.5 h-3.5 cursor-pointer" />
                </button>
              </div>
            ))}
          </div>
        );
      }
      return placeholder;
    }
    return value && value !== "" ? value : placeholder;
  };

  const hasValue = multiselect
    ? Array.isArray(value) && value.length > 0
    : value && value !== "";

  const filtered = searchable
    ? options.filter((o) =>
        String(o).toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="my-2 relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative flex items-center ">
        <button
          type="button"
          onClick={() => setIsOpen((s) => !s)}
          className={`flex-1 flex items-start justify-between px-5 cursor-pointer ${
            compact ? "py-2" : "py-3"
          } rounded-lg focus:outline-none ${
            compact ? "bg-gray-200" : "bg-white"
          } border border-gray-200 text-sm overflow-hidden ${
            multiselect && hasValue ? "content-start gap-2" : ""
          }`}
        >
          <span
            className={`truncate text-left mr-2 ${
              hasValue ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {displayValue()}
          </span>
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            } ${multiselect && hasValue ? "self-start mt-1" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 rounded-md border border-gray-100 text-sm focus:outline-none"
                />
              </div>
            )}
            <div className="max-h-48 overflow-auto">
              {/* Clear Selection Option */}
              <button
                type="button"
                onClick={() => {
                  onChange(multiselect ? [] : "");
                  setIsOpen(false);
                  setSearch("");
                }}
                className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-500 italic border-b border-gray-100"
              >
                Clear Selection
              </button>

              {filtered
                .filter((opt) => opt !== placeholder) // exclude placeholder option
                .map((opt) => {
                  const isSelected = multiselect
                    ? Array.isArray(value) && value.includes(opt)
                    : value === opt;

                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => {
                        if (multiselect) {
                          const currentValue = Array.isArray(value)
                            ? value
                            : [];
                          if (currentValue.includes(opt)) {
                            onChange(
                              currentValue.filter((item) => item !== opt),
                            );
                          } else {
                            onChange([...currentValue, opt]);
                          }
                        } else {
                          onChange(opt);
                          setIsOpen(false);
                          setSearch("");
                        }
                      }}
                      className={`cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center justify-between ${
                        isSelected && multiselect
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {multiselect && isSelected && (
                        <X className="w-3.5 h-3.5 cursor-pointer" />
                      )}
                    </button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
