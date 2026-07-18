// import React, { useState, useRef, useEffect } from "react";

// const CustomDatePicker = ({ 
//   label, 
//   value, 
//   onChange, 
//   placeholder = "Select date",
//   min,
//   max
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [tempDate, setTempDate] = useState(value || "");
//   const [displayValue, setDisplayValue] = useState("");
//   const [view, setView] = useState("days"); // days, months, years
//   const [yearRange, setYearRange] = useState({ start: 2020, end: 2030 });
//   const [focusedDay, setFocusedDay] = useState(null);
//   const datePickerRef = useRef(null);
//   const inputRef = useRef(null);

//   // Format date for display (dd/mm/yyyy)
//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "";
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = String(date.getFullYear());
//     return `${day}/${month}/${year}`;
//   };

//   // Format date for API (dd-mm-yyyy)
//   const formatDateForAPI = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "";
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = String(date.getFullYear());
//     return `${day}-${month}-${year}`;
//   };

//   // Convert display format (dd/mm/yyyy) back to ISO format (yyyy-mm-dd)
//   const convertToISOFormat = (displayDateString) => {
//     if (!displayDateString) return "";
//     const parts = displayDateString.split('/');
//     if (parts.length !== 3) return "";
//     const [day, month, year] = parts;
//     return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//   };

//   // Initialize display value and set up initial date
//   useEffect(() => {
//     if (value) {
//       setDisplayValue(formatDateForDisplay(value));
//       setTempDate(value);
//       // Set initial focused day to selected date or today
//       const initialDate = value ? new Date(value) : new Date();
//       setFocusedDay(initialDate.toISOString().split('T')[0]);
//     } else {
//       setDisplayValue("");
//       setTempDate("");
//       const today = new Date();
//       setFocusedDay(today.toISOString().split('T')[0]);
//       // Set tempDate to today if no value provided, to ensure calendar shows current month
//       if (!value) {
//         setTempDate(today.toISOString().split('T')[0]);
//       }
//     }
//   }, [value]);

//   // Handle keyboard navigation
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (e) => {
//       if (view !== "days") return;

//       const currentDate = focusedDay ? new Date(focusedDay) : new Date();
      
//       switch (e.key) {
//         case 'ArrowLeft':
//           e.preventDefault();
//           currentDate.setDate(currentDate.getDate() - 1);
//           setFocusedDay(currentDate.toISOString().split('T')[0]);
//           break;
//         case 'ArrowRight':
//           e.preventDefault();
//           currentDate.setDate(currentDate.getDate() + 1);
//           setFocusedDay(currentDate.toISOString().split('T')[0]);
//           break;
//         case 'ArrowUp':
//           e.preventDefault();
//           currentDate.setDate(currentDate.getDate() - 7);
//           setFocusedDay(currentDate.toISOString().split('T')[0]);
//           break;
//         case 'ArrowDown':
//           e.preventDefault();
//           currentDate.setDate(currentDate.getDate() + 7);
//           setFocusedDay(currentDate.toISOString().split('T')[0]);
//           break;
//         case 'Enter':
//           e.preventDefault();
//           if (!isDisabled(currentDate)) {
//             handleDateSelect(currentDate.toISOString().split('T')[0]);
//           }
//           break;
//         case 'Escape':
//           e.preventDefault();
//           setIsOpen(false);
//           setView("days");
//           if (inputRef.current) {
//             inputRef.current.focus();
//           }
//           break;
//         default:
//           break;
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [isOpen, view, focusedDay, tempDate]);

//   // Handle click outside to close picker
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (datePickerRef.current && !datePickerRef.current.contains(event.target) && 
//           inputRef.current && !inputRef.current.contains(event.target)) {
//         if (isOpen) {
//           // Only send update if the date actually changed
//           if (tempDate !== value) {
//             setDisplayValue(formatDateForDisplay(tempDate));
//             onChange({ target: { value: tempDate } });
//           }
//           setIsOpen(false);
//           setView("days"); // Reset view when closing
//         }
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen, tempDate, value, onChange]);

//   const handleInputChange = (e) => {
//     const inputValue = e.target.value;
//     setDisplayValue(inputValue);
    
//     // Try to parse manual input
//     const isoDate = convertToISOFormat(inputValue);
//     if (isoDate) {
//       setTempDate(isoDate);
//     }
//   };

//   const handleDateSelect = (date) => {
//     setTempDate(date);
//     setFocusedDay(date);
//   };

//   const handleInputClick = () => {
//     setIsOpen(true);
//     // Ensure we have a date to display when opening
//     if (!tempDate) {
//       const today = new Date();
//       setTempDate(today.toISOString().split('T')[0]);
//       setFocusedDay(today.toISOString().split('T')[0]);
//     }
//   };

//   const handleClear = () => {
//     setTempDate("");
//     setDisplayValue("");
//     setFocusedDay(new Date().toISOString().split('T')[0]);
//     onChange({ target: { value: "" } });
//     setIsOpen(false);
//   };

//   // Generate calendar days
//   const generateCalendarDays = () => {
//     // Use tempDate if available, otherwise use today
//     const dateToUse = tempDate || new Date().toISOString().split('T')[0];
//     const date = new Date(dateToUse);
//     const year = date.getFullYear();
//     const month = date.getMonth();
    
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const startDate = new Date(firstDay);
//     startDate.setDate(startDate.getDate() - firstDay.getDay());
    
//     const days = [];
//     const currentDate = new Date(startDate);
    
//     while (days.length < 42) {
//       days.push(new Date(currentDate));
//       currentDate.setDate(currentDate.getDate() + 1);
//     }
    
//     return days;
//   };

//   // Generate months
//   const generateMonths = () => {
//     return Array.from({ length: 12 }, (_, i) => {
//       const date = new Date(2021, i, 1);
//       return {
//         name: date.toLocaleString('default', { month: 'short' }),
//         fullName: date.toLocaleString('default', { month: 'long' }),
//         index: i
//       };
//     });
//   };

//   // Generate years
//   const generateYears = () => {
//     const years = [];
//     for (let year = yearRange.start; year <= yearRange.end; year++) {
//       years.push(year);
//     }
//     return years;
//   };

//   const navigateMonth = (direction) => {
//     const dateToUse = tempDate || new Date().toISOString().split('T')[0];
//     const date = new Date(dateToUse);
//     date.setMonth(date.getMonth() + direction);
//     setTempDate(date.toISOString().split('T')[0]);
    
//     // Also update focused day
//     const focused = new Date(focusedDay || dateToUse);
//     focused.setMonth(focused.getMonth() + direction);
//     setFocusedDay(focused.toISOString().split('T')[0]);
//   };

//   const navigateYear = (direction) => {
//     const dateToUse = tempDate || new Date().toISOString().split('T')[0];
//     const date = new Date(dateToUse);
//     date.setFullYear(date.getFullYear() + direction);
//     setTempDate(date.toISOString().split('T')[0]);
    
//     // Also update focused day
//     const focused = new Date(focusedDay || dateToUse);
//     focused.setFullYear(focused.getFullYear() + direction);
//     setFocusedDay(focused.toISOString().split('T')[0]);
//   };

//   const navigateYearRange = (direction) => {
//     const rangeSize = 10;
//     setYearRange(prev => ({
//       start: prev.start + (direction * rangeSize),
//       end: prev.end + (direction * rangeSize)
//     }));
//   };

//   const selectMonth = (monthIndex) => {
//     const dateToUse = tempDate || new Date().toISOString().split('T')[0];
//     const date = new Date(dateToUse);
//     date.setMonth(monthIndex);
//     setTempDate(date.toISOString().split('T')[0]);
//     setView("days");
    
//     // Also update focused day
//     const focused = new Date(focusedDay || dateToUse);
//     focused.setMonth(monthIndex);
//     setFocusedDay(focused.toISOString().split('T')[0]);
//   };

//   const selectYear = (year) => {
//     const dateToUse = tempDate || new Date().toISOString().split('T')[0];
//     const date = new Date(dateToUse);
//     date.setFullYear(year);
//     setTempDate(date.toISOString().split('T')[0]);
//     setView("days");
    
//     // Also update focused day
//     const focused = new Date(focusedDay || dateToUse);
//     focused.setFullYear(year);
//     setFocusedDay(focused.toISOString().split('T')[0]);
//   };

//   const isSameDay = (date1, date2) => {
//     if (!date1 || !date2) return false;
//     return date1.toDateString() === date2.toDateString();
//   };

//   const isToday = (date) => {
//     return isSameDay(date, new Date());
//   };

//   const isSelected = (date) => {
//     if (!tempDate) return false;
//     const selectedDate = new Date(tempDate);
//     return isSameDay(date, selectedDate);
//   };

//   const isFocused = (date) => {
//     if (!focusedDay) return false;
//     return isSameDay(date, new Date(focusedDay));
//   };

//   const isDisabled = (date) => {
//     if (min && date < new Date(min)) return true;
//     if (max && date > new Date(max)) return true;
//     return false;
//   };

//   return (
//     <div className="mb-4 relative">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           {label}
//         </label>
//       )}
//       <div className="relative">
//         <input
//           ref={inputRef}
//           type="text"
//           value={displayValue}
//           onChange={handleInputChange}
//           onClick={handleInputClick}
//           placeholder={placeholder}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer transition-all duration-200 shadow-sm hover:border-gray-400"
//           readOnly={!isOpen}
//         />
//         {value && (
//           <button
//             onClick={handleClear}
//             className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         )}
//         <button
//           onClick={handleInputClick}
//           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//           </svg>
//         </button>
//       </div>

//       {isOpen && (
//         <div 
//           ref={datePickerRef}
//           className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg w-72 overflow-hidden"
//         >
//           {view === "days" && (
//             <>
//               {/* Calendar Header */}
//               <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
//                 <button 
//                   onClick={() => navigateMonth(-1)}
//                   className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                   aria-label="Previous month"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//                 <div className="flex space-x-1">
//                   <button 
//                     onClick={() => setView("months")}
//                     className="font-medium text-gray-700 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors duration-200"
//                     aria-label="Select month"
//                   >
//                     {tempDate ? new Date(tempDate).toLocaleDateString('en-US', { month: 'short' }) : new Date().toLocaleDateString('en-US', { month: 'short' })}
//                   </button>
//                   <button 
//                     onClick={() => setView("years")}
//                     className="font-medium text-gray-700 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors duration-200"
//                     aria-label="Select year"
//                   >
//                     {tempDate ? new Date(tempDate).getFullYear() : new Date().getFullYear()}
//                   </button>
//                 </div>
//                 <button 
//                   onClick={() => navigateMonth(1)}
//                   className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                   aria-label="Next month"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Week Days */}
//               <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
//                 {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
//                   <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1.5">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Calendar Days */}
//               <div className="grid grid-cols-7 gap-1 p-2">
//                 {generateCalendarDays().map((day, index) => {
//                   // Create a consistent key using the date string to avoid selection issues
//                   const dateKey = day.toISOString().split('T')[0];
//                   return (
//                     <button
//                       key={dateKey}
//                       onClick={() => !isDisabled(day) && handleDateSelect(dateKey)}
//                       onMouseEnter={() => setFocusedDay(dateKey)}
//                       disabled={isDisabled(day)}
//                       className={`text-sm p-1.5 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-all duration-200 relative
//                         ${isDisabled(day) ? 'text-gray-300 cursor-not-allowed' : ''}
//                         ${isToday(day) && !isSelected(day) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
//                         ${isSelected(day) ? 'bg-indigo-600 text-white font-semibold shadow-sm' : ''}
//                         ${!isDisabled(day) && !isSelected(day) && !isToday(day) ? 'hover:bg-gray-100 text-gray-700' : ''}
//                         ${isFocused(day) && !isSelected(day) ? 'ring-2 ring-indigo-300 ring-opacity-50' : ''}
//                       `}
//                       aria-label={`Select ${day.toDateString()}`}
//                     >
//                       {day.getDate()}
//                     </button>
//                   );
//                 })}
//               </div>
//             </>
//           )}

//           {view === "months" && (
//             <>
//               {/* Month Header */}
//               <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
//                 <button 
//                   onClick={() => navigateYear(-1)}
//                   className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                   aria-label="Previous year"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//                 <button 
//                   onClick={() => setView("years")}
//                   className="font-semibold text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors duration-200"
//                   aria-label="Select year"
//                 >
//                   {tempDate ? new Date(tempDate).getFullYear() : new Date().getFullYear()}
//                 </button>
//                 <button 
//                   onClick={() => navigateYear(1)}
//                   className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                   aria-label="Next year"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Months Grid */}
//               <div className="grid grid-cols-3 gap-2 p-3">
//                 {generateMonths().map((month) => (
//                   <button
//                     key={month.index}
//                     onClick={() => selectMonth(month.index)}
//                     className={`text-sm p-2 rounded-lg text-center transition-all duration-200
//                       ${(tempDate || focusedDay) && new Date(tempDate || focusedDay).getMonth() === month.index 
//                         ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
//                         : 'hover:bg-gray-100 text-gray-700'}
//                     `}
//                     aria-label={`Select ${month.fullName}`}
//                   >
//                     {month.name}
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}

//           {view === "years" && (
//             <>
//               {/* Year Header */}
//               <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
//                 <button 
//                   onClick={() => navigateYearRange(-1)}
//                   className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                   aria-label="Previous year range"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//                 <span className="font-semibold text-gray-700">
//                   {yearRange.start} - {yearRange.end}
//                 </span>
//                 <button 
//                   onClick={() => navigateYearRange(1)}
//                   className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
//                   aria-label="Next year range"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Years Grid */}
//               <div className="grid grid-cols-3 gap-2 p-3">
//                 {generateYears().map((year) => (
//                   <button
//                     key={year}
//                     onClick={() => selectYear(year)}
//                     className={`text-sm p-2 rounded-lg text-center transition-all duration-200
//                       ${(tempDate || focusedDay) && new Date(tempDate || focusedDay).getFullYear() === year 
//                         ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
//                         : 'hover:bg-gray-100 text-gray-700'}
//                     `}
//                     aria-label={`Select year ${year}`}
//                   >
//                     {year}
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}

//           {/* Footer */}
//           <div className="flex justify-between p-3 border-t border-gray-200 bg-gray-50">
//             <button
//               onClick={handleClear}
//               className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
//               aria-label="Clear date"
//             >
//               Clear
//             </button>
//             <button
//               onClick={() => {
//                 setDisplayValue(formatDateForDisplay(tempDate));
//                 // Pass the date in dd-mm-yyyy format for API
//                 onChange({ target: { value: formatDateForAPI(tempDate) } });
//                 setIsOpen(false);
//                 setView("days"); // Reset view when applying
//               }}
//               className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 shadow-sm"
//               aria-label="Apply date"
//             >
//               Apply
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
;

// export default CustomDatePicker;

import React, { useState, useRef, useEffect } from "react";

const CustomDatePicker = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Select date",
  min,
  max
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value || "");
  const [displayValue, setDisplayValue] = useState("");
  const [view, setView] = useState("days");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedDay, setFocusedDay] = useState(null);
  const datePickerRef = useRef(null);
  const inputRef = useRef(null);

  // Create date string in local timezone (YYYY-MM-DD format)
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse date string safely in local timezone
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = parseLocalDate(dateString);
    if (!date || isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  // Format date for API (dd-mm-yyyy)
  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const date = parseLocalDate(dateString);
    if (!date || isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  // Convert display format (dd/mm/yyyy) to internal format (yyyy-mm-dd)
  const convertToLocalFormat = (displayDateString) => {
    if (!displayDateString) return "";
    const parts = displayDateString.split('/');
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Initialize display value
  useEffect(() => {
    if (value) {
      // Handle API format (dd-mm-yyyy) conversion to internal format
      let internalValue = value;
      if (value.includes('-')) {
        const parts = value.split('-');
        if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
          // Convert dd-mm-yyyy to yyyy-mm-dd
          internalValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      setDisplayValue(formatDateForDisplay(internalValue));
      setTempDate(internalValue);
      const date = parseLocalDate(internalValue);
      if (date) {
        setCurrentMonth(date);
        setFocusedDay(internalValue);
      }
    } else {
      setDisplayValue("");
      setTempDate("");
      const today = new Date();
      setCurrentMonth(today);
      setFocusedDay(getLocalDateString(today));
    }
  }, [value]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || view !== "days") return;

    const handleKeyDown = (e) => {
      const current = focusedDay ? parseLocalDate(focusedDay) : new Date();
      if (!current) return;
       
      let newDate;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newDate = new Date(current);
          newDate.setDate(newDate.getDate() - 1);
          setFocusedDay(getLocalDateString(newDate));
          setCurrentMonth(newDate);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newDate = new Date(current);
          newDate.setDate(newDate.getDate() + 1);
          setFocusedDay(getLocalDateString(newDate));
          setCurrentMonth(newDate);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newDate = new Date(current);
          newDate.setDate(newDate.getDate() - 7);
          setFocusedDay(getLocalDateString(newDate));
          setCurrentMonth(newDate);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newDate = new Date(current);
          newDate.setDate(newDate.getDate() + 7);
          setFocusedDay(getLocalDateString(newDate));
          setCurrentMonth(newDate);
          break;
        case 'Enter':
          e.preventDefault();
          if (!isDisabled(current)) {
            handleDateSelect(getLocalDateString(current));
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setView("days");
          inputRef.current?.focus();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, view, focusedDay]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        if (isOpen) {
          setIsOpen(false);
          setView("days");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    const localDate = convertToLocalFormat(inputValue);
    if (localDate) {
      const date = parseLocalDate(localDate);
      if (date && !isNaN(date.getTime())) {
        setTempDate(localDate);
        setCurrentMonth(date);
      }
    }
  };

  const handleDateSelect = (dateString) => {
    setTempDate(dateString);
    setFocusedDay(dateString);
    const date = parseLocalDate(dateString);
    if (date) {
      setCurrentMonth(date);
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
    if (!tempDate) {
      const today = new Date();
      const todayStr = getLocalDateString(today);
      setTempDate(todayStr);
      setFocusedDay(todayStr);
      setCurrentMonth(today);
    }
  };

  const handleClear = () => {
    setTempDate("");
    setDisplayValue("");
    const today = new Date();
    setFocusedDay(getLocalDateString(today));
    setCurrentMonth(today);
    onChange({ target: { value: "" } });
    setIsOpen(false);
  };

  const handleApply = () => {
    if (tempDate) {
      setDisplayValue(formatDateForDisplay(tempDate));
      onChange({ target: { value: formatDateForAPI(tempDate) } });
    }
    setIsOpen(false);
    setView("days");
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      name: new Date(2021, i, 1).toLocaleString('default', { month: 'short' }),
      fullName: new Date(2021, i, 1).toLocaleString('default', { month: 'long' }),
      index: i
    }));
  };

  const generateYears = () => {
    const currentYear = currentMonth.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    return Array.from({ length: 12 }, (_, i) => startYear - 1 + i);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const navigateYear = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(newMonth.getFullYear() + direction);
    setCurrentMonth(newMonth);
  };

  const navigateYearRange = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(newMonth.getFullYear() + (direction * 10));
    setCurrentMonth(newMonth);
  };

  const selectMonth = (monthIndex) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(monthIndex);
    setCurrentMonth(newMonth);
    setView("days");
    
    // If we already have a selected date, update it to the new month while keeping the same day
    if (tempDate) {
      const selectedDate = parseLocalDate(tempDate);
      if (selectedDate) {
        const newDate = new Date(newMonth);
        newDate.setDate(selectedDate.getDate());
        // Check if the day exists in the new month (e.g., Jan 31 -> Feb might need to adjust)
        if (newDate.getMonth() !== newMonth.getMonth()) {
          // Day doesn't exist in new month, set to last day of new month
          newDate.setDate(0); // This sets to last day of previous month (which is newMonth)
        }
        setTempDate(getLocalDateString(newDate));
        setFocusedDay(getLocalDateString(newDate));
      }
    }
  };

  const selectYear = (year) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(year);
    setCurrentMonth(newMonth);
    setView("days");
    
    // If we already have a selected date, update it to the new year while keeping the same month and day
    if (tempDate) {
      const selectedDate = parseLocalDate(tempDate);
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(year);
        // Check if the date is valid (e.g., Feb 29 in a non-leap year)
        if (newDate.getMonth() !== selectedDate.getMonth()) {
          // Date doesn't exist in new year (like Feb 29 in non-leap year), set to last day of Feb
          newDate.setDate(0);
        }
        setTempDate(getLocalDateString(newDate));
        setFocusedDay(getLocalDateString(newDate));
      }
    }
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isToday = (date) => isSameDay(date, new Date());

  const isSelected = (date) => {
    if (!tempDate) return false;
    const selected = parseLocalDate(tempDate);
    return selected && isSameDay(date, selected);
  };

  const isFocused = (date) => {
    if (!focusedDay) return false;
    const focused = parseLocalDate(focusedDay);
    return focused && isSameDay(date, focused);
  };

  const isDisabled = (date) => {
    if (min) {
      const minDate = parseLocalDate(min);
      if (minDate && date < minDate) return true;
    }
    if (max) {
      const maxDate = parseLocalDate(max);
      if (maxDate && date > maxDate) return true;
    }
    return false;
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <div className="mb-4 relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer transition-all duration-200 shadow-sm hover:border-gray-400"
          readOnly={!isOpen}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Clear date"
          >

          </button>
        )}
        <button
          type="button"
          onClick={handleInputClick}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors duration-200"
          aria-label="Open calendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          ref={datePickerRef}
          className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg w-72 overflow-hidden"
        >
          {view === "days" && (
            <>
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <button 
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                  aria-label="Previous month"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex space-x-1">
                  <button 
                    type="button"
                    onClick={() => setView("months")}
                    className="font-medium text-gray-700 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors duration-200"
                  >
                    {currentMonth.toLocaleDateString('en-US', { month: 'short' })}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setView("years")}
                    className="font-medium text-gray-700 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors duration-200"
                  >
                    {currentMonth.getFullYear()}
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                  aria-label="Next month"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1.5">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 p-2">
                {generateCalendarDays().map((day) => {
                  const dateKey = getLocalDateString(day);
                  const isOtherMonth = !isCurrentMonth(day);
                  
                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => !isDisabled(day) && handleDateSelect(dateKey)}
                      onMouseEnter={() => setFocusedDay(dateKey)}
                      disabled={isDisabled(day)}
                      className={`text-sm p-1.5 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-all duration-200
                        ${isDisabled(day) ? 'text-gray-300 cursor-not-allowed' : ''}
                        ${isOtherMonth && !isSelected(day) ? 'text-gray-400' : ''}
                        ${isToday(day) && !isSelected(day) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                        ${isSelected(day) ? 'bg-indigo-600 text-white font-semibold shadow-md' : ''}
                        ${!isDisabled(day) && !isSelected(day) && !isToday(day) ? 'hover:bg-gray-100' : ''}
                        ${isFocused(day) && !isSelected(day) ? 'ring-2 ring-indigo-300' : ''}
                      `}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {view === "months" && (
            <>
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <button 
                  type="button"
                  onClick={() => navigateYear(-1)}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  type="button"
                  onClick={() => setView("years")}
                  className="font-semibold text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors duration-200"
                >
                  {currentMonth.getFullYear()}
                </button>
                <button 
                  type="button"
                  onClick={() => navigateYear(1)}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                {generateMonths().map((month) => (
                  <button
                    key={month.index}
                    type="button"
                    onClick={() => selectMonth(month.index)}
                    className={`text-sm p-2 rounded-lg text-center transition-all duration-200
                      ${currentMonth.getMonth() === month.index 
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                        : 'hover:bg-gray-100 text-gray-700'}
                    `}
                  >
                    {month.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {view === "years" && (
            <>
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <button 
                  type="button"
                  onClick={() => navigateYearRange(-1)}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold text-gray-700">
                  {generateYears()[0]} - {generateYears()[11]}
                </span>
                <button 
                  type="button"
                  onClick={() => navigateYearRange(1)}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                {generateYears().map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`text-sm p-2 rounded-lg text-center transition-all duration-200
                      ${currentMonth.getFullYear() === year 
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm' 
                        : 'hover:bg-gray-100 text-gray-700'}
                    `}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-between p-3 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;

// Demo Component
// export default function App() {
//   const [selectedDate, setSelectedDate] = useState("");

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
//       <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Custom Date Picker</h1>
        
//         <CustomDatePicker
//           label="Select a date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           placeholder="dd/mm/yyyy"
//         />
        
//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <p className="text-sm text-gray-600">Selected date (API format):</p>
//           <p className="text-lg font-semibold text-indigo-600 mt-1">
//             {selectedDate || "No date selected"}
//           </p>
//         </div>
//       </div>
//     </div>
