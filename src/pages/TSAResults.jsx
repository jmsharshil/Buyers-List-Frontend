import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ResultsHeader from "../components/ResultsComponents/ResultsHeader";
import ScreeningResultsSummary from "../components/ResultsComponents/ScreeningResultsSummary";
import ScreeningCriteriaDisplay from "../components/ResultsComponents/ScreeningCriteriaDisplay";
import TSAResultsTable from "../components/ResultsComponents/TSAResultsTable";
import ExportButton from "../components/ui/ExportButton";
import FeedbackModal from "../components/ui/FeedbackModal";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "react-toastify";

const TSAScreeningResults = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { selectedCompanies = {}, formData = {}, results = {}, aiCompareDescription } = useSelector(
    (state) => state.tsaScreeningCriteria
  );

  useEffect(() => {
    document.title = "Transaction Screening Results";
  }, []);

  // Helper function to format numbers with commas and 2 decimal places
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "" || value === "-") return "-";
    
    const num = parseFloat(value);
    if (isNaN(num)) return "-";
    
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleExportWithCriteria = () => {
    const selected = Object.values(selectedCompanies);
    if (!selected.length) {
      alert("No companies selected for export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    // ===== SHEET 1: SCREENING CRITERIA =====
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
    const countries = formData.headquarters_country_region?.filter((c) => c.trim() !== "");
    if (countries && countries.length > 0) {
      const displayCountries = countries
        .map((c) => (c.startsWith("custom:") ? c.replace("custom:", "") : c))
        .join(", ");
      criteriaData.push(["Countries", displayCountries]);
    } else {
      criteriaData.push(["Countries", "-"]);
    }

    // Keywords
    if (formData.keywords && formData.keywords.length > 0) {
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
    const displayIndustries = formData.primary_industries?.filter((i) => i?.trim())?.join(", ") || "-";
    criteriaData.push([
      "Primary Industries",
      displayIndustries,
    ]);

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

    const maClosedDateMin = formData.ma_closed_date_min?.trim() || "-";
    const maClosedDateMax = formData.ma_closed_date_max?.trim() || "-";
    criteriaData.push(["M&A Closed Date (Min)", maClosedDateMin]);
    criteriaData.push(["M&A Closed Date (Max)", maClosedDateMax]);

    const impliedEvUsdMin = formData.implied_enterprise_value_usd_min?.trim() || "-";
    const impliedEvUsdMax = formData.implied_enterprise_value_usd_max?.trim() || "-";
    criteriaData.push(["Implied Enterprise Value (USD) (Min)", impliedEvUsdMin]);
    criteriaData.push(["Implied Enterprise Value (USD) (Max)", impliedEvUsdMax]);

    const txValUsdMin = formData.total_transaction_value_usd_min?.trim() || "-";
    const txValUsdMax = formData.total_transaction_value_usd_max?.trim() || "-";
    criteriaData.push(["Total Transaction Value (USD) (Min)", txValUsdMin]);
    criteriaData.push(["Total Transaction Value (USD) (Max)", txValUsdMax]);

    const pctSoughtMin = formData.percent_sought_min?.trim() || "-";
    const pctSoughtMax = formData.percent_sought_max?.trim() || "-";
    criteriaData.push(["Percent Sought (Min)", pctSoughtMin]);
    criteriaData.push(["Percent Sought (Max)", pctSoughtMax]);

    const impliedEvRevMin = formData.implied_ev_revenue_min?.trim() || "-";
    const impliedEvRevMax = formData.implied_ev_revenue_max?.trim() || "-";
    criteriaData.push(["Implied EV/Revenue (Min)", impliedEvRevMin]);
    criteriaData.push(["Implied EV/Revenue (Max)", impliedEvRevMax]);

    const impliedEvEbitdaMin = formData.implied_ev_ebitda_min?.trim() || "-";
    const impliedEvEbitdaMax = formData.implied_ev_ebitda_max?.trim() || "-";
    criteriaData.push(["Implied EV/EBITDA (Min)", impliedEvEbitdaMin]);
    criteriaData.push(["Implied EV/EBITDA (Max)", impliedEvEbitdaMax]);

    const accMethod = formData.accounting_method?.trim() || "-";
    criteriaData.push(["Accounting Method", accMethod]);

    const criteriaWorksheet = XLSX.utils.aoa_to_sheet(criteriaData);
    
    // Set column widths for criteria sheet
    criteriaWorksheet["!cols"] = [{ wch: 30 }, { wch: 60 }];

    // Style the header
    if (criteriaWorksheet["A1"]) {
      criteriaWorksheet["A1"].s = {
        font: { bold: true, sz: 14 },
        fill: { fgColor: { rgb: "4F46E5" } },
      };
    }

    XLSX.utils.book_append_sheet(workbook, criteriaWorksheet, "Screening Criteria");

    // ===== SHEET 2: SCREENING RESULTS (ALL FIELDS) =====
    const resultsData = selected.map((item, index) => ({
      "#": index + 1,
      "Announced Date": item.announced_date || "-",
      "M&A Closed Date": item.ma_closed_date || "-",
      "Target/Issuer": item.target_issuer || item.name || "-",
      "Buyers/Investors": item.buyers_investors || item.buyers || "-",
      "Business Model Similarity": item.business_model_similarity || "-",
      "AI Rationale": item.ai_rationale || "-",
      "Sellers": item.sellers || "-",
      "CIQ Transaction ID": item.ciq_transaction_id || "-",
      "Country": item.geography || "-",
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
      "Implied Enterprise Value (USD Million)": item.implied_ev_usd 
        ? formatNumber(item.implied_ev_usd) 
        : "-",
      "EV/Revenue (X)": item.ev_revenue 
        ? `${formatNumber(item.ev_revenue)}x` 
        : "-",
      "EV/EBITDA (X)": item.ev_ebitda 
        ? `${formatNumber(item.ev_ebitda)}x` 
        : "-",
      "Target Revenue": item.target_revenue ? formatNumber(item.target_revenue) : "-",
      "Target EBITDA": item.target_ebitda ? formatNumber(item.target_ebitda) : "-",
      "Acquirer Revenue": item.acquirer_revenue ? formatNumber(item.acquirer_revenue) : "-",
      "Acquirer EBITDA": item.acquirer_ebitda ? formatNumber(item.acquirer_ebitda) : "-",
      "Consideration Offered": item.consideration_offered || "-",
      "Target Security Type": item.target_security_type || "-",
      "Accounting Method": item.accounting_method || "-",
      "Deal Attitude": item.deal_attitude || "-",
      "Business Description (Target/Issuer)": item.business_description || "-",
      "Comments": item.comments || "-",
      "Created At": item.created_at || "-",
    }));

    const resultsWorksheet = XLSX.utils.json_to_sheet(resultsData);
    
    // Set column widths for results sheet
    resultsWorksheet["!cols"] = [
      { wch: 5 },  // #
      { wch: 15 }, // Announced Date
      { wch: 15 }, // M&A Closed Date
      { wch: 35 }, // Target/Issuer
      { wch: 35 }, // Buyers/Investors
      { wch: 35 }, // Business Model Similarity
      { wch: 35 }, // AI Rationale
      { wch: 35 }, // Sellers
      { wch: 20 }, // CIQ Transaction ID
      { wch: 25 }, // Geography
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

    XLSX.utils.book_append_sheet(workbook, resultsWorksheet, "Results");

    // Export the workbook
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "screening_results_with_criteria.xlsx");
    toast.success("Transaction screening results exported successfully");
  };

  return (
    <div className="bg-gray-100 min-h-screen px-4 pt-6 pb-24 sm:px-32 lg:px-34">
      {/* Header Section */}
      <ResultsHeader category="tsa" />

      {/* Screening Summary */}
      <ScreeningResultsSummary category="tsa" setIsFeedbackOpen={setIsFeedbackOpen} />

      {/* Applied Screening Criteria Display */}
      <ScreeningCriteriaDisplay category="tsa" />

      {/* Screening Table */}
      <TSAResultsTable />

      {/* Export Button with Criteria */}
      <div className="flex justify-center mt-8 gap-4">
        <div className="w-[50%] flex justify-center gap-4">
          <ExportButton
            label="Download Complete Report with Criteria"
            onClick={handleExportWithCriteria}
            disabled={Object.keys(selectedCompanies).length === 0}
            variant="success"
          />
        </div>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        title="Transaction Screening Feedback"
      />
    </div>
  );
};

export default TSAScreeningResults;