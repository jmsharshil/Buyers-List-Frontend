// src/pages/DatabaseOverview.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, CheckCircle, BarChart, AlertTriangle } from "lucide-react"; // Install lucide-react
import StatsCard from "../components/Layout/StatsCard";
import FilterableList from "../components/Layout/FilterableList";
import allAssets from "../assets/assets";
import UserProfile from "../components/Layout/UserProfile";
import { useNavigate } from "react-router-dom";
import ScreeningSection from "../components/ScreeningForm/ScreeningSection";
import {
  fetchCountries,
  fetchIndustries,
  fetchSectors,
  fetchSummary,
  fetchDates,
} from "../store/slice/databaseOverviewSlice";
import CustomLoader from "../components/ui/CustomLoader";
import DashboardSkeleton from "../skeletons/DashboardSkeleton";
import DateDisplay from "../components/ui/DateDisplay";
import { MessageSquarePlus } from "lucide-react";
import FeedbackModal from "../components/ui/FeedbackModal";

const DatabaseOverview = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { summary, countries, sectors, industries, loading, error, dates } =
    useSelector((state) => state.databaseOverview);

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchCountries());
    dispatch(fetchSectors());
    dispatch(fetchIndustries());
    dispatch(fetchDates());
    document.title = "GPC Dashboard";
  }, [dispatch]);

  const handleBegin = () => {
    navigate("/gpc-screening");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const statsData = [
    {
      icon: allAssets.conpanies,
      number: summary.total_companies,
      label: "Total Companies",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      icon: allAssets.countries,
      number: summary.total_countries,
      label: "Geography",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      icon: allAssets.sectors,
      number: summary.total_sectors,
      label: "Sector",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
    },
    {
      icon: allAssets.industries,
      number: summary.total_industries,
      label: "Industry",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100",
    },
  ];

  const countriesData = countries.countries.map((item) => ({
    name: item.name,
    count: item.company_count,
    color: "#6366F1", // Adjust colors as needed
  }));

  const sectorsData = sectors.sectors.map((item) => ({
    name: item.name,
    count: item.company_count,
    color: "#10B981",
  }));

  const industriesData = industries.industries.map((item) => ({
    name: item.name,
    count: item.company_count,
    color: "#F59E0B",
  }));

  return (
    <div className="bg-gray-100 min-h-screen px-4 pt-6 pb-24  sm:px-32 lg:px-34  ">
      {/* Top Bar with User Profile */}
      {/* Header with UserProfile */}
      <div className="flex items-start justify-between mb-12">
        {/* Left side - Main header content */}
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Database Overview
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore the breadth of companies in our database across geographies,
            sectors, and industries
          </p>
          <button
            onClick={handleBegin}
            className="w-[200px] bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md mx-auto cursor-pointer"
          >
            Let's begin <span className="text-xl">→</span>
          </button>
        </div>

        {/* Right side - UserProfile */}
        <div className="flex justify-center md:justify-end">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">
              <UserProfile />
            </span>
          </div>
        </div>
      </div>

      {/* Database Summary */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="flex gap-2 text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Database Summary as of {dates?.gpc_date}
          </h2>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 cursor-pointer"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Provide Feedback
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <FilterableList
          title="Countries"
          subtitle={`${countries.total_countries} Countries • ${countries.total_companies} Companies`}
          data={countriesData}
        />
        <FilterableList
          title="Primary Sectors"
          subtitle={`${sectors.total_sectors} Sectors • ${sectors.total_companies} Companies`}
          data={sectorsData}
        />
        <FilterableList
          title="Primary Industries"
          subtitle={`${industries.total_industries} Industries • ${industries.total_companies} Companies`}
          data={industriesData}
          showSearch={true}
          showViewAllButton={true}
          viewAllText="View All 161 Industries"
        />
      </div>
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="GPC Screening Feedback"
        workflow="gpc_screening"
      />
    </div>
  );
};

export default DatabaseOverview;
