// store/slice/peerCompaniesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

// Async thunk to POST peer companies for comparison
export const postPeerCompanies = createAsyncThunk(
  "peerCompanies/postPeerCompanies",
  async (formData, { rejectWithValue }) => {
    try {
      if (!formData.compare_description?.trim() || !formData.peerCompanies?.length) {
        return { results: [], meta: { company_count: 0 } };
      }

      const body = {
        compare_description: formData.compare_description.trim(),
        companies: formData.peerCompanies
          .filter((pc) => pc.name?.trim() && pc.description?.trim())
          .map((pc) => ({
            name: pc.name.trim(),
            description: pc.description.trim(),
          })),
      };
      // console.log(body)

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/api/companies/compare/`,
        body,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Peer Companies Response:", response.data); // Console the response
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  peerComparison: null,
  loading: false,
  error: null,
};

const peerCompaniesSlice = createSlice({
  name: "peerCompanies",
  initialState,
  reducers: {
    clearPeerComparison: (state) => {
      state.peerComparison = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postPeerCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postPeerCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.peerComparison = action.payload;
      })
      .addCase(postPeerCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPeerComparison } = peerCompaniesSlice.actions;
export default peerCompaniesSlice.reducer;
