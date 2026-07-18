import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

export const fetchAuditAiSummary = createAsyncThunk(
  "auditAiDashboard/fetchAuditAiSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/audit/dashboard/`,
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
  total_questions: 0,
  total_types: 0,
  total_categories: 0,
  type_breakdown: [
    {
      type: "PPA",
      count: 0,
    },
    {
      type: "409A",
      count: 0,
    },
  ],
  category_breakdown: [],
  loading: false,
  error: null,
};

const auditAiDashboardSlice = createSlice({
  name: "auditAiDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditAiSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditAiSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.auditAiSummary = action.payload;
      })
      .addCase(fetchAuditAiSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default auditAiDashboardSlice.reducer;