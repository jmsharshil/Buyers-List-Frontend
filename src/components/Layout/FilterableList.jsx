import React, { useState } from "react";
import { Search } from "lucide-react";
import ListItem from "./ListItem";

const SortPill = ({ label, isActive, onClick, direction }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-xs md:text-sm font-medium rounded-md transition-colors flex items-center cursor-pointer ${
      isActive
        ? "bg-purple-600 text-white"
        : "bg-white text-black hover:bg-purple-300"
    }`}
  >
    {label}
    {isActive && (
      <span className="ml-1 ">{direction === "asc" ? "↑" : "↓"}</span>
    )}
  </button>
);

const FilterableList = ({
  title,
  subtitle,
  data,
  showSearch = false,
  showViewAllButton = false,
  viewAllText = "View All",
}) => {
  const [sortBy, setSortBy] = useState("Count");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(false);

  const maxCount = Math.max(...data.map((item) => item.count));
  const filteredAndSortedData = data
    .map((item) => ({
      ...item,
      percentage: (item.count / maxCount) * 100,
    }))
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const isAsc = sortDirection === "asc";
      if (sortBy.toLowerCase() === "name") {
        return isAsc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return isAsc ? a.count - b.count : b.count - a.count;
    });

  const displayData = expanded
    ? filteredAndSortedData
    : filteredAndSortedData.slice(0, 15);
  const remainingCount = filteredAndSortedData.length - 15;

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm flex flex-col h-[1000px] border border-gray-200">
      {/* Top Section: Header + Controls */}
      <div className="mb-4 bg-gray-100 p-4 sm:p-5 md:p-7 rounded-t-xl">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            {title} {remainingCount > 0 ? "(Top 15)" : ""}
          </h3>
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex  items-center gap-2 md:gap-3">
            <SortPill
              label="Name"
              isActive={sortBy === "Name"}
              onClick={() => {
                setSortBy("Name");
                if (sortBy === "Name") toggleSortDirection();
              }}
              direction={sortBy === "Name" ? sortDirection : null}
            />
            <SortPill
              label="Count"
              isActive={sortBy === "Count"}
              onClick={() => {
                setSortBy("Count");
                if (sortBy === "Count") toggleSortDirection();
              }}
              direction={sortBy === "Count" ? sortDirection : null}
            />
          </div>

          {showSearch && (
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                aria-label={`Search ${title}`}
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 md:py-3 border bg-white border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-2 py-3 px-4 sm:px-6 md:px-8 flex-grow overflow-y-auto">
        {displayData.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            No results found.
          </div>
        ) : (
          displayData.map((item) => (
            <ListItem
              key={item.name}
              name={item.name}
              count={item.count}
              percentage={item.percentage}
              color={item.color}
            />
          ))
        )}
      </div>

      {/* Show More Button */}
      {remainingCount > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 mb-4 mx-4 py-2.5 text-xs sm:text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer"
        >
          Show other {remainingCount} {title.toLowerCase()}
        </button>
      )}
    </div>
  );
};

export default FilterableList;
