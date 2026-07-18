// src/pages/TSADashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, CheckCircle, BarChart, AlertTriangle, MessageSquarePlus } from "lucide-react"; // Install lucide-react
import StatsCard from "../components/Layout/StatsCard";
import FilterableList from "../components/Layout/FilterableList";
import allAssets from "../assets/assets";
import UserProfile from "../components/Layout/UserProfile";
import { useNavigate } from "react-router-dom";
import ScreeningSection from "../components/ScreeningForm/ScreeningSection";
import { fetchTsaSummary } from "../store/slice/tsaDashboard.Slice";
import CustomLoader from "../components/ui/CustomLoader";
import { fetchDates } from "../store/slice/databaseOverviewSlice";
import DashboardSkeleton from "../skeletons/DashboardSkeleton";
import FeedbackModal from "../components/ui/FeedbackModal";

const TSADashboard = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { summary, countries, sectors, industries } = useSelector(
  //   (state) => state.databaseOverview,
  // );

  const { tsaSummary, loading, error } = useSelector(
    (state) => state.tsaDashboard,
  );
  const date = useSelector((state)=>state.databaseOverview.dates)

  useEffect(() => {
    dispatch(fetchTsaSummary());
    dispatch(fetchDates())
    document.title = "Transaction Screening Dashboard";
    // dispatch(fetchSummary());
    // dispatch(fetchCountries());
    // dispatch(fetchSectors());
    // dispatch(fetchIndustries());
  }, [dispatch]);

  const handleBegin = () => {
    navigate("/tsa-screening");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <p>Error: {typeof error === "object" ? JSON.stringify(error) : error}</p>
    );
  }

  const statsData = [
    {
      icon: allAssets.conpanies,
      number: tsaSummary.total_transactions,
      label: "Total Transactions",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      icon: allAssets.countries,
      number: tsaSummary.total_countries,
      label: "Total Countries",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    // {
    //   icon: allAssets.sectors,
    //   number: summary.total_sectors,
    //   label: "Sector",
    //   bgColor: "bg-purple-50",
    //   iconBg: "bg-purple-100",
    // },
    {
      icon: allAssets.industries,
      number: tsaSummary.total_industries,
      label: "Total Industries",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100",
    },
  ];

  // const countriesData = countries.countries.map((item) => ({
  //   name: item.name,
  //   count: item.company_count,
  //   color: "#6366F1", // Adjust colors as needed
  // }));

  // const sectorsData = sectors.sectors.map((item) => ({
  //   name: item.name,
  //   count: item.company_count,
  //   color: "#10B981",
  // }));

  // const industriesData = industries.industries.map((item) => ({
  //   name: item.name,
  //   count: item.company_count,
  //   color: "#F59E0B",
  // }));

  const tsaCountries = (tsaSummary.countries || []).map((item) => ({
    name: item.name,
    count: item.company_count,
    color: "#6366F1",
  }));

  const tsaIndustries = (tsaSummary.industries || []).map((item) => ({
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
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="flex gap-2 text-xl sm:text-2xl font-bold text-gray-800 mb-6">
            Database Summary as of {date?.transaction_date}
          </h2>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-bold shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 cursor-pointer"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Provide Feedback
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Countries & Industries Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FilterableList
          title="Countries"
          subtitle={`${tsaSummary.total_countries} ${tsaSummary.total_countries === 1 ? "Country" : "Countries"}`}
          data={tsaCountries}
        />
        <FilterableList
          title="Industries"
          subtitle={`${tsaSummary.total_industries} Industries`}
          data={tsaIndustries}
          showSearch={true}
          showViewAllButton={true}
        viewAllText={`View All ${tsaSummary.total_industries} Industries`}
        />
      </div>
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Transaction Screening Feedback"
        workflow="transaction_screening"
      />
    </div>
  );
};

export default TSADashboard;
