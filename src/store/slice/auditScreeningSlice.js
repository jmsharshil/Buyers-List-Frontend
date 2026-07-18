import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

export const fetchAuditScreeningResults = createAsyncThunk(
  "auditScreening/fetchAuditScreeningResults",
  async (criteria, { rejectWithValue }) => {
    const params = new URLSearchParams();

    if (criteria.category && criteria.category.trim()) {
      params.append("type", criteria.category.trim());
    }

    if (criteria.subCategory) {
      const subCategoryValue = Array.isArray(criteria.subCategory)
        ? criteria.subCategory
            .filter((s) => s?.trim())
            .map((s) => s.trim())
            .join(",")
        : criteria.subCategory.trim();

      if (subCategoryValue) {
        params.append("classification", subCategoryValue);
      }
    }

    if (criteria.auditor) {
      const auditorValue = Array.isArray(criteria.auditor)
        ? criteria.auditor
            .filter((a) => a?.trim())
            .map((a) => a.trim())
            .join(",")
        : criteria.auditor.trim();

      if (auditorValue) {
        params.append("auditor", auditorValue);
      }
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/audit/filter-records/?${params.toString()}`,
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  auditScreeningResults: [],
  selectedRows: [],
};

const auditScreeningSlice = createSlice({
  name: "auditScreening",
  initialState,
  reducers: {
    resetAuditScreening: (state) => {
      state.auditScreeningResults = [];
      state.selectedRows = [];
    },
    setSelectedRows: (state, action) => {
      state.selectedRows = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditScreeningResults.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditScreeningResults.fulfilled, (state, action) => {
        state.loading = false;
        state.auditScreeningResults = action.payload;
      })
      .addCase(fetchAuditScreeningResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuditScreening, setSelectedRows } =
  auditScreeningSlice.actions;
export default auditScreeningSlice.reducer;
