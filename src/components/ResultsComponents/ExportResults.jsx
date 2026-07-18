import { BookDown } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExportResults = () => {
  const { selectedCompanies, formData, results, aiCompareDescription } = useSelector((state) => state.screeningCriteria);

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

  const handleExport = () => {
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

    // Add primary sectors and industries
    const displaySectors = formData?.primary_sectors?.filter((s) => s?.trim())?.join(", ") || "-";
    criteriaData.push([
      "Primary Sectors",
      displaySectors,
    ]);
    const displayIndustries = formData?.primary_industries?.filter((i) => i?.trim())?.join(", ") || "-";
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
      "Company Details": item.name || "-",
      Ticker: item.exchange_ticker || "-",
      "Business Overview": item.business_description || "-",
      "Business Model Similarity": item.business_model_similarity || "-",
      "AI Rationale": item.ai_rationale || "-",
      "Total Enterprise Value ($ USD)": item.latest_financial?.enterprise_value 
        ? formatNumber(item.latest_financial?.enterprise_value) 
        : "-",
      "EV/Revenue (X)": item.latest_financial?.ev_revenu 
        ? `${formatNumber(item.latest_financial?.ev_revenu)} ×` 
        : "-",
      "Total Revenue ($ MM USD)": item.latest_financial?.total_revenue 
        ? formatNumber(item.latest_financial?.total_revenue) 
        : "-",
      Country: item.headquarters_country_region || "-",
      Select: !!selectedCompanies[item.id] ? "Yes" : "No",
    }));

    // Create Excel workbook and sheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Screening Results");

    // Generate Excel file and save
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "screening_results.xlsx");
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-blue-400 items-center text-center">
      <h2 className="text-3xl font-bold text-gray-800">Export Your Results</h2>

      <p className="mt-2 text-lg text-gray-500">
        Download comprehensive reports in Excel/CSV format
      </p>

      <button
        onClick={handleExport}
        className={`w-full mt-6 inline-flex items-center justify-center px-6 py-4 bg-indigo-500 hover:bg-indigo-700 text-white font-semibold text-xl rounded-xl ${
          Object.keys(selectedCompanies).length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""
        }`}
        disabled={Object.keys(selectedCompanies).length === 0}
      >
        <BookDown className="w-5 h-5 mr-2" />
        Download Screening Results
      </button>
    </div>
  );
};

export default ExportResults;