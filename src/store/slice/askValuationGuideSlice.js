import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthHeaders } from "../../utils/helper";
import axios from "axios";

export const getValuationChats = createAsyncThunk(
  "askValuation/getValuationChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/`,
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

export const getValuationGuides = createAsyncThunk(
  "askValuation/getValuationGuides",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/guides/`,
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

// export const createNewChat = createAsyncThunk(
//   "askValuation/createNewChat",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/`,
//         payload,
//         {
//           headers: getAuthHeaders(),
//         },
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || error.message);
//     }
//   },
// );

export const createNewChat = createAsyncThunk(
  "askValuation/createNewChat",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const guideIds = payload?.guide_ids;
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/guide-chat/open/`,
        {
          guide_ids: Array.isArray(guideIds)
            ? guideIds.length === 1
              ? [guideIds[0]]
              : guideIds
            : guideIds,
        },
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

export const fetchChatMessages = createAsyncThunk(
  "askValuation/fetchChatMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/${chatId}/messages/`,
        {
          headers: getAuthHeaders(),
        },
      );
      return { chatId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteChat = createAsyncThunk(
  "askValuation/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/${chatId}/delete`,
        {
          headers: getAuthHeaders(),
        },
      );
      return chatId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateChatGuides = createAsyncThunk(
  "askValuation/updateChatGuides",
  async ({ chatId, guideIds }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/${chatId}/guides/`,
        { guide_ids: guideIds },
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

export const editValuationMessage = createAsyncThunk(
  "askValuation/editValuationMessage",
  async ({ chatId, messageId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/${chatId}/messages/${messageId}/edit/`,
        { content },
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );
      return { chatId, messageId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const uploadFileGuide = createAsyncThunk(
  "askValuation/uploadFileGuide",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/guides/`,
        formData,
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

export const clearChat = createAsyncThunk(
  "askValuation/clearChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/${chatId}/clear/`,
        {
          headers: getAuthHeaders(),
        },
      );
      return { chatId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const filterStaleMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  const editedMessages = messages.filter((m) => m.edited && m.edited_at);
  if (editedMessages.length === 0) return messages;

  return messages.filter((m) => {
    const isStale = editedMessages.some((editedMsg) => {
      if (m.id === editedMsg.id) return false;
      const msgTime = m.created_at ? new Date(m.created_at).getTime() : 0;
      const editAppliedTime = editedMsg.edited_at
        ? new Date(editedMsg.edited_at).getTime()
        : 0;
      return m.id > editedMsg.id && msgTime < editAppliedTime;
    });
    return !isStale;
  });
};

const initialState = {
  loading: false,
  chatsLoading: false,
  guidesLoading: false,
  createLoading: false,
  messagesLoading: false,
  deleteLoading: false,
  updateGuidesLoading: false,
  editLoading: false,
  error: null,
  chats: [],
  guides: [],
};

const askValuationSlice = createSlice({
  name: "askValuation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getValuationChats.pending, (state) => {
        state.chatsLoading = true;
        state.loading = true;
      })
      .addCase(getValuationChats.fulfilled, (state, action) => {
        state.chatsLoading = false;
        state.loading = false;
        const newChats = action.payload || [];
        state.chats = newChats.map((newChat) => {
          const existingChat = state.chats.find((c) => String(c.id) === String(newChat.id));
          return {
            ...newChat,
            messages: existingChat?.messages || newChat.messages || [],
          };
        });
      })
      .addCase(getValuationChats.rejected, (state, action) => {
        state.chatsLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getValuationGuides.pending, (state) => {
        state.guidesLoading = true;
        state.loading = true;
      })
      .addCase(getValuationGuides.fulfilled, (state, action) => {
        state.guidesLoading = false;
        state.loading = false;
        state.guides = action.payload;
      })
      .addCase(getValuationGuides.rejected, (state, action) => {
        state.guidesLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewChat.pending, (state) => {
        state.createLoading = true;
        state.loading = true;
      })
      .addCase(createNewChat.fulfilled, (state, action) => {
        state.createLoading = false;
        state.loading = false;
      })
      .addCase(createNewChat.rejected, (state, action) => {
        state.createLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.messagesLoading = true;
        state.loading = true;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.loading = false;
        const { chatId, messages } = action.payload;
        let chat = state.chats.find((c) => String(c.id) === String(chatId));
        if (!chat) {
          chat = { id: chatId, messages: [] };
          state.chats.push(chat);
        }
        chat.messages = filterStaleMessages(messages);
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteChat.pending, (state) => {
        state.deleteLoading = true;
        state.loading = true;
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.loading = false;
        state.chats = state.chats.filter((c) => String(c.id) !== String(action.payload));
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.deleteLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateChatGuides.pending, (state) => {
        state.updateGuidesLoading = true;
        state.loading = true;
      })
      .addCase(updateChatGuides.fulfilled, (state, action) => {
        state.updateGuidesLoading = false;
        state.loading = false;
        const updatedChat = action.payload;
        const index = state.chats.findIndex((c) => String(c.id) === String(updatedChat.id));
        if (index !== -1) {
          state.chats[index] = {
            ...state.chats[index],
            ...updatedChat,
          };
        }
      })
      .addCase(updateChatGuides.rejected, (state, action) => {
        state.updateGuidesLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editValuationMessage.pending, (state) => {
        state.editLoading = true;
        state.loading = true;
      })
      .addCase(editValuationMessage.fulfilled, (state, action) => {
        state.editLoading = false;
        state.loading = false;
        const { chatId, messages } = action.payload;
        let chat = state.chats.find((c) => String(c.id) === String(chatId));
        if (!chat) {
          chat = { id: chatId, messages: [] };
          state.chats.push(chat);
        }
        chat.messages = filterStaleMessages(messages);
      })
      .addCase(editValuationMessage.rejected, (state, action) => {
        state.editLoading = false;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearChat.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId } = action.payload;
        let chat = state.chats.find((c) => String(c.id) === String(chatId));
        if (!chat) {
          chat = { id: chatId, messages: [] };
          state.chats.push(chat);
        }
        chat.messages = [];
      })
      .addCase(clearChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadFileGuide.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadFileGuide.fulfilled, (state, action) => {
        state.loading = false;
        state.guides.unshift(action.payload);
      })
      .addCase(uploadFileGuide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default askValuationSlice.reducer;
