import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import allAssets from "../../assets/assets";
import PopOutCard from "../ui/PopOutCard";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Brain, Zap, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchTsaScreeningResults,
  toggleTsaCompanySelection,
  clearTsaSelections,
  clearTsaAllData,
  updateTsaAiCompareDescription,
  toggleTsaRunAISwitch,
  resetTsaAI,
  selectAllTsaTransactions,
  runAIComparison,
  cancelTsaAIComparison,
} from "../../store/slice/tsaScreeningCriteriaSlice";
import SimilarityBadge from "./SimilarityBAdge";
import InfoTooltip from "../Layout/InfoTooltip";
import ExportButton from "../ui/ExportButton";

const TSAResultsTable = () => {
  const dispatch = useDispatch();
  const {
    results,
    loading,
    selectedCompanies,
    aiActive,
    formData,
    aiCompareDescription,
    runAISwitchEnabled,
  } = useSelector((state) => state.tsaScreeningCriteria);

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
    "Closed Date",
    "Target/Issuer",
    "Buyers/Investors",
    "Business Model Similarity",
    "AI Rationale",
    "% Acquired",
    "Total Transaction Value (USD Million)",
    "Business Description",
    "Total Enterprise Value ($ MM USD)",
    "EV/Revenue (X)",
    "EV/EBITDA (X)",
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

    dispatch(resetTsaAI());
    dispatch(updateTsaAiCompareDescription(""));
    dispatch(toggleTsaRunAISwitch(false));
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
      dispatch(toggleTsaRunAISwitch(false));
      handleResetAI();
      setAiError("AI comparison is only available for 200 or fewer companies");
    }
  }, [totalCount, runAISwitchEnabled, handleResetAI, dispatch]);

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

  // Filter and sort data with improved similarity filtering
  const getFilteredAndSortedData = () => {
    let filtered = [...data];

    // Apply country filter
    if (countryFilter !== "All") {
      filtered = filtered.filter((item) => item.geography === countryFilter);
    }

    // Apply sector filter
    if (sectorFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.primary_sector === sectorFilter,
      );
    }

    // Apply industry filter
    if (industryFilter !== "All") {
      filtered = filtered.filter(
        (item) => item.primary_industry === industryFilter,
      );
    }

    // Apply Enterprise Value range filters
    if (evMinFilter && !isNaN(parseFloat(evMinFilter))) {
      const minVal = parseFloat(evMinFilter);
      filtered = filtered.filter(
        (item) => parseFloat(item.implied_enterprise_value_usd || 0) >= minVal,
      );
    }
    if (evMaxFilter && !isNaN(parseFloat(evMaxFilter))) {
      const maxVal = parseFloat(evMaxFilter);
      filtered = filtered.filter(
        (item) => parseFloat(item.implied_enterprise_value_usd || 0) <= maxVal,
      );
    }

    // Apply EV/Revenue range filters
    if (evRevMinFilter && !isNaN(parseFloat(evRevMinFilter))) {
      const minVal = parseFloat(evRevMinFilter);
      filtered = filtered.filter(
        (item) => parseFloat(item.ev_revenue || 0) >= minVal,
      );
    }
    if (evRevMaxFilter && !isNaN(parseFloat(evRevMaxFilter))) {
      const maxVal = parseFloat(evRevMaxFilter);
      filtered = filtered.filter(
        (item) => parseFloat(item.ev_revenue || 0) <= maxVal,
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.target_issuer?.toLowerCase().includes(query) ||
          item.business_description?.toLowerCase().includes(query) ||
          item.geography?.toLowerCase().includes(query),
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
      (item) => item.business_model_similarity,
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
        (item) => item.business_model_similarity === similarityLevel,
      );
      const others = filtered.filter(
        (item) => item.business_model_similarity !== similarityLevel,
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
        all: "target_issuer",
        "sort-name": "target_issuer",
        "sort-ev": "implied_ev_usd",
        "sort-ev-revenue": "ev_revenue",
        "sort-country": "geography",
      };
      const sortField = sortFieldMap[filterSortOption] || "target_issuer";

      const sortedData = [...filtered].sort((a, b) => {
        let aValue = a[sortField] || "";
        let bValue = b[sortField] || "";

        if (sortField === "business_model_similarity") {
          const similarityOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = similarityOrder[a.business_model_similarity] || 0;
          bValue = similarityOrder[b.business_model_similarity] || 0;
        } else if (sortField === "implied_ev_usd") {
          aValue = parseFloat(a.implied_ev_usd) || 0;
          bValue = parseFloat(b.implied_ev_usd) || 0;
        } else if (sortField === "ev_revenue") {
          aValue = parseFloat(a.ev_revenue) || 0;
          bValue = parseFloat(b.ev_revenue) || 0;
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
      dispatch(clearTsaSelections());
    } else {
      setSelectingAll(true);
      try {
        await dispatch(selectAllTsaTransactions(results));
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
      await dispatch(cancelTsaAIComparison()).unwrap();
      dispatch(toggleTsaRunAISwitch(false));
      setAiError("");
    } catch (error) {
      console.error("Error cancelling AI:", error);
    }
  };

  // Handle pagination
  const handlePageChange = (url) => {
    if (!url) return;
    handleResetAI();
    dispatch(fetchTsaScreeningResults(url));
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

    // Header
    criteriaData.push(["SCREENING CRITERIA"]);
    criteriaData.push([""]);

    // Screening Summary Section
    const total = results?.count || 0;
    const byCountry = results?.counts?.countries || 0;
    const primaryIndustries = results?.counts?.industries || 0;
    criteriaData.push(["SCREENING SUMMARY"]);
    criteriaData.push(["Total Results", total]);
    criteriaData.push(["By Country", byCountry]);
    criteriaData.push(["Primary Industries", primaryIndustries]);
    criteriaData.push([""]); // spacer

    // Countries
    const countries = formData?.headquarters_country_region?.filter(
      (c) => c.trim() !== "",
    );
    if (countries && countries.length > 0) {
      const displayCountries = countries
        .map((c) => (c.startsWith("custom:") ? c.replace("custom:", "") : c))
        .join(", ");
      criteriaData.push(["Countries", displayCountries]);
    } else {
      criteriaData.push(["Countries", "-"]);
    }

    // Keywords
    if (formData?.keywords && formData.keywords.length > 0) {
      formData.keywords.forEach((keywordGroup, index) => {
        if (keywordGroup.trim()) {
          const condition = formData.keyword_condition?.[index] || "AND";
          criteriaData.push([
            `Keywords Group ${index + 1}`,
            `${keywordGroup} (${condition.toUpperCase()})`,
          ]);
        }
      });
    } else {
      criteriaData.push(["Keywords", "-"]);
    }

    // Primary Industries
    const displayIndustries =
      formData?.primary_industries?.filter((i) => i?.trim())?.join(", ") || "-";
    criteriaData.push(["Primary Industries", displayIndustries]);

    // Add AI Comparison Business Description if available
    if (aiCompareDescription?.trim()) {
      criteriaData.push([""]); // spacer
      criteriaData.push(["AI COMPARISON CRITERIA"]);
      criteriaData.push([
        "Subject Company Business Description",
        aiCompareDescription.trim(),
      ]);
    }

    // Financial Criteria
    criteriaData.push([""]);
    criteriaData.push(["FINANCIAL CRITERIA"]);

    const maClosedDateMin = formData?.ma_closed_date_min?.trim() || "-";
    const maClosedDateMax = formData?.ma_closed_date_max?.trim() || "-";
    criteriaData.push(["M&A Closed Date (Min)", maClosedDateMin]);
    criteriaData.push(["M&A Closed Date (Max)", maClosedDateMax]);

    const impliedEvUsdMin =
      formData?.implied_enterprise_value_usd_min?.trim() || "-";
    const impliedEvUsdMax =
      formData?.implied_enterprise_value_usd_max?.trim() || "-";
    criteriaData.push([
      "Implied Enterprise Value (USD) (Min)",
      impliedEvUsdMin,
    ]);
    criteriaData.push([
      "Implied Enterprise Value (USD) (Max)",
      impliedEvUsdMax,
    ]);

    const txValUsdMin =
      formData?.total_transaction_value_usd_min?.trim() || "-";
    const txValUsdMax =
      formData?.total_transaction_value_usd_max?.trim() || "-";
    criteriaData.push(["Total Transaction Value (USD) (Min)", txValUsdMin]);
    criteriaData.push(["Total Transaction Value (USD) (Max)", txValUsdMax]);

    const pctSoughtMin = formData?.percent_sought_min?.trim() || "-";
    const pctSoughtMax = formData?.percent_sought_max?.trim() || "-";
    criteriaData.push(["PercentSought (Min)", pctSoughtMin]);
    criteriaData.push(["PercentSought (Max)", pctSoughtMax]);

    const impliedEvRevMin = formData?.implied_ev_revenue_min?.trim() || "-";
    const impliedEvRevMax = formData?.implied_ev_revenue_max?.trim() || "-";
    criteriaData.push(["Implied EV/Revenue (Min)", impliedEvRevMin]);
    criteriaData.push(["Implied EV/Revenue (Max)", impliedEvRevMax]);

    const impliedEvEbitdaMin = formData?.implied_ev_ebitda_min?.trim() || "-";
    const impliedEvEbitdaMax = formData?.implied_ev_ebitda_max?.trim() || "-";
    criteriaData.push(["Implied EV/EBITDA (Min)", impliedEvEbitdaMin]);
    criteriaData.push(["Implied EV/EBITDA (Max)", impliedEvEbitdaMax]);

    const accMethod = formData?.accounting_method?.trim() || "-";
    criteriaData.push(["Accounting Method", accMethod]);

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
    const exportData = selected.map((item, index) => ({
      "#": index + 1,
      "Announced Date": item.announced_date || "-",
      "M&A Closed Date": item.ma_closed_date || "-",
      "Target/Issuer": item.target_issuer || item.name || "-",
      "Buyers/Investors": item.buyers_investors || item.buyers || "-",
      "Business Model Similarity": item.business_model_similarity || "-",
      "AI Rationale": item.ai_rationale || "-",
      Sellers: item.sellers || "-",
      "CIQ Transaction ID": item.ciq_transaction_id || "-",
      Country: item.geography || "-",
      "Primary Industry": item.primary_industry || "-",
      "Percent Sought": formatNumber(item.percent_sought) || "-",
      "Target Stock Premium - 1 Day Prior (%)": item.target_stock_premium_1d
        ? formatNumber(item.target_stock_premium_1d)
        : "-",
      "Target Stock Premium - 1 Week Prior (%)": item.target_stock_premium_1w
        ? formatNumber(item.target_stock_premium_1w)
        : "-",
      "Target Stock Premium - 1 Month Prior (%)": item.target_stock_premium_1m
        ? formatNumber(item.target_stock_premium_1m)
        : "-",
      "Total Transaction Value (USD Million)": item.total_transaction_value_usd
        ? formatNumber(item.total_transaction_value_usd)
        : "-",
      "Total Transaction Value (INR)": item.total_transaction_value_inr
        ? formatNumber(item.total_transaction_value_inr)
        : "-",
      "Implied Enterprise Value (USD Million)": item.implied_ev_usd
        ? formatNumber(item.implied_ev_usd)
        : "-",
      "EV/Revenue (X)": item.ev_revenue
        ? `${formatNumber(item.ev_revenue)}x`
        : "-",
      "EV/EBITDA (X)": item.ev_ebitda
        ? `${formatNumber(item.ev_ebitda)}x`
        : "-",
      "Target Revenue": item.target_revenue
        ? formatNumber(item.target_revenue)
        : "-",
      "Target EBITDA": item.target_ebitda
        ? formatNumber(item.target_ebitda)
        : "-",
      "Acquirer Revenue": item.acquirer_revenue
        ? formatNumber(item.acquirer_revenue)
        : "-",
      "Acquirer EBITDA": item.acquirer_ebitda
        ? formatNumber(item.acquirer_ebitda)
        : "-",
      "Consideration Offered": item.consideration_offered || "-",
      "Target Security Type": item.target_security_type || "-",
      "Accounting Method": item.accounting_method || "-",
      "Deal Attitude": item.deal_attitude || "-",
      "Business Description (Target/Issuer)": item.business_description || "-",
      Comments: item.comments || "-",
      "Created At": item.created_at || "-",
    }));

    const resultsSheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for results sheet
    resultsSheet["!cols"] = [
      { wch: 5 }, // #
      { wch: 15 }, // Announced Date
      { wch: 15 }, // M&A Closed Date
      { wch: 35 }, // Target/Issuer
      { wch: 35 }, // Buyers/Investors
      { wch: 35 }, // Business Model Similarity
      { wch: 35 }, // AI Rationale
      { wch: 35 }, // Sellers
      { wch: 20 }, // CIQ Transaction ID
      { wch: 25 }, // Country
      { wch: 25 }, // Primary Industry
      { wch: 15 }, // Percent Sought
      { wch: 20 }, // Total Transaction Value (USD Million)
      { wch: 20 }, // Implied Enterprise Value (USD Million)
      { wch: 15 }, // EV/Revenue (X)
      { wch: 15 }, // EV/EBITDA (X)
      { wch: 15 }, // Target Revenue
      { wch: 15 }, // Target EBITDA
      { wch: 15 }, // Acquirer Revenue
      { wch: 15 }, // Acquirer EBITDA
      { wch: 20 }, // Consideration Offered
      { wch: 20 }, // Target Security Type
      { wch: 20 }, // Accounting Method
      { wch: 15 }, // Deal Attitude
      { wch: 50 }, // Business Description (Target/Issuer)
      { wch: 100 }, // Comments
      { wch: 25 }, // Created At
    ];

    XLSX.utils.book_append_sheet(workbook, resultsSheet, "Results");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "tsa_screening_results_with_criteria.xlsx");
    toast.success("Transaction screening results exported successfully");
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
              dispatch(clearTsaAllData());
              toast.success(
                "Transaction screening results cleared successfully",
              );
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
                    `AI comparison is only available for 200 or fewer companies. You have ${totalCount} companies.`,
                  );
                  return;
                }
                dispatch(toggleTsaRunAISwitch(e.target.checked));
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
                  dispatch(updateTsaAiCompareDescription(e.target.value));
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
                <option value="similarity-medium">Similarity: Medium</option>
                <option value="similarity-low">Similarity: Low</option>
                <option value="sort-name">Sort by: Company Name</option>
                <option value="sort-ev">Sort by: Enterprise Value</option>
                <option value="sort-ev-revenue">Sort by: EV/Revenue</option>
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
                    key={item.id || item.target_issuer || index}
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
                        checked={
                          !!selectedCompanies[item.id || item.target_issuer]
                        }
                        onChange={(e) => {
                          e.stopPropagation();
                          dispatch(toggleTsaCompanySelection(item));
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 text-sm">
                        {item.ma_closed_date || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {item.target_issuer || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-sm line-clamp-2">
                        {item.buyers_investors || item.buyers || "-"}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 text-sm">
                        {item.percent_sought
                          ? `${formatNumber(item.percent_sought)}%`
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      {item.total_transaction_value_usd
                        ? `$ ${formatNumber(item.total_transaction_value_usd)} MM`
                        : "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <div className="line-clamp-2">
                        {item.business_description
                          ? highlightKeywords(
                              item.business_description,
                              userKeywords,
                            )
                          : "-"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      {item.implied_ev_usd
                        ? `$ ${formatNumber(item.implied_ev_usd)} MM`
                        : "-"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      <span className="inline-flex items-center">
                        {item.ev_revenue
                          ? `${formatNumber(item.ev_revenue)}x`
                          : "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      {item.ev_ebitda
                        ? `${formatNumber(item.ev_ebitda)}x`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-center">
                      {item.geography || "-"}
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

export default TSAResultsTable;
