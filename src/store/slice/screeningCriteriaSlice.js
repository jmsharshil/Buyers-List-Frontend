import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

// Local storage helpers (guarded for environments without window)
const storageAvailable = () => typeof window !== "undefined" && !!window.localStorage;
const STORAGE_KEY = "screeningCriteria";
const saveToStorage = (partialState) => {
  try {
    if (!storageAvailable()) return;
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = { ...existing, ...partialState };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Silently handle localStorage errors (e.g., in private browsing mode)
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

// Async thunk for running GET screening
export const runScreening = createAsyncThunk(
  "screeningCriteria/runScreening",
  async (criteria, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (criteria.compare_description?.trim()) {
        params.append(
          "compare_description",
          criteria.compare_description.trim()
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
              params.append("headquarters_country_region", cleanCountry);
            }
          }
        });
      }

      // Primary sectors
      if (criteria.primary_sectors?.length) {
        criteria.primary_sectors.forEach((sector) => {
          if (sector?.trim()) {
            params.append("primary_sector", sector.trim());
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

      if (criteria.ev_revenu_min?.trim()) {
        params.append("ev_revenu_min", criteria.ev_revenu_min.trim());
      }
      if (criteria.ev_revenu_max?.trim()) {
        params.append("ev_revenu_max", criteria.ev_revenu_max.trim());
      }
      if (criteria.ev_ebitda_min?.trim()) {
        params.append("ev_ebitda_min", criteria.ev_ebitda_min.trim());
      }
      if (criteria.ev_ebitda_max?.trim()) {
        params.append("ev_ebitda_max", criteria.ev_ebitda_max.trim());
      }

      if (criteria.total_revenue_min?.trim()) {
        params.append("total_revenue_min", criteria.total_revenue_min.trim());
      }
      if (criteria.total_revenue_max?.trim()) {
        params.append("total_revenue_max", criteria.total_revenue_max.trim());
      }

      if (criteria.enterprise_value_min?.trim()) {
        params.append(
          "enterprise_value_min",
          criteria.enterprise_value_min.trim()
        );
      }
      if (criteria.enterprise_value_max?.trim()) {
        params.append(
          "enterprise_value_max",
          criteria.enterprise_value_max.trim()
        );
      }
      
      // Pricing Date parameters with correct names
      if (criteria.pricing_date_min?.trim()) {
        params.append("first_pricing_date_min", criteria.pricing_date_min.trim());
      }
      if (criteria.pricing_date_max?.trim()) {
        params.append("first_pricing_date_max", criteria.pricing_date_max.trim());
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

      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/buyerslist/api/companies/?${params.toString()}`,
        {
          headers: getAuthHeaders(),
        },
      );

      // console.log(
      //   `${
      //     import.meta.env.VITE_BASE_URL
      //   }/api/v1/api/companies/?${params.toString()}`
      // );
      console.log(response.data)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Store a reference to the AbortController so we can cancel it
let currentAIController = null;

// Thunk for AI Comparison - includes all original screening criteria
export const runAIComparison = createAsyncThunk(
  "screeningCriteria/runAIComparison",
  async (compareDescription, { getState, rejectWithValue }) => {
    try {
      if (currentAIController) {
        currentAIController.abort();
      }
      currentAIController = new AbortController();

      const state = getState();
      const formData = state.screeningCriteria.formData;

      const params = new URLSearchParams();
      if (compareDescription?.trim()) {
        params.append("compare_description", compareDescription.trim());
      }

      if (formData.headquarters_country_region?.length) {
        formData.headquarters_country_region.forEach((country) => {
          if (country?.trim()) {
            const cleanCountry = country.startsWith("custom:")
              ? country.replace("custom:", "").trim()
              : country.trim();
            if (cleanCountry) {
              params.append("headquarters_country_region", cleanCountry);
            }
          }
        });
      }

      // Primary sectors
      if (formData.primary_sectors?.length) {
        formData.primary_sectors.forEach((sector) => {
          if (sector?.trim()) {
            params.append("primary_sector", sector.trim());
          }
        });
      }
      // Primary industries
      if (formData.primary_industries?.length) {
        formData.primary_industries.forEach((industry) => {
          if (industry?.trim()) {
            params.append("primary_industry", industry.trim());
          }
        });
      }
      if (formData.ev_revenu_min?.trim()) {
        params.append("ev_revenu_min", formData.ev_revenu_min.trim());
      }
      if (formData.ev_revenu_max?.trim()) {
        params.append("ev_revenu_max", formData.ev_revenu_max.trim());
      }
      if (formData.ev_ebitda_min?.trim()) {
        params.append("ev_ebitda_min", formData.ev_ebitda_min.trim());
      }
      if (formData.ev_ebitda_max?.trim()) {
        params.append("ev_ebitda_max", formData.ev_ebitda_max.trim());
      }
      if (formData.total_revenue_min?.trim()) {
        params.append("total_revenue_min", formData.total_revenue_min.trim());
      }
      if (formData.total_revenue_max?.trim()) {
        params.append("total_revenue_max", formData.total_revenue_max.trim());
      }
      if (formData.enterprise_value_min?.trim()) {
        params.append("enterprise_value_min", formData.enterprise_value_min.trim());
      }
      if (formData.enterprise_value_max?.trim()) {
        params.append("enterprise_value_max", formData.enterprise_value_max.trim());
      }
      
      // Pricing Date parameters with correct names
      if (formData.pricing_date_min?.trim()) {
        params.append("first_pricing_date_min", formData.pricing_date_min.trim());
      }
      if (formData.pricing_date_max?.trim()) {
        params.append("first_pricing_date_max", formData.pricing_date_max.trim());
      }

      if (formData.keywords?.length) {
        // Reorder keywords: "or" conditions first, then "and" conditions
        const orIndex = formData.keyword_condition.indexOf("or");
        const andIndex = formData.keyword_condition.indexOf("and");
        
        // Add "or" keywords first if they exist
        if (orIndex !== -1 && formData.keywords[orIndex]?.trim()) {
          const orKeywordList = formData.keywords[orIndex]
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
          
          if (orKeywordList.length) {
            params.append("keywords", orKeywordList.join(","));
            params.append("keyword_condition", "or");
          }
        }
        
        // Add "and" keywords second if they exist
        if (andIndex !== -1 && formData.keywords[andIndex]?.trim()) {
          const andKeywordList = formData.keywords[andIndex]
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
          
          if (andKeywordList.length) {
            params.append("keywords", andKeywordList.join(","));
            params.append("keyword_condition", "and");
          }
        }
      }

      const url = `${import.meta.env.VITE_BASE_URL}/buyerslist/api/companies/?${params.toString()}`;

      const response = await axios.get(url, {
         headers: getAuthHeaders(),
        signal: currentAIController.signal,
      });

      currentAIController = null;

      return response.data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        currentAIController = null;
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Action to cancel AI comparison
export const cancelAIComparison = createAsyncThunk(
  "screeningCriteria/cancelAIComparison",
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
  }
);

// Thunk for pagination (GET)
export const fetchScreeningResults = createAsyncThunk(
  "screeningCriteria/fetchScreeningResults",
  async (url, { rejectWithValue }) => {
    try {
      // Force HTTPS if backend returns HTTP due to proxy config issues
      const secureUrl = url ? url.replace(/^http:\/\//i, 'https://') : url;
      const response = await axios.get(secureUrl, {
         headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const selectAllCompanies = createAsyncThunk(
  "screeningCriteria/selectAllCompanies",
  async (currentResults, { rejectWithValue }) => {
    try {
      const allCompanies = [];
      const fetchedUrls = new Set();

      if (currentResults?.results) {
        allCompanies.push(...currentResults.results);
      }

      let nextUrl = currentResults?.next;
      while (nextUrl && !fetchedUrls.has(nextUrl)) {
        fetchedUrls.add(nextUrl);
        // Force HTTPS if backend returns HTTP
        const secureNextUrl = nextUrl.replace(/^http:\/\//i, 'https://');
        const response = await axios.get(secureNextUrl, {
          headers: getAuthHeaders(),
        });
        if (response.data.results) {
          allCompanies.push(...response.data.results);
        }
        nextUrl = response.data.next;
      }

      let previousUrl = currentResults?.previous;
      while (previousUrl && !fetchedUrls.has(previousUrl)) {
        fetchedUrls.add(previousUrl);
        // Force HTTPS if backend returns HTTP
        const securePrevUrl = previousUrl.replace(/^http:\/\//i, 'https://');
        const response = await axios.get(securePrevUrl, {
          headers: getAuthHeaders(),
        });
        if (response.data.results) {
          allCompanies.unshift(...response.data.results);
        }
        previousUrl = response.data.previous;
      }

      // console.log(`Selected ${allCompanies.length} companies from all pages`);
      return allCompanies;
    } catch (error) {
      console.error("Error selecting all companies:", error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const persisted = loadFromStorage();

const initialState = {
  formData: {
    compare_description: "",
    headquarters_country_region: [""],
    primary_sectors: [""],
    primary_industries: [""],
    ev_revenu_min: "",
    ev_revenu_max: "",
    ev_ebitda_min: "",
    ev_ebitda_max: "",
    total_revenue_min: "",
    total_revenue_max: "",
    enterprise_value_min: "",
    enterprise_value_max: "",
    pricing_date_min: "",
    pricing_date_max: "",
    keywords: [],
    keyword_condition: [],
  },
  aiCompareDescription: "",
  runAISwitchEnabled: false,
  results: null,
  aiActive: false,
  loading: false,
  error: null,
  selectedCompanies: {},
};

if (persisted) {
  if (persisted.formData) {
    initialState.formData = { ...initialState.formData, ...persisted.formData };
  }
  if (persisted.results) {
    initialState.results = persisted.results;
  }
  if (typeof persisted.aiCompareDescription === "string") {
    initialState.aiCompareDescription = persisted.aiCompareDescription;
  }
  if (typeof persisted.runAISwitchEnabled === "boolean") {
    initialState.runAISwitchEnabled = persisted.runAISwitchEnabled;
  }
}

const screeningCriteriaSlice = createSlice({
  name: "screeningCriteria",
  initialState,
  reducers: {
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
      state.selectedCompanies = {};
      saveToStorage({ 
        formData: state.formData,
        selectedCompanies: state.selectedCompanies
      });
    },
    updateAiCompareDescription: (state, action) => {
      state.aiCompareDescription = action.payload || "";
      saveToStorage({ aiCompareDescription: state.aiCompareDescription });
    },
    toggleRunAISwitch: (state, action) => {
      state.runAISwitchEnabled = action.payload;
      saveToStorage({ runAISwitchEnabled: state.runAISwitchEnabled });
    },
    resetForm: (state) => {
      state.formData = {
        headquarters_country_region: [""],
        keywords: [],
        keyword_condition: [],
        primary_sectors: [""],
        primary_industries: [""],
        ev_revenu_min: "",
        ev_revenu_max: "",
        ev_ebitda_min: "",
        ev_ebitda_max: "",
        total_revenue_min: "",
        total_revenue_max: "",
        enterprise_value_min: "",
        enterprise_value_max: "",
        pricing_date_min: "",
        pricing_date_max: "",
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
        runAISwitchEnabled: state.runAISwitchEnabled
      });
    },
    toggleCompanySelection: (state, action) => {
      const company = action.payload;
      if (state.selectedCompanies[company.id]) {
        delete state.selectedCompanies[company.id];
      } else {
        state.selectedCompanies[company.id] = company;
      }
    },
    clearSelections: (state) => {
      state.selectedCompanies = {};
    },
    resetAI: (state) => {
      state.aiActive = false;
      state.aiCompareDescription = "";
      state.runAISwitchEnabled = false;
      saveToStorage({ 
        aiCompareDescription: state.aiCompareDescription,
        runAISwitchEnabled: state.runAISwitchEnabled 
      });
    },
    clearAllData: (state) => {
      state.formData = {
        headquarters_country_region: [""],
        keywords: [],
        keyword_condition: [],
        primary_sectors: [""],
        primary_industries: [""],
        ev_revenu_min: "",
        ev_revenu_max: "",
        ev_ebitda_min: "",
        ev_ebitda_max: "",
        total_revenue_min: "",
        total_revenue_max: "",
        enterprise_value_min: "",
        enterprise_value_max: "",
        pricing_date_min: "",
        pricing_date_max: "",
      };
      state.results = null;
      state.aiActive = false;
      state.loading = false;
      state.error = null;
      state.selectedCompanies = {};
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(runScreening.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.aiActive = false;
      })
      .addCase(runScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        saveToStorage({ results: state.results });
      })
      .addCase(runScreening.rejected, (state, action) => {
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
          runAISwitchEnabled: state.runAISwitchEnabled 
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
        if (action.error.name === 'AbortError') {
          state.loading = false;
          state.aiActive = false;
        } else {
          state.loading = false;
          state.error = action.payload;
        }
      })
      .addCase(cancelAIComparison.pending, (state) => {
        state.loading = false;
      })
      .addCase(cancelAIComparison.fulfilled, (state) => {
        state.loading = false;
        state.aiActive = false;
        state.error = null;
      })
      .addCase(cancelAIComparison.rejected, (state, action) => {
        state.loading = false;
        state.aiActive = false;
        state.error = action.payload;
      })
      .addCase(fetchScreeningResults.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.aiActive = false;
      })
      .addCase(fetchScreeningResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        saveToStorage({ results: state.results });
      })
      .addCase(fetchScreeningResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(selectAllCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(selectAllCompanies.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((company) => {
          state.selectedCompanies[company.id] = company;
        });
      })
      .addCase(selectAllCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateFormData,
  resetForm,
  toggleCompanySelection,
  clearSelections,
  resetAI,
  clearAllData,
  updateAiCompareDescription,
  toggleRunAISwitch,
} = screeningCriteriaSlice.actions;
export default screeningCriteriaSlice.reducer;
