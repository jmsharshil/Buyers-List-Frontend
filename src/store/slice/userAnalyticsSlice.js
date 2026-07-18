import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

export const getAdminAnalytics = createAsyncThunk(
  "userAnalytics/getAdminAnalytics",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/admin-panel/`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createClientSession = createAsyncThunk(
  "userAnalytics/createClientSession",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/client-project-session/`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const userFeedback = createAsyncThunk(
  "userAnalytics/userFeedback",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/feedback/`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchAdminAnalyticsList = createAsyncThunk(
  "userAnalytics/fetchAdminAnalyticsList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/admin-panel/`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchAdminAnalyticsListSearch = createAsyncThunk(
  "userAnalytics/fetchAdminAnalyticsListSearch",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/admin-panel/`,
        {
          params: payload,
          headers: getAuthHeaders(),
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const fetchAdminAnalyticsStats = createAsyncThunk(
  "userAnalytics/fetchAdminAnalyticsStats",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/admin-panel/analytics`,
        {
          params: payload,
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchClientNames = createAsyncThunk(
  "userAnalytics/fetchClientNames",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/client-master/`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const createClient = createAsyncThunk(
  "userAnalytics/createClient",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/client-master/`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );
      dispatch(fetchClientNames());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateClient = createAsyncThunk(
  "userAnalytics/updateClient",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/client-master/`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );
      dispatch(fetchClientNames());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteClient = createAsyncThunk(
  "userAnalytics/deleteClient",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/user/client-master/?id=${id}`,
        {
          headers: getAuthHeaders(),
        },
      );
      dispatch(fetchClientNames());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const userAnalyticsSlice = createSlice({
  name: "userAnalytics",
  initialState: {
    conversationStats: {
      userMessages: 0,
      aiMessages: 0,
    },
    analyticsList: [],
    listTotalCount: 0,
    analyticsStats: null,
    clientNames: [],

    createdClient: null,
    updatedClient: null,
    deletedClient: null,

    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,

    loading: false,
    statsLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdminAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.conversationStats = action.payload;
      })
      .addCase(getAdminAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createClientSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientSession.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createClientSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(userFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedback = action.payload;
      })
      .addCase(userFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminAnalyticsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalyticsList.fulfilled, (state, action) => {
        state.loading = false;
        state.analyticsList = action.payload?.results?.tracking || [];
        state.listTotalCount = action.payload?.count || 0;
      })
      .addCase(fetchAdminAnalyticsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminAnalyticsListSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalyticsListSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.analyticsList = action.payload?.results?.tracking || [];
        state.listTotalCount = action.payload?.count || 0;
      })
      .addCase(fetchAdminAnalyticsListSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminAnalyticsStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalyticsStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.analyticsStats = action.payload;
      })
      .addCase(fetchAdminAnalyticsStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchClientNames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientNames.fulfilled, (state, action) => {
        state.loading = false;
        state.clientNames = action.payload;
      })
      .addCase(fetchClientNames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.createdClient = action.payload;
        state.createSuccess = true;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      })
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        state.updatedClient = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.deletedClient = action.payload;
        state.deleteSuccess = true;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      })
  },
});

export default userAnalyticsSlice.reducer;
