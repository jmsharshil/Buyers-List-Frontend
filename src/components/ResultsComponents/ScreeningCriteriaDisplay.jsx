import React from "react";
import { useSelector } from "react-redux";
import { Filter } from "lucide-react";

const ScreeningCriteriaDisplay = ({ category }) => {
  const { formData } = useSelector((state) => 
    category === "tsa" ? state.tsaScreeningCriteria : state.screeningCriteria
  );

  // Helper to check if field has value
  const hasValue = (value) => {
    if (Array.isArray(value)) {
      return value.some((v) => v && v.trim() !== "");
    }
    return value && value.trim() !== "";
  };

  // Helper to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Build criteria array
  const criteriaItems = [];

  // Countries
  const countries = formData.headquarters_country_region?.filter((c) => c.trim() !== "");
  if (countries && countries.length > 0) {
    const displayCountries = countries
      .map((c) => (c.startsWith("custom:") ? c.replace("custom:", "") : c))
      .join(", ");
    criteriaItems.push({ label: "Countries", value: displayCountries });
  }

  // Keywords
  if (formData.keywords && formData.keywords.length > 0) {
    formData.keywords.forEach((keywordGroup, index) => {
      if (keywordGroup.trim()) {
        const condition = formData.keyword_condition?.[index] || "AND";
        criteriaItems.push({
          label: `Keywords Group ${index + 1}`,
          value: `${keywordGroup} (${condition.toUpperCase()})`,
        });
      }
    });
  }

  // Primary Sector
  if (hasValue(formData.primary_sectors)) {
    criteriaItems.push({ label: "Primary Sectors", value: formData.primary_sectors.join(", ") });
  }

  // Primary Industry
  if (hasValue(formData.primary_industries)) {
    criteriaItems.push({ label: "Primary Industries", value: formData.primary_industries.join(", ") });
  }

  // Financial Criteria (GPC)
  if (hasValue(formData.ev_revenu_min) || hasValue(formData.ev_revenu_max)) {
    const min = formData.ev_revenu_min || "-";
    const max = formData.ev_revenu_max || "-";
    criteriaItems.push({ label: "EV/Revenue", value: `${min} to ${max}` });
  }

  if (hasValue(formData.total_revenue_min) || hasValue(formData.total_revenue_max)) {
    const min = formData.total_revenue_min || "-";
    const max = formData.total_revenue_max || "-";
    criteriaItems.push({ label: "Total Revenue", value: `${min} to ${max}` });
  }

  if (hasValue(formData.enterprise_value_min) || hasValue(formData.enterprise_value_max)) {
    const min = formData.enterprise_value_min || "-";
    const max = formData.enterprise_value_max || "-";
    criteriaItems.push({ label: "Enterprise Value", value: `${min} to ${max}` });
  }

  // Pricing Date Criteria (GPC)
  if (hasValue(formData.pricing_date_min) || hasValue(formData.pricing_date_max)) {
    // const min = hasValue(formData.pricing_date_min) ? formatDate(formData.pricing_date_min) : "-";
    // const max = hasValue(formData.pricing_date_max) ? formatDate(formData.pricing_date_max) : "-";
    criteriaItems.push({ label: "Pricing Date", value: `${formData.pricing_date_min} to ${formData.pricing_date_max}` });
  }
  
  // Financial Criteria (TSA)
  if (hasValue(formData.ma_closed_date_min) || hasValue(formData.ma_closed_date_max)) {
    const min = formData.ma_closed_date_min || "-";
    const max = formData.ma_closed_date_max || "-";
    criteriaItems.push({ label: "M&A Closed Date", value: `${min} to ${max}` });
  }
  if (hasValue(formData.implied_enterprise_value_usd_min) || hasValue(formData.implied_enterprise_value_usd_max)) {
    const min = formData.implied_enterprise_value_usd_min || "-";
    const max = formData.implied_enterprise_value_usd_max || "-";
    criteriaItems.push({ label: "Implied Enterprise Value (USD)", value: `${min} to ${max}` });
  }
  if (hasValue(formData.total_transaction_value_usd_min) || hasValue(formData.total_transaction_value_usd_max)) {
    const min = formData.total_transaction_value_usd_min || "-";
    const max = formData.total_transaction_value_usd_max || "-";
    criteriaItems.push({ label: "Total Transaction Value (USD)", value: `${min} to ${max}` });
  }
  if (hasValue(formData.percent_sought_min) || hasValue(formData.percent_sought_max)) {
    const min = formData.percent_sought_min || "-";
    const max = formData.percent_sought_max || "-";
    criteriaItems.push({ label: "Percent Sought", value: `${min} to ${max}` });
  }
  if (hasValue(formData.implied_ev_revenue_min) || hasValue(formData.implied_ev_revenue_max)) {
    const min = formData.implied_ev_revenue_min || "-";
    const max = formData.implied_ev_revenue_max || "-";
    criteriaItems.push({ label: "Implied EV/Revenue", value: `${min} to ${max}` });
  }
  if (hasValue(formData.implied_ev_ebitda_min) || hasValue(formData.implied_ev_ebitda_max)) {
    const min = formData.implied_ev_ebitda_min || "-";
    const max = formData.implied_ev_ebitda_max || "-";
    criteriaItems.push({ label: "Implied EV/EBITDA", value: `${min} to ${max}` });
  }
  if (hasValue(formData.accounting_method)) {
    criteriaItems.push({ label: "Accounting Method", value: formData.accounting_method });
  }

  // If no criteria, don't render
  if (criteriaItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-blue-400  my-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-lg">
          <Filter className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Applied Screening Criteria</h2>
      </div>

      <div className="flex  w-auto flex-wrap gap-4">
        {criteriaItems.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
              {item.label}
            </div>
            <div className="text-sm font-medium text-gray-900 break-words">
              {item.value || "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreeningCriteriaDisplay;