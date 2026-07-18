import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

export const fetchTsaSummary = createAsyncThunk(
  "tsaDashboard/fetchTsaSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/transactions/dashboard/`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  tsaSummary: {
    total_transactions: 0,
    total_companies: 0,
    total_countries: 0,
    total_sectors: 0,
    total_industries: 0,
  },
  tsaCountries: [],
  tsaIndustries: [],
  loading: false,
  error: null,
};

const tsaDashboardSlice = createSlice({
  name: "tsaDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTsaSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTsaSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.tsaSummary = action.payload;
      })
      .addCase(fetchTsaSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("fetchTsaSummary failed:", action.payload);
      });
  },
});

export default tsaDashboardSlice.reducer;
