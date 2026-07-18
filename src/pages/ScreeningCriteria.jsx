import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  updateFormData,
  resetForm,
  runScreening,
} from "../store/slice/screeningCriteriaSlice";
import CountryCriteria from "../components/ScreeningForm/CountryCriteria";
import PrimarySelection from "../components/ScreeningForm/PrimarySelection";
import FinancialCriteria from "../components/ScreeningForm/FinancialCriteria";
import KeywordsCondition from "../components/ScreeningForm/KeywordsCondition";
import PeerCompanies from "../components/ScreeningForm/PeerCompanies";
import { toast } from "react-toastify";
import DateDisplay from "../components/ui/DateDisplay";
import CustomLoader from "../components/ui/CustomLoader";
import { Earth, Loader, WholeWord } from "lucide-react";
import { debounce } from "lodash";
import UserProfile from "../components/Layout/UserProfile";
import { getAuthHeaders } from "../utils/helper";
import { fetchDates } from "../store/slice/databaseOverviewSlice";

const ScreeningCriteria = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { formData, loading } = useSelector((state) => state.screeningCriteria);
  const date = useSelector((state) => state.databaseOverview.dates);

  const [counts, setCounts] = useState({
    countries: 0,
    keywords: 0,
    primarySelection: 0,
    financialCriteria: 0,
  });

  // ✅ New: loader states for counts
  const [countsLoading, setCountsLoading] = useState({
    countries: false,
    keywords: false,
    primarySelection: false,
    financialCriteria: false,
  });

  // Debounced API call for counts - using useCallback properly
  const fetchCount = useCallback(
    debounce(async (updatedData, section) => {
      try {
        setCountsLoading((prev) => ({ ...prev, [section]: true }));

        const params = new URLSearchParams();

        if (updatedData.compare_description?.trim()) {
          params.append(
            "compare_description",
            updatedData.compare_description.trim(),
          );
        }

        // Country handling (normal + custom)
        if (updatedData.headquarters_country_region?.length) {
          updatedData.headquarters_country_region.forEach((c) => {
            if (c?.trim()) {
              const cleanCountry = c.startsWith("custom:")
                ? c.replace("custom:", "").trim()
                : c.trim();
              if (cleanCountry) {
                params.append("headquarters_country_region", cleanCountry);
              }
            }
          });
        }

        // Primary sectors
        if (updatedData.primary_sectors?.length) {
          updatedData.primary_sectors.forEach((sector) => {
            if (sector?.trim()) {
              params.append("primary_sector", sector.trim());
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

        if (updatedData.ev_revenu_min?.trim()) {
          params.append("ev_revenu_min", updatedData.ev_revenu_min.trim());
        }
        if (updatedData.ev_revenu_max?.trim()) {
          params.append("ev_revenu_max", updatedData.ev_revenu_max.trim());
        }
        if (updatedData.ev_ebitda_min?.trim()) {
          params.append("ev_ebitda_min", updatedData.ev_ebitda_min.trim());
        }
        if (updatedData.ev_ebitda_max?.trim()) {
          params.append("ev_ebitda_max", updatedData.ev_ebitda_max.trim());
        }
        if (updatedData.total_revenue_min?.trim()) {
          params.append(
            "total_revenue_min",
            updatedData.total_revenue_min.trim(),
          );
        }
        if (updatedData.total_revenue_max?.trim()) {
          params.append(
            "total_revenue_max",
            updatedData.total_revenue_max.trim(),
          );
        }
        if (updatedData.enterprise_value_min?.trim()) {
          params.append(
            "enterprise_value_min",
            updatedData.enterprise_value_min.trim(),
          );
        }
        if (updatedData.enterprise_value_max?.trim()) {
          params.append(
            "enterprise_value_max",
            updatedData.enterprise_value_max.trim(),
          );
        }

        // Pricing Date parameters
        if (updatedData.pricing_date_min?.trim()) {
          params.append(
            "first_pricing_date_min",
            updatedData.pricing_date_min.trim(),
          );
        }
        if (updatedData.pricing_date_max?.trim()) {
          params.append(
            "first_pricing_date_max",
            updatedData.pricing_date_max.trim(),
          );
        }

        // Keywords
        if (updatedData.keywords?.length) {
          // Reorder keywords: "or" conditions first, then "and" conditions
          const orIndex = updatedData.keyword_condition.indexOf("or");
          const andIndex = updatedData.keyword_condition.indexOf("and");

          // Add "or" keywords first if they exist
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

          // Add "and" keywords second if they exist
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
          `${
            import.meta.env.VITE_BASE_URL
          }/buyerslist/api/companies/?${params.toString()}`,
          {
            headers: getAuthHeaders(),
          },
        );

        setCounts((prev) => ({ ...prev, [section]: response.data.count || 0 }));
      } catch (err) {
        console.error("Error fetching count:", err);
        setCounts((prev) => ({ ...prev, [section]: 0 }));
      } finally {
        setCountsLoading((prev) => ({ ...prev, [section]: false }));
      }
    }, 500),
    []
  );

  useEffect(() => {
    dispatch(fetchDates());
    document.title = "Buyers List Screening";
  }, [dispatch]);

  // One-time initialization to set default country and trigger initial count
  const didInitDefaultsRef = useRef(false);
  const motionRef = useRef(motion);
  useEffect(() => {
    if (didInitDefaultsRef.current) return;
    didInitDefaultsRef.current = true;

    // Reference motion to satisfy linter usage
    if (motionRef.current) {
      // no-op
    }

    const first = (formData.headquarters_country_region?.[0] || "").trim();
    if (!first) {
      const updatedCountries = [
        "United States",
        ...(formData.headquarters_country_region?.slice(1) || []),
      ];
      const updated = {
        ...formData,
        headquarters_country_region: updatedCountries,
      };
      dispatch(
        updateFormData({ headquarters_country_region: updatedCountries }),
      );
      fetchCount(updated, "countries");
    } else if (
      formData.headquarters_country_region?.some((c) => c && c.trim())
    ) {
      // If user already had something selected (e.g., from storage), still show initial count
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

  // Watch for Primary Selection changes (sector and industry)
  useEffect(() => {
    if (didInitDefaultsRef.current) {
      if (
        formData.primary_sectors?.some((i) => i.trim()) ||
        formData.primary_industries?.some((i) => i.trim())
      ) {
        fetchCount(formData, "primarySelection");
      } else {
        setCounts((prev) => ({ ...prev, primarySelection: 0 }));
      }
    }
  }, [formData.primary_sectors, formData.primary_industries, fetchCount]);

  // Watch for Financial Criteria changes
  useEffect(() => {
    if (didInitDefaultsRef.current) {
      const hasFinancialData =
        formData.ev_revenu_min ||
        formData.ev_revenu_max ||
        formData.ev_ebitda_min ||
        formData.ev_ebitda_max ||
        formData.total_revenue_min ||
        formData.total_revenue_max ||
        formData.enterprise_value_min ||
        formData.enterprise_value_max ||
        formData.pricing_date_min ||
        formData.pricing_date_max;

      if (hasFinancialData) {
        fetchCount(formData, "financialCriteria");
      } else {
        setCounts((prev) => ({ ...prev, financialCriteria: 0 }));
      }
    }
  }, [
    formData.ev_revenu_min,
    formData.ev_revenu_max,
    formData.ev_ebitda_min,
    formData.ev_ebitda_max,
    formData.total_revenue_min,
    formData.total_revenue_max,
    formData.enterprise_value_min,
    formData.enterprise_value_max,
    formData.pricing_date_min,
    formData.pricing_date_max,
    fetchCount,
  ]);

  const updateCriteriaField = (field, value, sectionForCount = null) => {
    const updated = { ...formData, [field]: value };
    dispatch(updateFormData({ [field]: value }));

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
    const response = await dispatch(runScreening(formData));
    if (runScreening.fulfilled.match(response)) {
      navigate("/buyerslist-results");
    }
  };

  // ✅ Check if form is empty
  const isFormEmpty = () => {
    const f = formData;

    const hasCountries = f.headquarters_country_region.some(
      (c) => c.trim() !== "",
    );
    const hasKeywords = f.keywords.length > 0;
    const hasPrimary =
      f.primary_sectors.some((s) => s.trim()) ||
      f.primary_industries.some((i) => i.trim());
    const hasFinancial =
      f.ev_revenu_min.trim() ||
      f.ev_revenu_max.trim() ||
      f.ev_ebitda_min?.trim() ||
      f.ev_ebitda_max?.trim() ||
      f.total_revenue_min.trim() ||
      f.total_revenue_max.trim() ||
      f.enterprise_value_min.trim() ||
      f.enterprise_value_max.trim() ||
      f.pricing_date_min.trim() ||
      f.pricing_date_max.trim();

    return !(hasCountries || hasKeywords || hasPrimary || hasFinancial);
  };

  const handleClearScreening = () => {
    dispatch(resetForm());
    setCounts({
      countries: 0,
      keywords: 0,
      primarySelection: 0,
      financialCriteria: 0,
    });
    if (!isFormEmpty()) {
      toast.success("Screening criteria cleared successfully");
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
            companies based on your specific criteria
          </p>
          {/* <h3 className="flex justify-center text-xl font-bold text-gray-900 mb-3">
            All the screening is as of <DateDisplay  mm={9} dd={30} yy={2025} /> 
          </h3> */}
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
          <div className="flex-1">
            <CountryCriteria
              countries={formData.headquarters_country_region}
              addCountry={addCountry}
              updateCountry={updateCountries}
              removeCountry={removeCountry}
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

          {/* <div className="flex-1">
            <KeywordsCondition />
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
          </div> */}
        </div>

        {/* Primary Selection */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 md:p-8 mb-7">
          <PrimarySelection
            primarySectors={formData.primary_sectors}
            setPrimarySectors={(val) =>
              updateCriteriaField("primary_sectors", val, "primarySelection")
            }
            primaryIndustries={formData.primary_industries}
            setPrimaryIndustries={(val) =>
              updateCriteriaField("primary_industries", val, "primarySelection")
            }
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

        {/* Financial Criteria */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 md:p-8 mb-7">
          <FinancialCriteria
            evRevenueMin={formData.ev_revenu_min}
            setEvRevenueMin={(val) =>
              updateCriteriaField("ev_revenu_min", val, "financialCriteria")
            }
            evRevenueMax={formData.ev_revenu_max}
            setEvRevenueMax={(val) =>
              updateCriteriaField("ev_revenu_max", val, "financialCriteria")
            }
            evEbitdaMin={formData.ev_ebitda_min}
            setEvEbitdaMin={(val) =>
              updateCriteriaField("ev_ebitda_min", val, "financialCriteria")
            }
            evEbitdaMax={formData.ev_ebitda_max}
            setEvEbitdaMax={(val) =>
              updateCriteriaField("ev_ebitda_max", val, "financialCriteria")
            }
            revenueMin={formData.total_revenue_min}
            setRevenueMin={(val) =>
              updateCriteriaField("total_revenue_min", val, "financialCriteria")
            }
            revenueMax={formData.total_revenue_max}
            setRevenueMax={(val) =>
              updateCriteriaField("total_revenue_max", val, "financialCriteria")
            }
            evMin={formData.enterprise_value_min}
            setEvMin={(val) =>
              updateCriteriaField(
                "enterprise_value_min",
                val,
                "financialCriteria",
              )
            }
            evMax={formData.enterprise_value_max}
            setEvMax={(val) =>
              updateCriteriaField(
                "enterprise_value_max",
                val,
                "financialCriteria",
              )
            }
            pricingDateMin={formData.pricing_date_min}
            setPricingDateMin={(val) =>
              updateCriteriaField("pricing_date_min", val, "financialCriteria")
            }
            pricingDateMax={formData.pricing_date_max}
            setPricingDateMax={(val) =>
              updateCriteriaField("pricing_date_max", val, "financialCriteria")
            }
          />
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-600 rounded-full">
            {/* <CgDollar className="w-5 h-5 text-green-700" /> */}
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
            All the screening is as of {date?.gpc_date ?? "06/30/2026"}
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

export default ScreeningCriteria;
