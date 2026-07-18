import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for Microsoft login
export const microsoftLogin = createAsyncThunk(
  "signIn/microsoftLogin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/auth/microsoft/login/`
      );

      // Redirect to the auth URL provided by backend
      window.location.href = response.data.auth_url;

      // Return the auth URL (though the redirect will happen before this)
      return response.data.auth_url;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
};

const signInSlice = createSlice({
  name: "signIn",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(microsoftLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(microsoftLogin.fulfilled, (state) => {
        state.loading = false;
        // Redirect happens, so state may not be updated if component unmounts
      })
      .addCase(microsoftLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = signInSlice.actions;
export default signInSlice.reducer;
