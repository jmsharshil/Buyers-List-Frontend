import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

// Local storage helpers
const storageAvailable = () =>
  typeof window !== "undefined" && !!window.localStorage;
const STORAGE_KEY = "tsaScreeningCriteria";

const saveToStorage = (partialState) => {
  try {
    if (!storageAvailable()) return;
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = { ...existing, ...partialState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Silently handle localStorage errors
  }
};

const loadFromStorage = () => {
  try {
    if (!storageAvailable()) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Helper to fix invalid local hostnames in DRF pagination URLs
const fixUrl = (url) => {
  if (!url) return url;
  const baseUrl = `${import.meta.env.VITE_BASE_URL}`;
  return url.replace(/^https?:\/\/[^/]+/, baseUrl);
};

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

// Async thunk for running TSA screening
export const runTsaScreeningCriteria = createAsyncThunk(
  "tsaScreeningCriteria/runScreening",
  async (criteria, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (criteria.compare_description?.trim()) {
        params.append(
          "compare_description",
          criteria.compare_description.trim(),
        );
      }

      // Country handling (normal + custom)
      if (criteria.headquarters_country_region?.length) {
        criteria.headquarters_country_region.forEach((country) => {
          if (country?.trim()) {
            const cleanCountry = country.startsWith("custom:")
              ? country.replace("custom:", "").trim()
              : country.trim();
            if (cleanCountry) {
              params.append("geography", cleanCountry);
            }
          }
        });
      }

      // Primary industries
      if (criteria.primary_industries?.length) {
        criteria.primary_industries.forEach((industry) => {
          if (industry?.trim()) {
            params.append("primary_industry", industry.trim());
          }
        });
      }

      // transaction date
      if (criteria.ma_closed_date_min?.trim()) {
        params.append(
          "ma_closed_date_min",
          convertDateFormat(criteria.ma_closed_date_min),
        );
      }
      if (criteria.ma_closed_date_max?.trim()) {
        params.append(
          "ma_closed_date_max",
          convertDateFormat(criteria.ma_closed_date_max),
        );
      }

      // total transaction value
      if (criteria.total_transaction_value_inr_min?.trim()) {
        params.append(
          "txn_value_inr_min",
          criteria.total_transaction_value_inr_min.trim(),
        );
      }
      if (criteria.total_transaction_value_inr_max?.trim()) {
        params.append(
          "txn_value_inr_max",
          criteria.total_transaction_value_inr_max.trim(),
        );
      }

      // implied enterprise value
      if (criteria.implied_enterprise_value_inr_min?.trim()) {
        params.append(
          "implied_ev_inr_min",
          criteria.implied_enterprise_value_inr_min.trim(),
        );
      }
      if (criteria.implied_enterprise_value_inr_max?.trim()) {
        params.append(
          "implied_ev_inr_max",
          criteria.implied_enterprise_value_inr_max.trim(),
        );
      }

      // implied enterprise value
      if (criteria.implied_enterprise_value_usd_min?.trim()) {
        params.append(
          "implied_ev_usd_min",
          criteria.implied_enterprise_value_usd_min.trim(),
        );
      }
      if (criteria.implied_enterprise_value_usd_max?.trim()) {
        params.append(
          "implied_ev_usd_max",
          criteria.implied_enterprise_value_usd_max.trim(),
        );
      }

      // total transaction value usd
      if (criteria.total_transaction_value_usd_min?.trim()) {
        params.append(
          "txn_value_usd_min",
          criteria.total_transaction_value_usd_min.trim(),
        );
      }
      if (criteria.total_transaction_value_usd_max?.trim()) {
        params.append(
          "txn_value_usd_max",
          criteria.total_transaction_value_usd_max.trim(),
        );
      }

      // percent sought
      if (criteria.percent_sought_min?.trim()) {
        params.append("percent_sought_min", criteria.percent_sought_min.trim());
      }
      if (criteria.percent_sought_max?.trim()) {
        params.append("percent_sought_max", criteria.percent_sought_max.trim());
      }

      // implied enterprise value / revenues
      if (criteria.implied_ev_revenue_min?.trim()) {
        params.append("ev_revenue_min", criteria.implied_ev_revenue_min.trim());
      }
      if (criteria.implied_ev_revenue_max?.trim()) {
        params.append("ev_revenue_max", criteria.implied_ev_revenue_max.trim());
      }

      // implied enterprise value / ebitda
      if (criteria.implied_ev_ebitda_min?.trim()) {
        params.append("ev_ebitda_min", criteria.implied_ev_ebitda_min.trim());
      }
      if (criteria.implied_ev_ebitda_max?.trim()) {
        params.append("ev_ebitda_max", criteria.implied_ev_ebitda_max.trim());
      }

      // acccounting method
      if (criteria.accounting_method?.trim()) {
        params.append("accounting_method", criteria.accounting_method.trim());
      }

      // Keywords
      if (criteria.keywords?.length) {
        // Reorder keywords: "or" conditions first, then "and" conditions
        const orIndex = criteria.keyword_condition.indexOf("or");
        const andIndex = criteria.keyword_condition.indexOf("and");

        // Add "or" keywords first if they exist
        if (orIndex !== -1 && criteria.keywords[orIndex]?.trim()) {
          const orKeywordList = criteria.keywords[orIndex]
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);

          if (orKeywordList.length) {
            params.append("keywords", orKeywordList.join(","));
            params.append("keyword_condition", "or");
          }
        }

        // Add "and" keywords second if they exist
        if (andIndex !== -1 && criteria.keywords[andIndex]?.trim()) {
          const andKeywordList = criteria.keywords[andIndex]
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);

          if (andKeywordList.length) {
            params.append("keywords", andKeywordList.join(","));
            params.append("keyword_condition", "and");
          }
        }
      }

      const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/v1/transactions/screening/`;
      const url = `${baseUrl}?${params.toString()}`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for fetching TSA results by URL (pagination)
export const fetchTsaScreeningResults = createAsyncThunk(
  "tsaScreeningCriteria/fetchResults",
  async (url, { rejectWithValue }) => {
    try {
      const response = await axios.get(fixUrl(url), {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for selecting all TSA transactions
export const selectAllTsaTransactions = createAsyncThunk(
  "tsaScreeningCriteria/selectAllTransactions",
  async (currentResults, { rejectWithValue }) => {
    try {
      const allCompanies = [];
      const fetchedUrls = new Set();

      if (currentResults?.results) {
        allCompanies.push(...currentResults.results);
      }

      let nextUrl = fixUrl(currentResults?.next);
      while (nextUrl && !fetchedUrls.has(nextUrl)) {
        fetchedUrls.add(nextUrl);
        const response = await axios.get(nextUrl, {
          headers: getAuthHeaders(),
        });
        if (response.data.results) {
          allCompanies.push(...response.data.results);
        }
        nextUrl = fixUrl(response.data.next);
      }

      let previousUrl = fixUrl(currentResults?.previous);
      while (previousUrl && !fetchedUrls.has(previousUrl)) {
        fetchedUrls.add(previousUrl);
        const response = await axios.get(previousUrl, {
          headers: getAuthHeaders(),
        });
        if (response.data.results) {
          allCompanies.unshift(...response.data.results);
        }
        previousUrl = fixUrl(response.data.previous);
      }
      return allCompanies;
    } catch (error) {
      console.error("Error selecting all companies:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Store a reference to the AbortController so we can cancel it
let currentAIController = null;

export const runAIComparison = createAsyncThunk(
  "tsaScreeningCriteria/runAIComparison",
  async (compareDescription, { getState, rejectWithValue }) => {
    try {
      if (currentAIController) {
        currentAIController.abort();
      }
      currentAIController = new AbortController();

      const state = getState();
      const criteria = state.tsaScreeningCriteria.formData;

      const params = new URLSearchParams();

      if (compareDescription?.trim()) {
        params.append("compare_description", compareDescription.trim());
      }

      // Country handling (normal + custom)
      if (criteria.headquarters_country_region?.length) {
        criteria.headquarters_country_region.forEach((country) => {
          if (country?.trim()) {
            const cleanCountry = country.startsWith("custom:")
              ? country.replace("custom:", "").trim()
              : country.trim();
            if (cleanCountry) {
              params.append("geography", cleanCountry);
            }
          }
        });
      }

      // Primary industries
      if (criteria.primary_industries?.length) {
        criteria.primary_industries.forEach((industry) => {
          if (industry?.trim()) {
            params.append("primary_industry", industry.trim());
          }
        });
      }

      // transaction date
      if (criteria.ma_closed_date_min?.trim()) {
        params.append(
          "ma_closed_date_min",
          convertDateFormat(criteria.ma_closed_date_min),
        );
      }
      if (criteria.ma_closed_date_max?.trim()) {
        params.append(
          "ma_closed_date_max",
          convertDateFormat(criteria.ma_closed_date_max),
        );
      }

      // total transaction value
      if (criteria.total_transaction_value_inr_min?.trim()) {
        params.append(
          "txn_value_inr_min",
          criteria.total_transaction_value_inr_min.trim(),
        );
      }
      if (criteria.total_transaction_value_inr_max?.trim()) {
        params.append(
          "txn_value_inr_max",
          criteria.total_transaction_value_inr_max.trim(),
        );
      }

      // implied enterprise value
      if (criteria.implied_enterprise_value_inr_min?.trim()) {
        params.append(
          "implied_ev_inr_min",
          criteria.implied_enterprise_value_inr_min.trim(),
        );
      }
      if (criteria.implied_enterprise_value_inr_max?.trim()) {
        params.append(
          "implied_ev_inr_max",
          criteria.implied_enterprise_value_inr_max.trim(),
        );
      }

      // implied enterprise value USD
      if (criteria.implied_enterprise_value_usd_min?.trim()) {
        params.append(
          "implied_ev_usd_min",
          criteria.implied_enterprise_value_usd_min.trim(),
        );
      }
      if (criteria.implied_enterprise_value_usd_max?.trim()) {
        params.append(
          "implied_ev_usd_max",
          criteria.implied_enterprise_value_usd_max.trim(),
        );
      }

      // total transaction value usd
      if (criteria.total_transaction_value_usd_min?.trim()) {
        params.append(
          "txn_value_usd_min",
          criteria.total_transaction_value_usd_min.trim(),
        );
      }
      if (criteria.total_transaction_value_usd_max?.trim()) {
        params.append(
          "txn_value_usd_max",
          criteria.total_transaction_value_usd_max.trim(),
        );
      }

      // percent sought
      if (criteria.percent_sought_min?.trim()) {
        params.append("percent_sought_min", criteria.percent_sought_min.trim());
      }
      if (criteria.percent_sought_max?.trim()) {
        params.append("percent_sought_max", criteria.percent_sought_max.trim());
      }

      // implied enterprise value / revenues
      if (criteria.implied_ev_revenue_min?.trim()) {
        params.append(
          "ev_revenue_min",
          criteria.implied_ev_revenue_min.trim(),
        );
      }
      if (criteria.implied_ev_revenue_max?.trim()) {
        params.append(
          "ev_revenue_max",
          criteria.implied_ev_revenue_max.trim(),
        );
      }

      // implied enterprise value / ebitda
      if (criteria.implied_ev_ebitda_min?.trim()) {
        params.append(
          "ev_ebitda_min",
          criteria.implied_ev_ebitda_min.trim(),
        );
      }
      if (criteria.implied_ev_ebitda_max?.trim()) {
        params.append(
          "ev_ebitda_max",
          criteria.implied_ev_ebitda_max.trim(),
        );
      }

      // acccounting method
      if (criteria.accounting_method?.trim()) {
        params.append("accounting_method", criteria.accounting_method.trim());
      }

      // Keywords
      if (criteria.keywords?.length) {
        // Reorder keywords: "or" conditions first, then "and" conditions
        const orIndex = criteria.keyword_condition.indexOf("or");
        const andIndex = criteria.keyword_condition.indexOf("and");

        // Add "or" keywords first if they exist
        if (orIndex !== -1 && criteria.keywords[orIndex]?.trim()) {
          const orKeywordList = criteria.keywords[orIndex]
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);

          if (orKeywordList.length) {
            params.append("keywords", orKeywordList.join(","));
            params.append("keyword_condition", "or");
          }
        }

        // Add "and" keywords second if they exist
        if (andIndex !== -1 && criteria.keywords[andIndex]?.trim()) {
          const andKeywordList = criteria.keywords[andIndex]
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);

          if (andKeywordList.length) {
            params.append("keywords", andKeywordList.join(","));
            params.append("keyword_condition", "and");
          }
        }
      }

      const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/v1/transactions/screening/`;
      const url = `${baseUrl}?${params.toString()}`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
        signal: currentAIController.signal,
      });

      currentAIController = null;

      return response.data;
    } catch (error) {
      if (error.name !== "AbortError") {
        currentAIController = null;
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Action to cancel AI comparison
export const cancelTsaAIComparison = createAsyncThunk(
  "tsaScreeningCriteria/cancelAIComparison",
  async (_, { rejectWithValue }) => {
    try {
      if (currentAIController) {
        currentAIController.abort();
        currentAIController = null;
      }
      return { cancelled: true };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const defaultFormData = {
  headquarters_country_region: [""],
  primary_industries: [""],
  keywords: [],
  keyword_condition: [],
  // TSA-specific financial fields
  ma_closed_date_min: "",
  ma_closed_date_max: "",
  total_transaction_value_inr_min: "",
  total_transaction_value_inr_max: "",
  implied_enterprise_value_usd_min: "",
  implied_enterprise_value_usd_max: "",
  total_transaction_value_usd_min: "",
  total_transaction_value_usd_max: "",
  percent_sought_min: "",
  percent_sought_max: "",
  implied_ev_revenue_min: "",
  implied_ev_revenue_max: "",
  implied_ev_ebitda_min: "",
  implied_ev_ebitda_max: "",
  accounting_method: "",
};

const persisted = loadFromStorage();

const initialState = {
  formData: { ...defaultFormData },
  results: null,
  loading: false,
  error: null,
  selectedCompanies: {},
  aiActive: false,
  aiCompareDescription: "",
  runAISwitchEnabled: false,
};

if (persisted?.formData) {
  initialState.formData = { ...defaultFormData, ...persisted.formData };
}
if (persisted?.results) {
  initialState.results = persisted.results;
}

if (persisted?.selectedCompanies) {
  initialState.selectedCompanies = persisted.selectedCompanies;
}
if (persisted?.aiCompareDescription) {
  initialState.aiCompareDescription = persisted.aiCompareDescription;
}

const tsaScreeningCriteriaSlice = createSlice({
  name: "tsaScreeningCriteria",
  initialState,
  reducers: {
    updateTsaFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
      state.selectedCompanies = {};
      saveToStorage({
        formData: state.formData,
        selectedCompanies: state.selectedCompanies,
      });
    },
    resetTsaForm: (state) => {
      state.formData = {
        headquarters_country_region: [""],
        primary_industries: [""],
        keywords: [],
        keyword_condition: [],
        ma_closed_date_min: "",
        ma_closed_date_max: "",
        total_transaction_value_inr_min: "",
        total_transaction_value_inr_max: "",
        implied_enterprise_value_usd_min: "",
        implied_enterprise_value_usd_max: "",
        total_transaction_value_usd_min: "",
        total_transaction_value_usd_max: "",
        percent_sought_min: "",
        percent_sought_max: "",
        implied_ev_revenue_min: "",
        implied_ev_revenue_max: "",
        implied_ev_ebitda_min: "",
        implied_ev_ebitda_max: "",
        accounting_method: "",
      };
      state.selectedCompanies = {};
      state.aiActive = false;
      state.aiCompareDescription = "";
      state.runAISwitchEnabled = false;
      state.loading = false;
      state.error = null;
      saveToStorage({
        formData: state.formData,
        selectedCompanies: state.selectedCompanies,
        aiCompareDescription: state.aiCompareDescription,
        runAISwitchEnabled: state.runAISwitchEnabled,
      });
    },
    clearTsaAllData: (state) => {
      state.formData = { ...defaultFormData };
      state.results = null;
      state.loading = false;
      state.error = null;
      state.selectedCompanies = {};
      state.aiActive = false;
      state.aiCompareDescription = "";
      state.runAISwitchEnabled = false;
      try {
        if (storageAvailable()) {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Silently handle localStorage errors
      }
    },
    toggleTsaCompanySelection: (state, action) => {
      const company = action.payload;
      const id = company.id || company.target_issuer;
      if (id) {
        if (state.selectedCompanies[id]) {
          delete state.selectedCompanies[id];
        } else {
          state.selectedCompanies[id] = company;
        }
        saveToStorage({ selectedCompanies: state.selectedCompanies });
      }
    },
    clearTsaSelections: (state) => {
      state.selectedCompanies = {};
      saveToStorage({ selectedCompanies: state.selectedCompanies });
    },
    updateTsaAiCompareDescription: (state, action) => {
      state.aiCompareDescription = action.payload;
      saveToStorage({ aiCompareDescription: state.aiCompareDescription });
    },
    toggleTsaRunAISwitch: (state, action) => {
      state.runAISwitchEnabled = action.payload;
    },
    runAIComparison: (state) => {
      state.aiActive = true;
    },
    resetTsaAI: (state) => {
      state.aiActive = false;
      state.aiCompareDescription = "";
      state.runAISwitchEnabled = false;
      saveToStorage({
        aiCompareDescription: state.aiCompareDescription,
        runAISwitchEnabled: state.runAISwitchEnabled,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runTsaScreeningCriteria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runTsaScreeningCriteria.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.selectedCompanies = {};
        state.aiActive = false;
        state.aiCompareDescription = "";
        state.runAISwitchEnabled = false;
        saveToStorage({
          results: state.results,
          selectedCompanies: state.selectedCompanies,
          aiCompareDescription: state.aiCompareDescription,
          runAISwitchEnabled: state.runAISwitchEnabled,
        });
      })
      .addCase(runTsaScreeningCriteria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTsaScreeningResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTsaScreeningResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        saveToStorage({ results: state.results });
      })
      .addCase(fetchTsaScreeningResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(selectAllTsaTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(selectAllTsaTransactions.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((company) => {
          const id = company?.id || company?.target_issuer;
          if (id) {
            state.selectedCompanies[id] = company;
          }
        });
        saveToStorage({ selectedCompanies: state.selectedCompanies });
      })
      .addCase(selectAllTsaTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(runAIComparison.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.aiCompareDescription = action.meta.arg || "";
        state.runAISwitchEnabled = true;
        saveToStorage({
          aiCompareDescription: state.aiCompareDescription,
          runAISwitchEnabled: state.runAISwitchEnabled,
        });
      })
      .addCase(runAIComparison.fulfilled, (state, action) => {
        state.loading = false;
        state.results = {
          ...state.results,
          results: action.payload.results,
        };
        state.aiActive = true;
        saveToStorage({ results: state.results });
      })
      .addCase(runAIComparison.rejected, (state, action) => {
        if (
          action.error?.name === "AbortError" ||
          action.payload === "AbortError" ||
          action.meta?.aborted
        ) {
          state.loading = false;
          state.aiActive = false;
        } else {
          state.loading = false;
          state.error = action.payload;
        }
      })
      .addCase(cancelTsaAIComparison.pending, (state) => {
        state.loading = false;
      })
      .addCase(cancelTsaAIComparison.fulfilled, (state) => {
        state.loading = false;
        state.aiActive = false;
        state.error = null;
      })
      .addCase(cancelTsaAIComparison.rejected, (state, action) => {
        state.loading = false;
        state.aiActive = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateTsaFormData,
  resetTsaForm,
  clearTsaAllData,
  toggleTsaCompanySelection,
  clearTsaSelections,
  updateTsaAiCompareDescription,
  toggleTsaRunAISwitch,
  resetTsaAI,
} = tsaScreeningCriteriaSlice.actions;

export default tsaScreeningCriteriaSlice.reducer;
