import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import allAssets from "../../assets/assets";
import PopOutCard from "../ui/PopOutCard";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import { Brain, Zap, X } from "lucide-react";

import {
  fetchScreeningResults,
  toggleCompanySelection,
  selectAllCompanies,
  clearSelections,
  runAIComparison,
  resetAI,
  cancelAIComparison,
  clearAllData,
  updateAiCompareDescription,
  toggleRunAISwitch,
} from "../../store/slice/screeningCriteriaSlice";
import SimilarityBadge from "./SimilarityBAdge";
import InfoTooltip from "../Layout/InfoTooltip";
import ExportButton from "../ui/ExportButton";

const ScreeningResultsTable = () => {
  const dispatch = useDispatch();
  const {
    results,
    loading,
    selectedCompanies,
    aiActive,
    formData,
    aiCompareDescription,
    runAISwitchEnabled,
  } = useSelector((state) => state.screeningCriteria);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectingAll, setSelectingAll] = useState(false);
  const [aiError, setAiError] = useState("");
  const [filterSortOption, setFilterSortOption] = useState("all");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [evMinFilter, setEvMinFilter] = useState("");
  const [evMaxFilter, setEvMaxFilter] = useState("");
  const [evRevMinFilter, setEvRevMinFilter] = useState("");
  const [evRevMaxFilter, setEvRevMaxFilter] = useState("");

  const tableHeaders = [
    "#",
    "Select",
    "Company Details",
    "Ticker",
    "Business Overview",
    "Business Model Similarity",
    "AI Rationale",
    "Total Enterprise Value ($ MM USD)",
    "EV/Revenue (X)",
    "EV/EBITDA (X)",
    // "Total Revenue ($ MM USD)",
    "Country",
  ];

  const data = results?.results || [];
  const totalCount = results?.count || 0;
  const selectedCount = Object.keys(selectedCompanies).length;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  // Check if AI can be enabled based on totalCount
  const canEnableAI = totalCount > 0 && totalCount <= 200;

  // Reset AI with confirmation
  const handleResetAI = useCallback(() => {
    // Show confirmation dialog for better UX
    // const confirmReset = window.confirm(
    //   "Are you sure you want to reset AI comparison? This will clear the business description and all AI analysis results."
    // );

    // if (!confirmReset) return;

    dispatch(resetAI());
    dispatch(updateAiCompareDescription(""));
    dispatch(toggleRunAISwitch(false));
    // setAiError("");
    // setSimilarityFilter("All");
    // setSearchQuery("");
    // setSortBy("name");
    // setSortOrder("asc");
    // setCountryFilter("All");
    // setSectorFilter("All");
    // setIndustryFilter("All");
    // setEvMinFilter("");
    // setEvMaxFilter("");
    // setEvRevMinFilter("");
    // setEvRevMaxFilter("");
  }, [dispatch]);

  // Effect to automatically disable AI switch if count exceeds 200
  useEffect(() => {
    if (totalCount > 200 && runAISwitchEnabled) {
      dispatch(toggleRunAISwitch(false));
      handleResetAI();
      setAiError("AI comparison is only available for 200 or fewer companies");
    }
  }, [totalCount, runAISwitchEnabled, handleResetAI, dispatch]);

  // Helper to extract keywords from form data
  const getKeywords = () => {
    const keywords = [];
    if (formData?.keywords && Array.isArray(formData.keywords)) {
      formData.keywords.forEach((keywordGroup) => {
        if (keywordGroup?.trim()) {
          const keywordList = keywordGroup
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
          keywords.push(...keywordList);
        }
      });
    }
    return keywords;
  };

  const userKeywords = getKeywords();

  // Simple substring keyword highlighting function
  const highlightKeywords = (text, keywords) => {
    if (!text || !keywords || keywords.length === 0) return <span>{text}</span>;

    try {
      const validKeywords = keywords
        .filter((kw) => kw && kw.trim().length > 0)
        .map((kw) => kw.toLowerCase().trim());

      if (validKeywords.length === 0) return <span>{text}</span>;

      let highlightedText = text;
      const sortedKeywords = validKeywords.sort((a, b) => b.length - a.length);

      sortedKeywords.forEach((keyword) => {
        const regex = new RegExp(`(${keyword})`, "gi");
        highlightedText = highlightedText.replace(regex, (match) => {
          return `<span class="px-1 rounded font-bold border bg-yellow-200 text-yellow-800 border-yellow-400" title="Matches: ${keyword}">${match}</span>`;
        });
      });

      return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
    } catch (error) {
      console.error("Error in highlightKeywords:", error);
      return <span>{text}</span>;
    }
  };

  // Filter and sort data with improved similarity filtering
  const getFilteredAndSortedData = () => {
    let filtered = [...data];

    // Apply country filter
    if (countryFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.headquarters_country_region === countryFilter
      );
    }

    // Apply sector filter
    if (sectorFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.primary_sector === sectorFilter
      );
    }

    // Apply industry filter
    if (industryFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.primary_industry === industryFilter
      );
    }

    // Apply Enterprise Value range filters
    if (evMinFilter && !isNaN(parseFloat(evMinFilter))) {
      const minVal = parseFloat(evMinFilter);
      filtered = filtered.filter(
        (item) =>
          parseFloat(item.latest_financial?.enterprise_value || 0) >= minVal
      );
    }
    if (evMaxFilter && !isNaN(parseFloat(evMaxFilter))) {
      const maxVal = parseFloat(evMaxFilter);
      filtered = filtered.filter(
        (item) =>
          parseFloat(item.latest_financial?.enterprise_value || 0) <= maxVal
      );
    }

    // Apply EV/Revenue range filters
    if (evRevMinFilter && !isNaN(parseFloat(evRevMinFilter))) {
      const minVal = parseFloat(evRevMinFilter);
      filtered = filtered.filter(
        (item) => parseFloat(item.latest_financial?.ev_revenu || 0) >= minVal
      );
    }
    if (evRevMaxFilter && !isNaN(parseFloat(evRevMaxFilter))) {
      const maxVal = parseFloat(evRevMaxFilter);
      filtered = filtered.filter(
        (item) => parseFloat(item.latest_financial?.ev_revenu || 0) <= maxVal
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.business_description?.toLowerCase().includes(query) ||
          item.headquarters_country_region?.toLowerCase().includes(query)
      );
    }

    // Determine filter type and sort field based on selected option
    const isFilterOption = [
      "similarity-high",
      "similarity-medium",
      "similarity-low",
    ].includes(filterSortOption);
    const isSortOption = [
      "sort-name",
      "sort-ev",
      "sort-ev-revenue",
      "sort-country",
    ].includes(filterSortOption);

    // Check if any data has similarity values (meaning AI was run)
    const hasSimilarityData = data.some(
      (item) => item.business_model_similarity
    );

    // Apply similarity-based filtering when similarity filter is selected and data has similarity values
    if (isFilterOption && hasSimilarityData) {
      const similarityMap = {
        "similarity-high": "High",
        "similarity-medium": "Medium",
        "similarity-low": "Low",
      };
      const similarityLevel = similarityMap[filterSortOption];
      const similarityOrder = { High: 3, Medium: 2, Low: 1 };

      // Separate companies by similarity level
      const selected = filtered.filter(
        (item) => item.business_model_similarity === similarityLevel
      );
      const others = filtered.filter(
        (item) => item.business_model_similarity !== similarityLevel
      );
      
      // Sort others based on proximity to selected level
      const selectedLevel = similarityOrder[similarityLevel];
      others.sort((a, b) => {
        const aLevel = similarityOrder[a.business_model_similarity] || 0;
        const bLevel = similarityOrder[b.business_model_similarity] || 0;
        const aDiff = Math.abs(aLevel - selectedLevel);
        const bDiff = Math.abs(bLevel - selectedLevel);

        if (aDiff === bDiff) {
          return bLevel - aLevel;
        }
        return aDiff - bDiff;
      });

      filtered = [...selected, ...others];
    }

    // Apply sorting when sort option is selected or no filter is active
    if (filterSortOption === "all" || isSortOption) {
      const sortFieldMap = {
        all: "name",
        "sort-name": "name",
        "sort-ev": "enterprise_value",
        "sort-ev-revenue": "ev_revenu",
        "sort-country": "headquarters_country_region",
      };
      const sortField = sortFieldMap[filterSortOption] || "name";

      const sortedData = [...filtered].sort((a, b) => {
        let aValue = a[sortField] || "";
        let bValue = b[sortField] || "";

        if (sortField === "business_model_similarity") {
          const similarityOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = similarityOrder[a.business_model_similarity] || 0;
          bValue = similarityOrder[b.business_model_similarity] || 0;
        } else if (sortField === "enterprise_value") {
          aValue = parseFloat(a.latest_financial?.enterprise_value) || 0;
          bValue = parseFloat(b.latest_financial?.enterprise_value) || 0;
        } else if (sortField === "ev_revenu") {
          aValue = parseFloat(a.latest_financial?.ev_revenu) || 0;
          bValue = parseFloat(b.latest_financial?.ev_revenu) || 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      return sortedData;
    }

    return filtered;
  };

  const filteredData = getFilteredAndSortedData();

  // Handle Select All / Deselect All
  const handleToggleSelectAll = async () => {
    if (allSelected) {
      dispatch(clearSelections());
    } else {
      setSelectingAll(true);
      try {
        await dispatch(selectAllCompanies(results)).unwrap();
      } catch (error) {
        console.error("Error selecting all companies:", error);
      } finally {
        setSelectingAll(false);
      }
    }
  };

  // Handle AI Run
  const handleRunAI = async () => {
    if (totalCount > 200) {
      setAiError("AI comparison is only available for 200 or fewer companies");
      return;
    }

    if (!aiCompareDescription.trim()) {
      setAiError("Please enter a business description");
      return;
    }

    try {
      await dispatch(runAIComparison(aiCompareDescription)).unwrap();
      dispatch(toggleRunAISwitch(true));
      setAiError("");
      setFilterSortOption("similarity-high");
    } catch (error) {
      if (error.name !== "AbortError") {
        setAiError(error || "Failed to run AI comparison");
      }
    }
  };

  // Handle Cancel AI
  const handleCancelAI = async () => {
    try {
      await dispatch(cancelAIComparison()).unwrap();
      dispatch(toggleRunAISwitch(false));
      setAiError("");
    } catch (error) {
      console.error("Error cancelling AI:", error);
    }
  };

  // Handle pagination
  const handlePageChange = (url) => {
    if (!url) return;
    handleResetAI();
    dispatch(fetchScreeningResults(url));
  };

  // Helper function to format numbers with commas and 2 decimal places
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "" || value === "-")
      return "-";

    const num = parseFloat(value);
    if (isNaN(num)) return "-";

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Handle Export to Excel
  const handleExportExcel = () => {
    const selected = Object.values(selectedCompanies);
    if (!selected.length) {
      alert("No companies selected for export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Create Screening Criteria sheet
    const criteriaData = [];

    // Add title
    criteriaData.push(["SCREENING CRITERIA"]);
    criteriaData.push([""]);

    // Add summary metrics
    const total = results?.count || 0;
    const byCountry = results?.counts?.countries || 0;
    const primarySectors = results?.counts?.sectors || 0;
    const primaryIndustries = results?.counts?.industries || 0;
    criteriaData.push(["SCREENING SUMMARY"]);
    criteriaData.push(["Total Results", total]);
    criteriaData.push(["By Country", byCountry]);
    criteriaData.push(["Primary Sectors", primarySectors]);
    criteriaData.push(["Primary Industries", primaryIndustries]);
    criteriaData.push([""]);

    // Add countries
    const countries = formData?.headquarters_country_region?.filter(
      (country) => country.trim() !== ""
    );
    if (countries && countries.length > 0) {
      const countryNames = countries
        .map((country) =>
          country.startsWith("custom:")
            ? country.replace("custom:", "")
            : country
        )
        .join(", ");
      criteriaData.push(["Countries", countryNames]);
    } else {
      criteriaData.push(["Countries", "-"]);
    }

    // Add keywords
    if (formData?.keywords && formData.keywords.length > 0) {
      formData.keywords.forEach((keyword, index) => {
        if (keyword.trim()) {
          const condition = formData.keyword_condition?.[index] || "AND";
          criteriaData.push([
            `Keywords Group ${index + 1}`,
            `${keyword} (${condition.toUpperCase()})`,
          ]);
        }
      });
    } else {
      criteriaData.push(["Keywords", "-"]);
    }

    // Add primary sector and industry
    criteriaData.push([
      "Primary Sector",
      formData?.primary_sector?.trim() || "-",
    ]);
    criteriaData.push([
      "Primary Industry",
      formData?.primary_industry?.trim() || "-",
    ]);

    // Add AI Comparison Business Description if available
    if (aiCompareDescription?.trim()) {
      criteriaData.push([""]); // spacer
      criteriaData.push(["AI COMPARISON "]);
      criteriaData.push([
        "Subject Company Business Description",
        aiCompareDescription.trim(),
      ]);
    }

    criteriaData.push([""]);
    criteriaData.push(["FINANCIAL CRITERIA"]);

    // Add financial criteria
    const evRevMin = formData?.ev_revenu_min?.trim() || "-";
    const evRevMax = formData?.ev_revenu_max?.trim() || "-";
    criteriaData.push(["EV/Revenue (Min)", evRevMin]);
    criteriaData.push(["EV/Revenue (Max)", evRevMax]);

    const totalRevMin = formData?.total_revenue_min?.trim() || "-";
    const totalRevMax = formData?.total_revenue_max?.trim() || "-";
    criteriaData.push(["Total Revenue (Min)", totalRevMin]);
    criteriaData.push(["Total Revenue (Max)", totalRevMax]);

    const evMin = formData?.enterprise_value_min?.trim() || "-";
    const evMax = formData?.enterprise_value_max?.trim() || "-";
    criteriaData.push(["Enterprise Value (Min)", evMin]);
    criteriaData.push(["Enterprise Value (Max)", evMax]);

    // Add pricing date criteria
    const pricingDateMin = formData?.pricing_date_min?.trim() || "-";
    const pricingDateMax = formData?.pricing_date_max?.trim() || "-";
    criteriaData.push(["Pricing Date (Min)", pricingDateMin]);
    criteriaData.push(["Pricing Date (Max)", pricingDateMax]);

    const criteriaSheet = XLSX.utils.aoa_to_sheet(criteriaData);

    // Set column widths for criteria sheet
    criteriaSheet["!cols"] = [{ wch: 30 }, { wch: 60 }];

    // Style the title row
    if (criteriaSheet.A1) {
      criteriaSheet.A1.s = {
        font: { bold: true, sz: 14 },
        fill: { fgColor: { rgb: "4F46E5" } },
      };
    }

    XLSX.utils.book_append_sheet(workbook, criteriaSheet, "Screening Criteria");

    // Create Results sheet
    const exportData = selected.map((item) => ({
      "Company ID": item.id || "-",
      "Company Name": item.name || "-",
      "Excel Company ID": item.company_id || "-",
      "Exchange Ticker": item.exchange_ticker || "-",
      "Business Description": item.business_description || "-",
      "Business Model Similarity": item.business_model_similarity || "-",
      "AI Rationale": item.ai_rationale || "-",
      "Primary Sector": item.primary_sector || "-",
      "Primary Industry": item.primary_industry || "-",
      "Headquarters Country/Region": item.headquarters_country_region || "-",
      "Enterprise Value ($ MM USD)": item.latest_financial?.enterprise_value
        ? formatNumber(item.latest_financial?.enterprise_value)
        : "-",
      "EV/Revenue (X)": item.latest_financial?.ev_revenu
        ? `${formatNumber(item.latest_financial?.ev_revenu)}x`
        : "-",
      "EV/EBITDA": item.latest_financial?.ev_ebitda || "-",
      "Total Revenue ($ MM USD)": item.latest_financial?.total_revenue
        ? formatNumber(item.latest_financial?.total_revenue)
        : "-",
    }));

    const resultsSheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for results sheet
    resultsSheet["!cols"] = [
      { wch: 12 },
      { wch: 35 },
      { wch: 25 },
      { wch: 15 },
      { wch: 50 },
      { wch: 20 },
      { wch: 50 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(workbook, resultsSheet, "Results");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "screening_results_with_criteria.xlsx");
    toast.success("Screening results with criteria exported successfully");
  };

  return (
    <div className=" bg-white p-6 sm:p-8 rounded-2xl border border-blue-400 shadow-sm font-sans my-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-700 text-white w-10 h-10 flex items-center justify-center rounded-lg">
            <img src={allAssets.screeningResults} alt="results icon" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Screening Results
            </h1>
            <p className="text-sm text-gray-500">
              {totalCount} companies found • {selectedCount} selected
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Clear Table Button */}
          <button
            onClick={() => {
              dispatch(clearAllData());
              toast.success("Screening results cleared successfully");
            }}
            disabled={totalCount === 0}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              totalCount === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-orange-600 text-white hover:bg-orange-700 border border-orange-600"
            }`}
          >
            Clear Table
          </button>

          {/* Select All / Deselect All */}
          <button
            onClick={handleToggleSelectAll}
            disabled={selectingAll || totalCount === 0}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              allSelected
                ? "bg-red-600 text-white hover:bg-red-700 border border-red-600"
                : selectingAll || totalCount === 0
                ? "bg-gray-100 text-gray-400 border border-gray-200 "
                : "bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600"
            }`}
          >
            {selectingAll
              ? "Selecting..."
              : allSelected
              ? "Deselect All"
              : `Select All (${totalCount})`}
          </button>

          {/* Download Excel Button */}
          <ExportButton
            label={`Download Results (${selectedCount})`}
            onClick={handleExportExcel}
            disabled={selectedCount === 0}
            variant="success"
          />
        </div>
      </div>

      {/* Run AI Section */}
      <div className="mb-6 py-4 px-6 bg-gradient-to-r from-green-50 rounded-xl border border-green-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">
              AI-Powered Comparison
            </h3>
            {aiActive && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                AI Active
              </span>
            )}
            {totalCount > 0 && (
              <span
                className={`px-4 py-2 text-md font-semibold rounded-md ${
                  totalCount > 200
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                Available for less than 200 companies only ({totalCount} found)
              </span>
            )}
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={runAISwitchEnabled}
              disabled={!canEnableAI || loading}
              onChange={(e) => {
                if (!canEnableAI) {
                  setAiError(
                    `AI comparison is only available for 200 or fewer companies. You have ${totalCount} companies.`
                  );
                  return;
                }
                dispatch(toggleRunAISwitch(e.target.checked));
                if (!e.target.checked) {
                  handleResetAI();
                }
              }}
            />
            <div
              className={`w-11 h-6 bg-gray-200 rounded-full peer ${
                !canEnableAI || loading
                  ? "opacity-50 cursor-not-allowed"
                  : "peer-checked:after:translate-x-full peer-checked:bg-green-600"
              } peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
            ></div>
            <span
              className={`ml-3 text-sm font-bold ${
                !canEnableAI || loading ? "text-gray-400" : "text-gray-900"
              }`}
            >
              Run AI
            </span>
          </label>
        </div>

        {runAISwitchEnabled && canEnableAI && (
          <div className="space-y-3 mt-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                Company's Business Description for Comparison
                <InfoTooltip message="Enter a detailed business description of your subject company. The AI will analyze and compare this description against all screening results to identify companies with similar business models, products, or services. The more detailed your description, the more accurate the similarity matching will be." />
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-green-600 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Enter the subject company's business description in 3–4 lines"
                value={aiCompareDescription}
                disabled={loading}
                onChange={(e) => {
                  dispatch(updateAiCompareDescription(e.target.value));
                  setAiError("");
                }}
              />
              {aiError && (
                <p className="mt-1 text-sm text-red-600">{aiError}</p>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-4 w-full py-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200">
                <div className="relative">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 opacity-20 animate-ping"></div>
                    <div className="relative flex items-center justify-center w-full h-full">
                      <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: "3s" }}
                  >
                    <Zap className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 text-yellow-500" />
                    <Zap className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
                    <Zap className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 text-blue-500" />
                    <Zap className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 text-indigo-500" />
                  </div>
                </div>

                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    AI Analysis in Progress
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Analyzing company similarities and generating AI insights...
                  </p>

                  <button
                    onClick={handleCancelAI}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Cancel AI Run
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleRunAI}
                  disabled={!aiCompareDescription.trim()}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    !aiCompareDescription.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  Run AI Comparison
                </button>

                {(aiActive || aiCompareDescription.trim()) && (
                  <button
                    onClick={handleResetAI}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                    Reset AI Analysis
                  </button>
                )}
              </div>
            )}

            {/* Search and Filter Controls */}
            {/* {!loading && data.length > 0 && (
              <div className="w-full space-y-3">
                
                <div className="flex flex-wrap gap-4 px-4 py-3 border border-green-600 rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Search:
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search companies..."
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Filter/Sort:
                    </label>
                    <select
                      value={filterSortOption}
                      onChange={(e) => setFilterSortOption(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Results</option>
                      <option value="similarity-high">Similarity: High</option>
                      <option value="similarity-medium">
                        Similarity: Medium
                      </option>
                      <option value="similarity-low">Similarity: Low</option>
                      <option value="sort-name">Sort by: Company Name</option>
                      <option value="sort-ev">Sort by: Enterprise Value</option>
                      <option value="sort-ev-revenue">
                        Sort by: EV/Revenue
                      </option>
                      <option value="sort-country">Sort by: Country</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Order:
                    </label>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                    </button>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>
    {/* Search and Filter Controls */}
            {!loading && data.length > 0 && (
              <div className="w-full space-y-3">
                {/* Basic Filters Row */}
                <div className="flex flex-wrap gap-4 px-4 py-3 border border-green-600 rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Search:
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search companies..."
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Filter/Sort:
                    </label>
                    <select
                      value={filterSortOption}
                      onChange={(e) => setFilterSortOption(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Results</option>
                      <option value="similarity-high">Similarity: High</option>
                      <option value="similarity-medium">
                        Similarity: Medium
                      </option>
                      <option value="similarity-low">Similarity: Low</option>
                      <option value="sort-name">Sort by: Company Name</option>
                      <option value="sort-ev">Sort by: Enterprise Value</option>
                      <option value="sort-ev-revenue">
                        Sort by: EV/Revenue
                      </option>
                      <option value="sort-country">Sort by: Country</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Order:
                    </label>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                    </button>
                  </div>
                </div>
              </div>
            )}
      {/* Table Section */}
      {loading && !runAISwitchEnabled ? (
        <p className="text-center text-gray-500 py-6">Loading results...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          No results available. Run a screening first.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-auto h-[100vh]">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10 bg-white ">
                <tr className="border-b border-gray-200">
                  {tableHeaders.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-medium text-gray-500 whitespace-nowrap bg-white"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="align-top hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      if (e.target.type !== "checkbox") {
                        setSelectedCompany(item);
                      }
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={!!selectedCompanies[item.id]}
                        onChange={(e) => {
                          e.stopPropagation();
                          dispatch(toggleCompanySelection(item));
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.name || "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="border border-black text-black text-xs font-medium px-2.5 py-1 rounded-md">
                        {item.exchange_ticker || "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <div className="line-clamp-2">
                        {item.business_description
                          ? highlightKeywords(
                              item.business_description,
                              userKeywords
                            )
                          : "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <SimilarityBadge level={item.business_model_similarity} />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                      <div className="flex gap-2 items-start">
                        {item.ai_rationale && (
                          <div className="flex-shrink-0 mt-0.5">
                            <InfoTooltip message={item.ai_rationale} />
                          </div>
                        )}
                        <div className="line-clamp-4 flex-1">
                          {item.ai_rationale || "-"}
                        </div>
                      </div>
                    </td>
{/* Total Enterprise Value ($ MM USD) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      {
                        item.latest_financial?.enterprise_value
                        ? `$ ${formatNumber(item.latest_financial?.enterprise_value)} MM`
                        :"-"
                      }
                      {/* {formatNumber(item.latest_financial?.enterprise_value)} */}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      <span className="inline-flex items-center">
                        {item.latest_financial?.ev_revenu
                          ? `${formatNumber(item.latest_financial.ev_revenu)}x`
                          : "-"}
                      </span>
                    </td>

                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      {formatNumber(item.latest_financial?.total_revenue)}
                    </td> */}
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                    {item.latest_financial?.ev_ebitda
                          ? `${formatNumber(item.latest_financial.ev_ebitda)}x`
                          : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      {item.headquarters_country_region || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePageChange(results?.previous)}
              disabled={!results?.previous}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                results?.previous
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 cursor-pointer"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Showing {filteredData.length} of {totalCount} companies
            </span>
            <button
              onClick={() => handlePageChange(results?.next)}
              disabled={!results?.next}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                results?.next
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 cursor-pointer"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}

      <PopOutCard
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        keywords={userKeywords}
      />
    </div>
  );
};

export default ScreeningResultsTable;
