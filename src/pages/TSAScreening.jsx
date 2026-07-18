import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  updateTsaFormData,
  resetTsaForm,
  runTsaScreeningCriteria,
} from "../store/slice/tsaScreeningCriteriaSlice";
import { fetchTsaSummary } from "../store/slice/tsaDashboard.Slice";
import CountryCriteria from "../components/ScreeningForm/CountryCriteria";
import PrimarySelection from "../components/ScreeningForm/PrimarySelection";
import TSAFinancialCriteria from "../components/ScreeningForm/TSAFinancialCriteria";
import KeywordsCondition from "../components/ScreeningForm/KeywordsCondition";

import DateDisplay from "../components/ui/DateDisplay";
import CustomLoader from "../components/ui/CustomLoader";
import { Earth, Loader, WholeWord } from "lucide-react";
import { debounce } from "lodash";
import UserProfile from "../components/Layout/UserProfile";
import { getAuthHeaders } from "../utils/helper";
import { fetchDates } from "../store/slice/databaseOverviewSlice";

const TSAScreening = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { formData, loading } = useSelector(
    (state) => state.tsaScreeningCriteria,
  );

  const { tsaSummary } = useSelector((state) => state.tsaDashboard);

  const date = useSelector((state) => state.databaseOverview.dates);
  
  const [counts, setCounts] = useState({
    countries: 0,
    keywords: 0,
    primarySelection: 0,
    financialCriteria: 0,
  });

  const [countsLoading, setCountsLoading] = useState({
    countries: false,
    keywords: false,
    primarySelection: false,
    financialCriteria: false,
  });

  // Helper function to convert dd-mm-yyyy to yyyy-mm-dd
  const convertDateFormat = (dateStr) => {
    if (!dateStr || !dateStr.trim()) return "";
    const parts = dateStr.trim().split("-");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${mm}-${dd}`;
    }
    return dateStr.trim();
  };

  // Debounced API call for counts
  const fetchCount = useCallback(
    debounce(async (updatedData, section) => {
      try {
        setCountsLoading((prev) => ({ ...prev, [section]: true }));

        const params = new URLSearchParams();

        // Country handling (normal + custom)
        if (updatedData.headquarters_country_region?.length) {
          updatedData.headquarters_country_region.forEach((c) => {
            if (c?.trim()) {
              const cleanCountry = c.startsWith("custom:")
                ? c.replace("custom:", "").trim()
                : c.trim();
              if (cleanCountry) {
                params.append("geography", cleanCountry);
              }
            }
          });
        }

        // Primary industries
        if (updatedData.primary_industries?.length) {
          updatedData.primary_industries.forEach((industry) => {
            if (industry?.trim()) {
              params.append("primary_industry", industry.trim());
            }
          });
        }

        // TSA-specific financial fields
        if (updatedData.ma_closed_date_min?.trim()) {
          params.append(
            "ma_closed_date_min",
            convertDateFormat(updatedData.ma_closed_date_min),
          );
        }
        if (updatedData.ma_closed_date_max?.trim()) {
          params.append(
            "ma_closed_date_max",
            convertDateFormat(updatedData.ma_closed_date_max),
          );
        }
        if (updatedData.implied_enterprise_value_usd_min?.trim()) {
          params.append(
            "implied_ev_usd_min",
            updatedData.implied_enterprise_value_usd_min.trim(),
          );
        }
        if (updatedData.implied_enterprise_value_usd_max?.trim()) {
          params.append(
            "implied_ev_usd_max",
            updatedData.implied_enterprise_value_usd_max.trim(),
          );
        }
        if (updatedData.total_transaction_value_usd_min?.trim()) {
          params.append(
            "txn_value_usd_min",
            updatedData.total_transaction_value_usd_min.trim(),
          );
        }
        if (updatedData.total_transaction_value_usd_max?.trim()) {
          params.append(
            "txn_value_usd_max",
            updatedData.total_transaction_value_usd_max.trim(),
          );
        }
        if (updatedData.percent_sought_min?.trim()) {
          params.append(
            "percent_sought_min",
            updatedData.percent_sought_min.trim(),
          );
        }
        if (updatedData.percent_sought_max?.trim()) {
          params.append(
            "percent_sought_max",
            updatedData.percent_sought_max.trim(),
          );
        }
        if (updatedData.implied_ev_revenue_min?.trim()) {
          params.append(
            "ev_revenue_min",
            updatedData.implied_ev_revenue_min.trim(),
          );
        }
        if (updatedData.implied_ev_revenue_max?.trim()) {
          params.append(
            "ev_revenue_max",
            updatedData.implied_ev_revenue_max.trim(),
          );
        }
        if (updatedData.implied_ev_ebitda_min?.trim()) {
          params.append(
            "ev_ebitda_min",
            updatedData.implied_ev_ebitda_min.trim(),
          );
        }
        if (updatedData.implied_ev_ebitda_max?.trim()) {
          params.append(
            "ev_ebitda_max",
            updatedData.implied_ev_ebitda_max.trim(),
          );
        }
        if (updatedData.accounting_method?.trim()) {
          params.append(
            "accounting_method",
            updatedData.accounting_method.trim(),
          );
        }

        // Keywords
        if (updatedData.keywords?.length) {
          const orIndex = updatedData.keyword_condition.indexOf("or");
          const andIndex = updatedData.keyword_condition.indexOf("and");

          if (orIndex !== -1 && updatedData.keywords[orIndex]?.trim()) {
            const orKeywordList = updatedData.keywords[orIndex]
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean);

            if (orKeywordList.length) {
              params.append("keywords", orKeywordList.join(","));
              params.append("keyword_condition", "or");
            }
          }

          if (andIndex !== -1 && updatedData.keywords[andIndex]?.trim()) {
            const andKeywordList = updatedData.keywords[andIndex]
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean);

            if (andKeywordList.length) {
              params.append("keywords", andKeywordList.join(","));
              params.append("keyword_condition", "and");
            }
          }
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/v1/transactions/screening/?${params.toString()}`,
          {
            headers: getAuthHeaders(),
          },
        );

        setCounts((prev) => ({
          ...prev,
          [section]: response.data.count || 0,
        }));
      } catch (err) {
        console.error("Error fetching count:", err);
        setCounts((prev) => ({ ...prev, [section]: 0 }));
      } finally {
        setCountsLoading((prev) => ({ ...prev, [section]: false }));
      }
    }, 500),
    [],
  );

  // One-time initialization
  const didInitDefaultsRef = useRef(false);
  const motionRef = useRef(motion);

  useEffect(() => {
    dispatch(fetchTsaSummary());
    dispatch(fetchDates());
    document.title = "Transaction Screening";
  }, [dispatch]);

  useEffect(() => {
    if (didInitDefaultsRef.current) return;
    didInitDefaultsRef.current = true;

    if (motionRef.current) {
      // no-op - satisfy linter
    }

    const first = (formData.headquarters_country_region?.[0] || "").trim();
    if (!first) {
      const updatedCountries = [
        "United States of America",
        ...(formData.headquarters_country_region?.slice(1) || []),
      ];
      const updated = {
        ...formData,
        headquarters_country_region: updatedCountries,
      };
      dispatch(
        updateTsaFormData({ headquarters_country_region: updatedCountries }),
      );
      fetchCount(updated, "countries");
    } else if (
      formData.headquarters_country_region?.some((c) => c && c.trim())
    ) {
      fetchCount(formData, "countries");
    }
  }, [dispatch, fetchCount]);

  // Watch for countries changes
  useEffect(() => {
    if (didInitDefaultsRef.current) {
      const hasCountries = formData.headquarters_country_region?.some((c) =>
        c?.trim(),
      );
      if (hasCountries) {
        fetchCount(formData, "countries");
      } else {
        setCounts((prev) => ({ ...prev, countries: 0 }));
      }
    }
  }, [formData.headquarters_country_region, fetchCount]);

  // Watch for keyword changes
  useEffect(() => {
    if (didInitDefaultsRef.current) {
      if (formData.keywords.length > 0) {
        fetchCount(formData, "keywords");
      } else {
        setCounts((prev) => ({ ...prev, keywords: 0 }));
      }
    }
  }, [formData.keywords, formData.keyword_condition, fetchCount]);

  // Watch for Primary Selection changes (industry only for TSA)
  useEffect(() => {
    if (didInitDefaultsRef.current) {
      if (formData.primary_industries?.some((i) => i.trim())) {
        fetchCount(formData, "primarySelection");
      } else {
        setCounts((prev) => ({ ...prev, primarySelection: 0 }));
      }
    }
  }, [formData.primary_industries, fetchCount]);

  // Watch for Financial Criteria changes
  useEffect(() => {
    if (didInitDefaultsRef.current) {
      const hasFinancialData =
        formData.ma_closed_date_min ||
        formData.ma_closed_date_max ||
        formData.implied_enterprise_value_usd_min ||
        formData.implied_enterprise_value_usd_max ||
        formData.total_transaction_value_usd_min ||
        formData.total_transaction_value_usd_max ||
        formData.percent_sought_min ||
        formData.percent_sought_max ||
        formData.implied_ev_revenue_min ||
        formData.implied_ev_revenue_max ||
        formData.implied_ev_ebitda_min ||
        formData.implied_ev_ebitda_max ||
        formData.accounting_method;

      if (hasFinancialData) {
        fetchCount(formData, "financialCriteria");
      } else {
        setCounts((prev) => ({ ...prev, financialCriteria: 0 }));
      }
    }
  }, [
    formData.ma_closed_date_min,
    formData.ma_closed_date_max,
    formData.implied_enterprise_value_usd_min,
    formData.implied_enterprise_value_usd_max,
    formData.total_transaction_value_usd_min,
    formData.total_transaction_value_usd_max,
    formData.percent_sought_min,
    formData.percent_sought_max,
    formData.implied_ev_revenue_min,
    formData.implied_ev_revenue_max,
    formData.implied_ev_ebitda_min,
    formData.implied_ev_ebitda_max,
    formData.accounting_method,
    fetchCount,
  ]);

  const updateCriteriaField = (field, value, sectionForCount = null) => {
    const updated = { ...formData, [field]: value };
    dispatch(updateTsaFormData({ [field]: value }));

    if (sectionForCount) {
      fetchCount(updated, sectionForCount);
    }
  };

  const updateCountries = (index, value) => {
    const updated = [...formData.headquarters_country_region];
    updated[index] = value;
    updateCriteriaField("headquarters_country_region", updated, "countries");
  };

  const addCountry = () => {
    if (formData.headquarters_country_region.length < 5) {
      updateCriteriaField(
        "headquarters_country_region",
        [...formData.headquarters_country_region, ""],
        "countries",
      );
    }
  };

  const removeCountry = (index) => {
    if (formData.headquarters_country_region.length > 1) {
      const updated = formData.headquarters_country_region.filter(
        (_, i) => i !== index,
      );
      updateCriteriaField("headquarters_country_region", updated, "countries");
    }
  };

  const handleRunScreening = async () => {
    const response = await dispatch(runTsaScreeningCriteria(formData));
    if (runTsaScreeningCriteria.fulfilled.match(response)) {
      navigate("/tsa-results");
    }
  };

  // Check if form is empty
  const isFormEmpty = () => {
    const f = formData;

    const hasCountries = f.headquarters_country_region.some(
      (c) => c.trim() !== "",
    );
    const hasKeywords = f.keywords.length > 0;
    const hasPrimary = f.primary_industries.some((i) => i.trim());
    const hasFinancial =
      f.ma_closed_date_min?.trim() ||
      f.ma_closed_date_max?.trim() ||
      f.implied_enterprise_value_usd_min?.trim() ||
      f.implied_enterprise_value_usd_max?.trim() ||
      f.total_transaction_value_usd_min?.trim() ||
      f.total_transaction_value_usd_max?.trim() ||
      f.percent_sought_min?.trim() ||
      f.percent_sought_max?.trim() ||
      f.implied_ev_revenue_min?.trim() ||
      f.implied_ev_revenue_max?.trim() ||
      f.implied_ev_ebitda_min?.trim() ||
      f.implied_ev_ebitda_max?.trim() ||
      f.accounting_method?.trim();

    return !(hasCountries || hasKeywords || hasPrimary || hasFinancial);
  };

  const handleClearScreening = () => {
    dispatch(resetTsaForm());
    setCounts({
      countries: 0,
      keywords: 0,
      primarySelection: 0,
      financialCriteria: 0,
    });
    if (!isFormEmpty()) {
      toast.success("Transaction screening form cleared successfully");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen px-4 pt-6 pb-24 sm:px-32 lg:px-34">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-end mb-8">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <UserProfile />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Screening Criteria
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Configure your screening parameters to identify and analyze relevant
            transactions based on your specific criteria
          </p>
        </div>

        {/* Clear Form Button (Top) */}
        <div className="w-full flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-3 bg-red-600 w-auto my-5 mx-auto text-white rounded-xl shadow-2xl font-semibold text-lg hover:bg-red-700 transition-colors cursor-pointer"
            onClick={handleClearScreening}
          >
            Clear Form
          </motion.button>
        </div>

        {/* Countries & Keywords */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 md:p-8 mb-7 flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <CountryCriteria
              countries={formData.headquarters_country_region}
              addCountry={addCountry}
              updateCountry={updateCountries}
              removeCountry={removeCountry}
              category="tsa"
              countryOptions={tsaSummary.countries || []}
            />
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-600 rounded-full">
              <Earth className="w-5 h-5 text-indigo-700" />
              {countsLoading.countries ? (
                <span className="text-sm font-semibold text-indigo-900 animate-pulse">
                  <Loader />
                </span>
              ) : (
                <span className="text-sm font-semibold text-indigo-900">
                  {counts.countries}{" "}
                  {counts.countries === 1 ? "Company" : "Companies"} Found
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <KeywordsCondition category="tsa" />
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-600 rounded-full">
              <WholeWord className="w-5 h-5 text-blue-700" />
              {countsLoading.keywords ? (
                <span className="text-sm font-semibold text-indigo-900 animate-pulse">
                  <Loader />
                </span>
              ) : (
                <span className="text-sm font-semibold text-indigo-900">
                  {counts.keywords}{" "}
                  {counts.keywords === 1 ? "Company" : "Companies"} Found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Selection - Industry ONLY (no sectors for TSA) */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 md:p-8 mb-7">
          <PrimarySelection
            primarySectors={[""]}
            setPrimarySectors={() => {}}
            primaryIndustries={formData.primary_industries}
            setPrimaryIndustries={(val) =>
              updateCriteriaField("primary_industries", val, "primarySelection")
            }
            hideSectors={true}
            category="tsa"
            industryOptions={tsaSummary.industries || []}
          />
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-purple-50 border border-purple-600 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-purple-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            {countsLoading.primarySelection ? (
              <span className="text-sm font-semibold text-indigo-900 animate-pulse">
                <Loader />
              </span>
            ) : (
              <span className="text-sm font-semibold text-indigo-900">
                {counts.primarySelection}{" "}
                {counts.primarySelection === 1 ? "Company" : "Companies"} Found
              </span>
            )}
          </div>
        </div>

        {/* Financial Criteria - TSA specific */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 md:p-8 mb-7">
          <TSAFinancialCriteria
            maClosedDateMin={formData.ma_closed_date_min}
            setMaClosedDateMin={(val) =>
              updateCriteriaField(
                "ma_closed_date_min",
                val,
                "financialCriteria",
              )
            }
            maClosedDateMax={formData.ma_closed_date_max}
            setMaClosedDateMax={(val) =>
              updateCriteriaField(
                "ma_closed_date_max",
                val,
                "financialCriteria",
              )
            }
            impliedEnterpriseValueUsdMin={
              formData.implied_enterprise_value_usd_min
            }
            setImpliedEnterpriseValueUsdMin={(val) =>
              updateCriteriaField(
                "implied_enterprise_value_usd_min",
                val,
                "financialCriteria",
              )
            }
            impliedEnterpriseValueUsdMax={
              formData.implied_enterprise_value_usd_max
            }
            setImpliedEnterpriseValueUsdMax={(val) =>
              updateCriteriaField(
                "implied_enterprise_value_usd_max",
                val,
                "financialCriteria",
              )
            }
            totalTransactionValueUsdMin={
              formData.total_transaction_value_usd_min
            }
            setTotalTransactionValueUsdMin={(val) =>
              updateCriteriaField(
                "total_transaction_value_usd_min",
                val,
                "financialCriteria",
              )
            }
            totalTransactionValueUsdMax={
              formData.total_transaction_value_usd_max
            }
            setTotalTransactionValueUsdMax={(val) =>
              updateCriteriaField(
                "total_transaction_value_usd_max",
                val,
                "financialCriteria",
              )
            }
            percentSoughtMin={formData.percent_sought_min}
            setPercentSoughtMin={(val) =>
              updateCriteriaField(
                "percent_sought_min",
                val,
                "financialCriteria",
              )
            }
            percentSoughtMax={formData.percent_sought_max}
            setPercentSoughtMax={(val) =>
              updateCriteriaField(
                "percent_sought_max",
                val,
                "financialCriteria",
              )
            }
            impliedEvRevenueMin={formData.implied_ev_revenue_min}
            setImpliedEvRevenueMin={(val) =>
              updateCriteriaField(
                "implied_ev_revenue_min",
                val,
                "financialCriteria",
              )
            }
            impliedEvRevenueMax={formData.implied_ev_revenue_max}
            setImpliedEvRevenueMax={(val) =>
              updateCriteriaField(
                "implied_ev_revenue_max",
                val,
                "financialCriteria",
              )
            }
            impliedEvEbitdaMin={formData.implied_ev_ebitda_min}
            setImpliedEvEbitdaMin={(val) =>
              updateCriteriaField(
                "implied_ev_ebitda_min",
                val,
                "financialCriteria",
              )
            }
            impliedEvEbitdaMax={formData.implied_ev_ebitda_max}
            setImpliedEvEbitdaMax={(val) =>
              updateCriteriaField(
                "implied_ev_ebitda_max",
                val,
                "financialCriteria",
              )
            }
            accountingMethod={formData.accounting_method}
            setAccountingMethod={(val) =>
              updateCriteriaField("accounting_method", val, "financialCriteria")
            }
          />
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-600 rounded-full">
            {countsLoading.financialCriteria ? (
              <span className="text-sm font-semibold text-green-900 animate-pulse">
                <Loader />
              </span>
            ) : (
              <span className="text-sm font-semibold text-green-900">
                {counts.financialCriteria}{" "}
                {counts.financialCriteria === 1 ? "Company" : "Companies"} Found
              </span>
            )}
          </div>
          <h3 className="flex justify-center text-xl font-bold text-gray-900 mb-3">
            All the screening is as of {date?.transaction_date}
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-5 mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={isFormEmpty()}
            className={`px-10 py-3 rounded-xl shadow-2xl font-semibold text-lg transition-colors cursor-pointer
              ${
                isFormEmpty()
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            onClick={handleRunScreening}
          >
            Run Screening
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-3 bg-red-600 text-white rounded-xl shadow-2xl font-semibold text-lg hover:bg-red-700 transition-colors cursor-pointer"
            onClick={handleClearScreening}
          >
            Clear Form
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TSAScreening;
