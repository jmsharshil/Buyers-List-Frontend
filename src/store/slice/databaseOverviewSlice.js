// src/store/slices/databaseOverviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/helper';

export const fetchSummary = createAsyncThunk(
  'databaseOverview/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/dashboard/summary/`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCountries = createAsyncThunk(
  'databaseOverview/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/dashboard/countries/`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSectors = createAsyncThunk(
  'databaseOverview/fetchSectors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/dashboard/sectors/`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchIndustries = createAsyncThunk(
  'databaseOverview/fetchIndustries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/dashboard/industries/`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDates = createAsyncThunk(
  'databaseOverview/fetchDates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/v1/project-dates/`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  summary: {
    total_companies: 0,
    total_countries: 0,
    total_sectors: 0,
    total_industries: 0
  },
  countries: {
    total_companies: 0,
    total_countries: 0,
    countries: []
  },
  sectors: {
    total_companies: 0,
    total_sectors: 0,
    sectors: []
  },
  industries: {
    total_companies: 0,
    total_industries: 0,
    industries: []
  },
  dates: {
    gpc_date: null,
    transaction_date: null,
    audit_date: null
  },
  loading: false,
  error: null,
  initialized: false,
};

const databaseOverviewSlice = createSlice({
  name: 'databaseOverview',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSectors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSectors.fulfilled, (state, action) => {
        state.loading = false;
        state.sectors = action.payload;
        state.initialized = true;
      })
      .addCase(fetchSectors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustries.fulfilled, (state, action) => {
        state.loading = false;
        state.industries = action.payload;
        state.initialized = true;
      })
      .addCase(fetchIndustries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDates.fulfilled, (state, action) => {
        state.loading = false;
        state.dates = action.payload;
        state.initialized = true;
      })
      .addCase(fetchDates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default databaseOverviewSlice.reducer;
