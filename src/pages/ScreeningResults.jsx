import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import ResultsHeader from "../components/ResultsComponents/ResultsHeader";
import ScreeningResultsSummary from "../components/ResultsComponents/ScreeningResultsSummary";
import ScreeningCriteriaDisplay from "../components/ResultsComponents/ScreeningCriteriaDisplay";
import ScreeningResultsTable from "../components/ResultsComponents/ScreeningResultsTable";
import ExportButton from "../components/ui/ExportButton";
import FeedbackModal from "../components/ui/FeedbackModal";
import { MessageSquarePlus } from "lucide-react";

const ScreeningResults = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { selectedCompanies, formData, results, aiCompareDescription } = useSelector(
    (state) => state.screeningCriteria
  );

  useEffect(() => {
    document.title = "Buyers List Screening Results";
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
    const primarySectors = results?.counts?.sectors || 0;
    const primaryIndustries = results?.counts?.industries || 0;
    criteriaData.push(["SCREENING SUMMARY"]);
    criteriaData.push(["Total Results", total]);
    criteriaData.push(["By Country", byCountry]);
    criteriaData.push(["Primary Sectors", primarySectors]);
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

    // Primary Sector
    criteriaData.push([
      "Primary Sector",
      formData.primary_sector?.trim() || "-",
    ]);

    // Primary Industry
    criteriaData.push([
      "Primary Industry",
      formData.primary_industry?.trim() || "-",
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

    const evRevMin = formData.ev_revenu_min?.trim() || "-";
    const evRevMax = formData.ev_revenu_max?.trim() || "-";
    criteriaData.push(["EV/Revenue (Min)", evRevMin]);
    criteriaData.push(["EV/Revenue (Max)", evRevMax]);

    const revMin = formData.total_revenue_min?.trim() || "-";
    const revMax = formData.total_revenue_max?.trim() || "-";
    criteriaData.push(["Total Revenue (Min)", revMin]);
    criteriaData.push(["Total Revenue (Max)", revMax]);

    const evMin = formData.enterprise_value_min?.trim() || "-";
    const evMax = formData.enterprise_value_max?.trim() || "-";
    criteriaData.push(["Enterprise Value (Min)", evMin]);
    criteriaData.push(["Enterprise Value (Max)", evMax]);

    // Pricing Date Criteria
    const pricingDateMin = formData.pricing_date_min?.trim() || "-";
    const pricingDateMax = formData.pricing_date_max?.trim() || "-";
    criteriaData.push(["Pricing Date (Min)", pricingDateMin]);
    criteriaData.push(["Pricing Date (Max)", pricingDateMax]);

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
    const resultsData = selected.map((item) => ({
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
      "Total Revenue ($ MM USD)": item.latest_financial?.total_revenue
        ? formatNumber(item.latest_financial?.total_revenue)
        : "-",
    }));

    const resultsWorksheet = XLSX.utils.json_to_sheet(resultsData);

    // Set column widths for results sheet
    resultsWorksheet["!cols"] = [
      { wch: 12 }, // Company ID
      { wch: 35 }, // Company Name
      { wch: 25 }, // Excel Company ID
      { wch: 15 }, // Ticker
      { wch: 50 }, // Business Description
      { wch: 20 }, // Business Model Similarity
      { wch: 50 }, // AI Rationale
      { wch: 25 }, // Primary Sector
      { wch: 25 }, // Primary Industry
      { wch: 25 }, // Country
      { wch: 20 }, // Enterprise Value
      { wch: 15 }, // EV/Revenue
      { wch: 20 }, // Total Revenue
    ];

    XLSX.utils.book_append_sheet(workbook, resultsWorksheet, "Results");

    // Export the workbook
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "screening_results_with_criteria.xlsx");
    toast.success("Screening results with criteria exported successfully");
  };

  return (
    <div className="bg-gray-100 min-h-screen px-4 pt-6 pb-24 sm:px-32 lg:px-34">
      {/* Header Section */}
      <ResultsHeader />

      {/* Screening Summary */}
      <ScreeningResultsSummary setIsFeedbackOpen={setIsFeedbackOpen} />

      {/* Applied Screening Criteria Display */}
      <ScreeningCriteriaDisplay />

      {/* Screening Table */}
      <ScreeningResultsTable />

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
        title="GPC Screening Feedback"
      />
    </div>
  );
};

export default ScreeningResults;