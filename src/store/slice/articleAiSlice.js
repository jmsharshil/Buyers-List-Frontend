import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

// Load active chat from localStorage on initial load
const loadActiveChatFromStorage = () => {
  try {
    const savedActiveChat = localStorage.getItem("articleAiActiveChat");
    return savedActiveChat ? JSON.parse(savedActiveChat) : null;
  } catch (error) {
    console.error("Error loading active chat from storage:", error);
    return null;
  }
};

// Async thunk for fetching all chats with their messages
export const fetchAllChats = createAsyncThunk(
  "articleAi/fetchAllChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/article/chats/names/`,
        {
          headers: getAuthHeaders(),
        },
      );

      // Format the response to match the expected structure
      const chats = response.data.map((chat) => ({
        id: chat.id,
        title: chat.title,
        timestamp: new Date(chat.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: chat.created_at.includes(new Date().getFullYear())
            ? undefined
            : "numeric",
        }),
        ...chat,
      }));

      return chats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for creating a new chat
export const createNewChat = createAsyncThunk(
  "articleAi/createNewChat",
  async (chatData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/article/chats/`,
        {
          title: chatData.title,
          system_prompt:
            "You are a professional article writer and editor. Your goal is to help users create high-quality, engaging, and well-researched articles. Provide structured content with headings, subheadings, and a clear flow. Offer suggestions for improvement and ensure the tone is appropriate for the target audience.",
          ...(chatData.systemPrompt && {
            system_prompt: chatData.systemPrompt,
          }),
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );

      // Format the response to match the expected chat structure
      const newChat = {
        id: response.data.id,
        title: response.data.title || chatData.title,
        timestamp: new Date(response.data.created_at).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          },
        ),
        messages: response.data.messages || [],
        ...response.data,
      };

      return newChat;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for deleting a chat
export const deleteChat = createAsyncThunk(
  "articleAi/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/article/chats/${chatId}/delete/`,
        {
          headers: getAuthHeaders(),
        },
      );

      return chatId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for sending a message to GPT
export const sendMessageToGPT = createAsyncThunk(
  "articleAi/sendMessageToGPT",
  async ({ chatId, content, selectedFiles = [] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (selectedFiles.length > 0) {
        formData.append("attachment", selectedFiles[0]);
      }

      const response = await axios.post(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/article/chats/${chatId}/messages/send/`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
          },
        },
      );

      const message = {
        id: response.data.id,
        content: response.data.content,
        role: response.data.role,
        timestamp: response.data.created_at || new Date().toISOString(),
        ...response.data,
      };

      return { chatId, message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for fetching messages for a specific chat
export const fetchChatMessages = createAsyncThunk(
  "articleAi/fetchChatMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/article/chats/${chatId}/messages`,
        {
          headers: getAuthHeaders(),
        },
      );

      const messages = response.data;

      // Find all edited/replaced message roots
      const editedMessageIds = new Set(
        messages
          .filter((m) => m.metadata?.replaced_by_edit_of)
          .map((m) => m.metadata.replaced_by_edit_of),
      );

      // If no edits, return normal messages
      if (editedMessageIds.size === 0) {
        return { chatId, messages };
      }

      // Build cleaned message list
      const cleanedMessages = [];

      let skipOldBranch = false;

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        // If this user message was edited,
        // remove everything after it until regenerated assistant
        if (msg.role === "user" && editedMessageIds.has(msg.id)) {
          cleanedMessages.push(msg);
          skipOldBranch = true;
          continue;
        }

        // Keep regenerated assistant response
        if (msg.role === "assistant" && msg.metadata?.replaced_by_edit_of) {
          // avoid duplicate assistant inserts
          const alreadyExists = cleanedMessages.some(
            (m) => m.role === "assistant" && m.content === msg.content,
          );

          if (!alreadyExists) {
            cleanedMessages.push(msg);
          }

          skipOldBranch = false;
          continue;
        }

        // Skip stale branch messages
        if (skipOldBranch) {
          continue;
        }

        // Deduplicate assistants by content
        if (msg.role === "assistant") {
          const duplicate = cleanedMessages.some(
            (m) => m.role === "assistant" && m.content === msg.content,
          );

          if (duplicate) {
            continue;
          }
        }

        cleanedMessages.push(msg);
      }

      return {
        chatId,
        messages: cleanedMessages,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for editing and resending a message
export const editAndResendMessage = createAsyncThunk(
  "articleAi/editAndResendMessage",
  async ({ chatId, messageId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/article/chats/${chatId}/messages/${messageId}/edit-and-resend/?content=${encodeURIComponent(
          content,
        )}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );

      const message = {
        id: response.data.id,
        content: response.data.content,
        role: response.data.role,
        timestamp: response.data.created_at || new Date().toISOString(),
        ...response.data,
      };

      return { chatId, message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for extracting article data from file
export const extractArticle = createAsyncThunk(
  "articleAi/extractArticle",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("input_file", file);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/articles/extract/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...getAuthHeaders(),
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to extract article data.",
      );
    }
  },
);

// Async thunk for updating an extraction field
export const updateExtractionField = createAsyncThunk(
  "articleAi/updateExtractionField",
  async (
    { extractionId, rowIndex, header, editValue, activeTab },
    { rejectWithValue },
  ) => {
    try {
      const payload = {
        target: activeTab || "securities",
        security_index: rowIndex,
        fields: {
          [header]: editValue,
        },
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/articles/extractions/${extractionId}/`,
        payload,
        { headers: getAuthHeaders() },
      );

      return { rowIndex, header, editValue, response: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update field",
      );
    }
  },
);

export const getUpdatedExtractionField = createAsyncThunk(
  "articleAi/getUpdatedExtractionField",
  async ({ extractionId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/articles/extractions/${extractionId}/`,
        { headers: getAuthHeaders() },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to get updated extraction field",
      );
    }
  },
);

export const pollExtractionStatus = createAsyncThunk(
  "articleAi/pollExtractionStatus",
  async ({ statusUrl }, { rejectWithValue }) => {
    try {
      // Ensure the URL is absolute or handle it correctly if it's relative
      const response = await axios.get(statusUrl, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to poll extraction status",
      );
    }
  },
);

export const getExtractionAuditHistory = createAsyncThunk(
  "articleAi/getExtractionAuditHistory",
  async ({ extractionId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/articles/extractions/${extractionId}/audit/`,
        { headers: getAuthHeaders() },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch audit history",
      );
    }
  },
);

const initialState = {
  chats: [],
  chatsLoaded: true,
  activeChat: loadActiveChatFromStorage(),
  loading: false,
  error: null,
  streamingMessage: "",
  isStreaming: false,
  result: [],
  auditHistory: [],
  auditHistoryLoading: false,
};

const articleAiSlice = createSlice({
  name: "articleAi",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      const newChat = action.payload;
      // If the chat we are setting is already the active chat,
      // preserve the messages if the new object doesn't have them
      if (state.activeChat && state.activeChat.id === newChat.id) {
        state.activeChat = {
          ...newChat,
          messages: newChat.messages || state.activeChat.messages || [],
        };
      } else {
        state.activeChat = newChat;
      }

      try {
        localStorage.setItem(
          "articleAiActiveChat",
          JSON.stringify(state.activeChat),
        );
      } catch (error) {
        console.error("Error saving active chat to storage:", error);
      }
    },
    clearActiveChat: (state) => {
      state.activeChat = null;
      try {
        localStorage.removeItem("articleAiActiveChat");
      } catch (error) {
        console.error("Error removing active chat from storage:", error);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    startStreaming: (state) => {
      state.streamingMessage = "";
      state.isStreaming = true;
    },
    updateStreamingMessage: (state, action) => {
      state.streamingMessage += action.payload;
    },
    clearStreamingMessage: (state) => {
      state.streamingMessage = "";
      state.isStreaming = false;
    },
    addMessageToChat: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      if (chat) {
        if (!chat.messages) {
          chat.messages = [];
        }
        const messageExists = chat.messages.some(
          (msg) => msg.id === message.id,
        );
        if (!messageExists) {
          chat.messages.push(message);
        }
      }

      if (state.activeChat && state.activeChat.id === chatId) {
        if (!state.activeChat.messages) {
          state.activeChat.messages = [];
        }
        const messageExists = state.activeChat.messages.some(
          (msg) => msg.id === message.id,
        );
        if (!messageExists) {
          state.activeChat.messages.push(message);
          try {
            localStorage.setItem(
              "articleAiActiveChat",
              JSON.stringify(state.activeChat),
            );
          } catch (error) {
            console.error("Error saving active chat to storage:", error);
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllChats.fulfilled, (state, action) => {
        state.loading = false;

        // Merge incoming chats with existing ones to preserve messages
        const updatedChats = action.payload.map((newChat) => {
          const existingChat = state.chats.find((c) => c.id === newChat.id);
          return {
            ...newChat,
            messages: existingChat?.messages || newChat.messages || [],
          };
        });

        state.chats = updatedChats;
        state.chatsLoaded = true;

        if (state.activeChat) {
          const updatedActiveChat = state.chats.find(
            (chat) => chat.id === state.activeChat.id,
          );
          if (updatedActiveChat) {
            // Ensure we keep the messages in the active chat
            state.activeChat = {
              ...updatedActiveChat,
              messages:
                state.activeChat.messages || updatedActiveChat.messages || [],
            };

            try {
              localStorage.setItem(
                "articleAiActiveChat",
                JSON.stringify(state.activeChat),
              );
            } catch (error) {
              console.error("Error saving active chat to storage:", error);
            }
          }
        }
      })
      .addCase(fetchAllChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.unshift(action.payload);
        state.activeChat = action.payload;
        try {
          localStorage.setItem(
            "articleAiActiveChat",
            JSON.stringify(action.payload),
          );
        } catch (error) {
          console.error("Error saving active chat to storage:", error);
        }
      })
      .addCase(createNewChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessageToGPT.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessageToGPT.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, message } = action.payload;

        if (state.activeChat && state.activeChat.id === chatId) {
          if (!state.activeChat.messages) {
            state.activeChat.messages = [];
          }
          const messageExists = state.activeChat.messages.some(
            (msg) => msg.id === message.id,
          );
          if (!messageExists) {
            state.activeChat.messages.push(message);
            try {
              localStorage.setItem(
                "articleAiActiveChat",
                JSON.stringify(state.activeChat),
              );
            } catch (error) {
              console.error("Error saving active chat to storage:", error);
            }
          }
        }
      })
      .addCase(deleteChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.loading = false;
        const chatId = action.payload;
        state.chats = state.chats.filter((chat) => chat.id !== chatId);

        if (state.activeChat && state.activeChat.id === chatId) {
          state.activeChat = null;
          try {
            localStorage.removeItem("articleAiActiveChat");
          } catch (error) {
            console.error("Error removing active chat from storage:", error);
          }
        }
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessageToGPT.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editAndResendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAndResendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, message } = action.payload;
        const { messageId: oldMessageId } = action.meta.arg;

        if (state.activeChat && state.activeChat.id === chatId) {
          if (!state.activeChat.messages) {
            state.activeChat.messages = [];
          }

          const index = state.activeChat.messages.findIndex(
            (msg) => msg.id === oldMessageId,
          );

          if (index !== -1) {
            // Override the message at the same position and remove all subsequent messages
            // This creates a clean branch from the edited message
            state.activeChat.messages.splice(index);
            state.activeChat.messages.push(message);
          } else {
            // Fallback: Check if it already exists before pushing
            const messageExists = state.activeChat.messages.some(
              (msg) => msg.id === message.id,
            );
            if (!messageExists) {
              state.activeChat.messages.push(message);
            }
          }

          try {
            localStorage.setItem(
              "articleAiActiveChat",
              JSON.stringify(state.activeChat),
            );
          } catch (error) {
            console.error("Error saving active chat to storage:", error);
          }
        }
      })
      .addCase(editAndResendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;

        const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          state.chats[chatIndex].messages = messages;
        }

        if (state.activeChat && state.activeChat.id === chatId) {
          state.activeChat.messages = messages;
          try {
            localStorage.setItem(
              "articleAiActiveChat",
              JSON.stringify(state.activeChat),
            );
          } catch (error) {
            console.error("Error saving active chat to storage:", error);
          }
        }
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(extractArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(extractArticle.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(extractArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateExtractionField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExtractionField.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateExtractionField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUpdatedExtractionField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUpdatedExtractionField.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(getUpdatedExtractionField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getExtractionAuditHistory.pending, (state) => {
        state.auditHistoryLoading = true;
        state.error = null;
      })
      .addCase(getExtractionAuditHistory.fulfilled, (state, action) => {
        state.auditHistoryLoading = false;
        state.auditHistory = action.payload;
      })
      .addCase(getExtractionAuditHistory.rejected, (state, action) => {
        state.auditHistoryLoading = false;
        state.error = action.payload;
      })
      .addCase(pollExtractionStatus.fulfilled, (state, action) => {
        // If polling returns data, update the result
        if (action.payload) {
          state.result = action.payload;
        }
      });
  },
});

export const {
  setActiveChat,
  clearActiveChat,
  clearError,
  addMessageToChat,
  startStreaming,
  updateStreamingMessage,
  clearStreamingMessage,
} = articleAiSlice.actions;
export default articleAiSlice.reducer;
