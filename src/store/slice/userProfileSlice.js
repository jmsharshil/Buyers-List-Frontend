// src/store/slices/userProfileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/helper';

export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/auth/profile/`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        return rejectWithValue({
          message: error.response.data?.message || 'Failed to fetch profile',
          status: error.response.status,
          details: error.response.data,
        });
      } else if (error.request) {
        // Request made but no response
        return rejectWithValue({
          message: 'Network error - Please check your internet connection',
          status: null,
        });
      } else {
        // Something else happened
        return rejectWithValue({
          message: error.message || 'An unexpected error occurred',
          status: null,
        });
      }
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'userProfile/logoutUser',
  async () => {
    try {
      // Optional: Call backend logout endpoint
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/logout/`,
        {},
        { headers: getAuthHeaders() }
      );
      return { success: true };
    } catch (error) {
      // Logout should succeed even if the server request fails
      console.warn('Server logout failed, proceeding with local logout:', error.message);
      return { success: true };
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'userProfile/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/auth/profile/`,
        profileData,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue({
          message: error.response.data?.message || 'Failed to update profile',
          status: error.response.status,
          details: error.response.data,
        });
      } else {
        return rejectWithValue({
          message: error.message || 'Failed to update profile',
          status: null,
        });
      }
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'userProfile/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/change-password/`,
        passwordData,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue({
          message: error.response.data?.message || 'Failed to change password',
          status: error.response.status,
          details: error.response.data,
        });
      } else {
        return rejectWithValue({
          message: error.message || 'Failed to change password',
          status: null,
        });
      }
    }
  }
);

const initialState = {
  id: null,
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: '',
  is_admin: false,
  is_microsoft_user: false,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      Object.assign(state, initialState);
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.id;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.first_name = action.payload.first_name;
        state.last_name = action.payload.last_name;
        state.role = action.payload.role;
        state.is_admin = action.payload.is_admin;
        state.is_microsoft_user = action.payload.is_microsoft_user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState);
      })

      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Update the fields with new data
        Object.assign(state, action.payload);
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile, setAuthenticated } = userProfileSlice.actions;
export default userProfileSlice.reducer;
