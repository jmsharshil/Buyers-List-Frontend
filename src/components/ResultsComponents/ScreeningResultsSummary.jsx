import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import StatsCard from "../Layout/StatsCard";
import { Database, Layers, Factory, Globe2, MessageSquarePlus } from "lucide-react"; // ✅ icons

const ScreeningResultsSummary = ({ setIsFeedbackOpen }) => {
  const location = useLocation();
  const category = location.pathname.includes("tsa") ? "tsa" : "gpc";

  const { results: gpcResults } = useSelector((state) => state.screeningCriteria);
  const { results: tsaResults } = useSelector((state) => state.tsaScreeningCriteria);

  const activeResults = category === "tsa" ? tsaResults : gpcResults;

  const summaryData = [
    {
      icon: Database,
      number: activeResults?.count || 0,
      label: "Total Results",
      bgColor: "bg-violet-50",
      iconBg: "bg-violet-100",
    },
    {
      icon: Globe2,
      number: activeResults?.counts?.countries || 0,
      label: "By Country",
      bgColor: "bg-sky-50",
      iconBg: "bg-sky-100",
    },
    {
      icon: Layers,
      number: activeResults?.counts?.sectors || 0,
      label: "Primary Sectors",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
      show: category !== "tsa",
    },
    {
      icon: Factory,
      number: activeResults?.counts?.industries || 0,
      label: "Primary Industries",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
      show: true,
    },
  ].filter((item) => item.show !== false);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-400 shadow-sm font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white w-12 h-12 flex items-center justify-center rounded-lg">
            <Database className="w-6 h-6" /> {/* replaced logo with icon */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Screening Summary
            </h1>
            <p className="text-md text-gray-600">
              Total results across all categories
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${category === "tsa" ? "lg:grid-cols-3" : "lg:grid-cols-4" } gap-6`}>
        {summaryData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default ScreeningResultsSummary;
