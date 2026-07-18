import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as XLSX from "xlsx";
import { getAuthHeaders } from "../utils/helper";
import {
  fetchAdminAnalyticsStats,
  fetchAdminAnalyticsListSearch,
  fetchClientNames,
} from "../store/slice/userAnalyticsSLice";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Download } from "lucide-react";
import Dropdown from "../components/ScreeningForm/Dropdown";
import InputField from "../components/ScreeningForm/InputField";

// Subcomponents
import MetricCardsGrid from "../components/UserAnalytics/MetricCardsGrid";
import AnalyticsCharts from "../components/UserAnalytics/AnalyticsCharts";
import ActivityTable from "../components/UserAnalytics/ActivityTable";
import ActivityDetailModal from "../components/UserAnalytics/ActivityDetailModal";
import ClientManagementModal from "../components/UserAnalytics/ClientManagementModal";
import UserManagementModal from "../components/UserAnalytics/UserManagementModal";
import FeedbackAnalytics from "../components/UserAnalytics/FeedbackAnalytics";

// Utilities
import {
  parseDate,
  formatWorkflowName,
} from "../components/UserAnalytics/utils";

const UserAnalytics = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    analyticsList,
    listTotalCount,
    analyticsStats,
    loading,
    statsLoading,
  } = useSelector((state) => state.userAnalytics);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbacksList, setFeedbacksList] = useState([]);

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/feedback/`,
        {
          headers: getAuthHeaders(),
        },
      );
      setFeedbacksList(response?.data?.feedbacks || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    }
  };
  const [selectedWorkflowLabel, setSelectedWorkflowLabel] =
    useState("All Workflows");

  // Pagination & Period states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const periodOptions = [
    { label: "Daily", value: "day" },
    { label: "Weekly", value: "week" },
    { label: "Monthly", value: "month" },
    { label: "Custom Range", value: "custom" },
  ];
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleRowClick = (item) => {
    setSelectedActivity(item);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const params = { period: selectedPeriod };
    if (selectedPeriod === "custom") {
      if (startDate && endDate) {
        // Format to YYYY-MM-DD for backend if it comes as dd-mm-yyyy from InputField
        const formatForApi = (dateStr) => {
          if (dateStr.includes("-")) {
            const parts = dateStr.split("-");
            if (parts[0].length === 4) return dateStr; // already YYYY-MM-DD
            if (parts[2].length === 4)
              return `${parts[2]}-${parts[1]}-${parts[0]}`; // dd-mm-yyyy to YYYY-MM-DD
          }
          return dateStr;
        };
        params.period = "day";
        params.start_date = formatForApi(startDate);
        params.end_date = formatForApi(endDate);
      } else {
        return; // Don't fetch if custom is selected but dates are missing
      }
    }
    dispatch(fetchAdminAnalyticsStats(params));
  }, [selectedPeriod, startDate, endDate, dispatch]);

  useEffect(() => {
    document.title = "User Analytics";
    dispatch(fetchClientNames());
    fetchFeedbacks();
  }, [dispatch]);

  const dynamicWorkflowOptions = useMemo(() => {
    const defaultList = [
      { label: "All Workflows", value: "all" },
      { label: "GPC Screening", value: "gpc_screening" },
      { label: "Transaction Screening", value: "transaction_screening" },
      { label: "Audit AI", value: "audit_ai" },
      { label: "Ask AI", value: "ask_ai" },
      {
        label: "Article Interpretation AI",
        value: "article_interpretation_ai",
      },
    ];

    const counts = analyticsStats?.workflow_counts || [];
    const dynamicOptions = counts
      .filter(
        (item) =>
          item.workflow !== "gpc_screening" &&
          item.workflow !== "transaction_screening" &&
          item.workflow !== "audit_ai" &&
          item.workflow !== "ask_ai" &&
          item.workflow !== "article_interpretation_ai",
      )
      .map((item) => ({
        label: formatWorkflowName(item.workflow),
        value: item.workflow,
      }));

    return [...defaultList, ...dynamicOptions];
  }, [analyticsStats?.workflow_counts]);

  const workflowLabels = useMemo(
    () => dynamicWorkflowOptions.map((opt) => opt.label),
    [dynamicWorkflowOptions],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {
        page: currentPage,
        page_size: pageSize,
        period: selectedPeriod,
      };

      if (selectedPeriod === "custom") {
        if (startDate && endDate) {
          const formatForApi = (dateStr) => {
            if (dateStr.includes("-")) {
              const parts = dateStr.split("-");
              if (parts[0].length === 4) return dateStr;
              if (parts[2].length === 4)
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
          };
          params.period = "day";
          params.start_date = formatForApi(startDate);
          params.end_date = formatForApi(endDate);
        } else {
          return;
        }
      }

      // Search API
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Workflow Filter API
      const selectedOpt = dynamicWorkflowOptions.find(
        (o) => o.label === selectedWorkflowLabel,
      );

      if (selectedOpt && selectedOpt.value !== "all") {
        params.workflow = selectedOpt.value;
      }

      dispatch(fetchAdminAnalyticsListSearch(params));
      fetchFeedbacks();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchQuery,
    selectedWorkflowLabel,
    selectedPeriod,
    startDate,
    endDate,
    currentPage,
    dynamicWorkflowOptions,
    dispatch,
  ]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedWorkflowLabel, selectedPeriod, startDate, endDate]);

  const filteredAnalyticsList = useMemo(() => {
    if (!Array.isArray(analyticsList)) return [];

    return analyticsList.filter((item) => {
      // Optional frontend workflow safeguard
      if (selectedWorkflowLabel && selectedWorkflowLabel !== "All Workflows") {
        const selectedOpt = dynamicWorkflowOptions.find(
          (o) => o.label === selectedWorkflowLabel,
        );

        if (
          selectedOpt &&
          selectedOpt.value !== "all" &&
          item.workflow !== selectedOpt.value &&
          item.workflow_key !== selectedOpt.value
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    analyticsList,
    selectedWorkflowLabel,
    dynamicWorkflowOptions,
    selectedPeriod,
    startDate,
    endDate,
  ]);

  const flattenedAnalyticsList = useMemo(() => {
    const list = [];
    filteredAnalyticsList.forEach((item) => {
      if (Array.isArray(item.feedbacks) && item.feedbacks.length > 0) {
        item.feedbacks.forEach((fb, idx) => {
          list.push({
            ...item,
            display_id: `${item.activity_id}_fb_${idx}`,
            rating: fb.rating,
            feedback: fb.feedback,
            created_at: fb.created_at || item.created_at,
            original_item: item,
          });
        });
      } else {
        list.push({
          ...item,
          display_id: `${item.activity_id}_legacy`,
          original_item: item,
        });
      }
    });
    return list;
  }, [filteredAnalyticsList]);

  const summary = analyticsStats?.summary || {
    total_runs: 0,
    total_users: 0,
    total_clients: 0,
    total_projects: 0,
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);

      const pageSize = 50;
      let currentPage = 1;
      let hasMore = true;

      let allData = [];

      // Fetch all paginated records
      while (hasMore) {
        const params = {
          page: currentPage,
          page_size: pageSize,
          period: selectedPeriod,
        };

        if (selectedPeriod === "custom") {
          if (startDate && endDate) {
            const formatForApi = (dateStr) => {
              if (dateStr.includes("-")) {
                const parts = dateStr.split("-");
                if (parts[0].length === 4) return dateStr;
                if (parts[2].length === 4)
                  return `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
              return dateStr;
            };
            params.period = "day";
            params.start_date = formatForApi(startDate);
            params.end_date = formatForApi(endDate);
          } else {
            setIsExporting(false);
            return;
          }
        }

        // Search filter
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Workflow filter
        const selectedOpt = dynamicWorkflowOptions.find(
          (o) => o.label === selectedWorkflowLabel,
        );

        if (selectedOpt && selectedOpt.value !== "all") {
          params.workflow = selectedOpt.value;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/user/admin-panel/`,
          {
            params,
            headers: getAuthHeaders(),
          },
        );

        const trackingData = response?.data?.results?.tracking || [];

        // Merge all pages data
        allData = [...allData, ...trackingData];

        // Stop if last page
        if (!response?.data?.next) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }

      if (!allData.length) {
        return;
      }

      let finalData = allData;

      // Flatten feedbacks
      const flattenedData = [];

      finalData.forEach((item) => {
        if (Array.isArray(item.feedbacks) && item.feedbacks.length > 0) {
          item.feedbacks.forEach((fb, idx) => {
            flattenedData.push({
              ...item,
              display_id: `${item.activity_id}_fb_${idx}`,
              rating: fb.rating,
              feedback: fb.feedback,
              created_at: fb.created_at || item.created_at,
            });
          });
        } else {
          flattenedData.push({
            ...item,
            display_id: `${item.activity_id}_legacy`,
          });
        }
      });

      // Prepare Excel export data
      const exportData = flattenedData.map((item) => {
        const workflowName =
          item.workflow || formatWorkflowName(item.workflow_key) || "N/A";

        return {
          "First Name": item.first_name || "Unknown",
          "Last Name": item.last_name || "",
          Email: item.email || "No email",
          "Workflow Activity": workflowName,
          "Client Name": item.client_name || "-",
          // "Project Name": item.project_name || "-",
          // Rating:
          //   item.rating !== undefined && item.rating !== null
          //     ? item.rating
          //     : "",
          // "Feedback Note": item.feedback || "",
          "Date Recorded": item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-US")
            : "-",
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Optional column widths
      worksheet["!cols"] = [
        { wch: 18 },
        { wch: 18 },
        { wch: 30 },
        { wch: 30 },
        // { wch: 25 },
        { wch: 25 },
        { wch: 10 },
        { wch: 50 },
        { wch: 25 },
      ];

      // Create workbook
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "User Activity");

      // Download file
      XLSX.writeFile(
        workbook,
        `User_Activity_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Format data for Recharts
  const timelineData = useMemo(() => {
    const rawTimeline = analyticsStats?.timeline || [];
    return rawTimeline.slice(-7).map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      runs: item.total_runs,
    }));
  }, [analyticsStats?.timeline]);

  const workflowData = useMemo(() => {
    const rawWorkflowCounts = analyticsStats?.workflow_counts || [];
    console.log("rawWorkflowCounts", analyticsStats);
    return rawWorkflowCounts.map((item) => ({
      name: formatWorkflowName(item.workflow),
      value: item.count,
    }));
  }, [analyticsStats?.workflow_counts]);

  const clientData = useMemo(() => {
    const rawTopClients =
      analyticsStats?.client_counts || analyticsStats?.top_clients || [];
    return rawTopClients.map((item) => ({
      name: item.client_name,
      Runs: item.count,
    }));
  }, [analyticsStats?.client_counts, analyticsStats?.top_clients]);

  const projectData = useMemo(() => {
    const rawTopProjects =
      analyticsStats?.project_counts || analyticsStats?.top_projects || [];
    return rawTopProjects.slice(0, 5).map((item) => ({
      name: item.project_name,
      Runs: item.count,
    }));
  }, [analyticsStats?.project_counts, analyticsStats?.top_projects]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/services")}
              className="flex items-center justify-center cursor-pointer w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-sm shadow-indigo-200">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Analytics Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleExportData()}
              disabled={isExporting || analyticsList.length === 0}
              className={`px-5 py-2 rounded-lg transition text-sm font-semibold whitespace-nowrap border border-gray-300 text-white flex items-center justify-center gap-2 ${isExporting || analyticsList.length === 0 ? "bg-emerald-500 cursor-not-allowed opacity-70" : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"}`}
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download size={16} />
              )}
              {isExporting ? "Exporting..." : "Export Data"}
            </button>
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="px-5 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition text-sm whitespace-nowrap border border-gray-300 text-white bg-indigo-600 "
            >
              Manage Clients
            </button>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-5 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition text-sm whitespace-nowrap border border-gray-300 text-white bg-indigo-600 "
            >
              Manage Users
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Analytics Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                Analytics Period:
              </h2>
              <div className="w-48 relative my-2">
                <Dropdown
                  options={periodOptions.map((p) => p.label)}
                  value={
                    periodOptions.find((p) => p.value === selectedPeriod)?.label
                  }
                  onChange={(val) => {
                    const opt = periodOptions.find((p) => p.label === val);
                    setSelectedPeriod(opt ? opt.value : "day");
                  }}
                />
              </div>
              {selectedPeriod === "custom" && (
                <div className="flex items-center gap-3 ml-2 [&_div.mb-4]:mb-0">
                  <div className="w-36">
                    <InputField
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start Date"
                    />
                  </div>
                  <span className="text-slate-400 text-sm">to</span>
                  <div className="w-36">
                    <InputField
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End Date"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <MetricCardsGrid summary={summary} statsLoading={statsLoading} />

        {/* Charts Grid */}
        <AnalyticsCharts
          timelineData={timelineData}
          workflowData={workflowData}
          clientData={clientData}
          projectData={projectData}
          statsLoading={statsLoading}
        />

        {/* Data Table */}
        <ActivityTable
          flattenedAnalyticsList={flattenedAnalyticsList}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedWorkflowLabel={selectedWorkflowLabel}
          setSelectedWorkflowLabel={setSelectedWorkflowLabel}
          workflowLabels={workflowLabels}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          listTotalCount={listTotalCount}
          selectedPeriod={selectedPeriod}
          handleRowClick={handleRowClick}
        />
        {/* Feedback & Ratings Graphical Analytics */}
        <FeedbackAnalytics feedbacksList={feedbacksList} />
      </div>

      {/* Detail Modal */}
      <ActivityDetailModal
        isModalOpen={isModalOpen}
        selectedActivity={selectedActivity}
        setIsModalOpen={setIsModalOpen}
      />

      {/* Client Management Modal */}
      <ClientManagementModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </div>
  );
};

export default UserAnalytics;
