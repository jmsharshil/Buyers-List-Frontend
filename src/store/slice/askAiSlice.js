import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

// Load active chat from localStorage on initial load
const loadActiveChatFromStorage = () => {
  try {
    const savedActiveChat = localStorage.getItem("askAiActiveChat");
    return savedActiveChat ? JSON.parse(savedActiveChat) : null;
  } catch (error) {
    console.error("Error loading active chat from storage:", error);
    return null;
  }
};

// Async thunk for fetching all chats with their messages
export const fetchAllChats = createAsyncThunk(
  "askAi/fetchAllChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/chats/names/`,
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
  "askAi/createNewChat",
  async (chatData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/chats/`,
        {
          title: chatData.title,
          // system_prompt: "You are a detailed, expert explainer. Always provide long, comprehensive answers with examples, step-by-step reasoning, and real-world context. Never use bullet points unless asked. Write at least 800 words per response.",
          // system_prompt: "You are a CRM assistant. Suggest next best actions.",
          system_prompt:
            "You are a senior expert assistant. Response rules require that you first directly answer the user’s question with a clear, structured, and detailed explanation, using headings, bullet points, and examples wherever helpful, while assuming the user prefers depth and professional clarity unless explicitly asked to be brief. After completing the main answer, you must always add a separate section titled “Suggestions / Next Steps” that provides actionable suggestions such as improvements, best practices, risks to watch, or follow-up actions tailored to the user’s context such as finance, valuation, or automation. The suggestions section must not repeat the main answer, and the response should maintain a professional, advisory tone throughout.",
          // system_prompt is optional, only include if provided
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
  "askAi/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/chats/${chatId}/delete/`,
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

// Async thunk for clearing a chat
export const clearChatMessages = createAsyncThunk(
  "askAi/clearChatMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/chats/${chatId}/clear/`,
        {},
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
  "askAi/sendMessageToGPT",
  async ({ chatId, content, selectedFiles = [] }, { rejectWithValue }) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Add content
      formData.append("content", content);

      // Add fixed parameters
      // formData.append("default_model", "gpt-5");
      // formData.append("temperature", "1");
      //     "default_model": "gpt-5",
      // "temperature": 1,
      // "max_tokens": 500000  //initially it was 1024

      // Add files if any
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append("attachment", file);
        });
      }

      const response = await axios.post(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/chats/${chatId}/messages/send/`,
        formData,
        {
          headers: {
            // Remove Content-Type to let axios set it automatically for FormData
            ...getAuthHeaders(),
          },
        },
      );

      // Format the response to match the expected message structure
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
  "askAi/fetchChatMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/chats/${chatId}/messages`,
        {
          headers: getAuthHeaders(),
        },
      );

      const messages = response.data;
      
      // Filter out stale messages that were replaced by edits
      const replacements = messages
        .filter((m) => m.metadata?.replaced_by_edit_of)
        .reduce((acc, m) => {
          acc[m.metadata.replaced_by_edit_of] = m.id;
          return acc;
        }, {});

      const filteredMessages = messages.filter((msg, index) => {
        if (msg.role === "assistant") {
          for (let i = index - 1; i >= 0; i--) {
            const prevMsg = messages[i];
            if (prevMsg.role === "user") {
              const replacementId = replacements[prevMsg.id];
              if (replacementId && replacementId !== msg.id) {
                return false;
              }
              break;
            }
          }
        }
        return true;
      });

      return { chatId, messages: filteredMessages };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

// Async thunk for editing and resending a message
export const editAndResendMessage = createAsyncThunk(
  "askAi/editAndResendMessage",
  async ({ chatId, messageId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/v1/chats/${chatId}/messages/${messageId}/edit-and-resend/?content=${encodeURIComponent(
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

      // Format the response to match the expected message structure
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

const initialState = {
  chats: [],
  chatsLoaded: false, // Track if chats have been loaded
  activeChat: loadActiveChatFromStorage(), // Load from localStorage
  loading: false,
  error: null,
  streamingMessage: "", // Holds the partial text while streaming
  isStreaming: false, // Whether a stream is currently active
};

const askAiSlice = createSlice({
  name: "askAi",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      // Save to localStorage
      try {
        localStorage.setItem("askAiActiveChat", JSON.stringify(action.payload));
      } catch (error) {
        console.error("Error saving active chat to storage:", error);
      }
    },
    clearActiveChat: (state) => {
      state.activeChat = null;
      // Remove from localStorage
      try {
        localStorage.removeItem("askAiActiveChat");
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
        // Prevent duplicate messages by checking if message already exists
        const messageExists = chat.messages.some(
          (msg) => msg.id === message.id,
        );
        if (!messageExists) {
          chat.messages.push(message);
        }
      }

      // Also update activeChat if it's the same chat
      if (state.activeChat && state.activeChat.id === chatId) {
        if (!state.activeChat.messages) {
          state.activeChat.messages = [];
        }
        // Prevent duplicate messages in activeChat as well
        const messageExists = state.activeChat.messages.some(
          (msg) => msg.id === message.id,
        );
        if (!messageExists) {
          state.activeChat.messages.push(message);
          // Update localStorage with the updated activeChat
          try {
            localStorage.setItem(
              "askAiActiveChat",
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
        state.chats = action.payload;
        state.chatsLoaded = true;

        // If we have an active chat, make sure it's synced with the latest data
        if (state.activeChat) {
          const updatedActiveChat = state.chats.find(
            (chat) => chat.id === state.activeChat.id,
          );
          if (updatedActiveChat) {
            state.activeChat = updatedActiveChat;
            // Update localStorage with the updated activeChat
            try {
              localStorage.setItem(
                "askAiActiveChat",
                JSON.stringify(updatedActiveChat),
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
        // Add the new chat to the chats array
        state.chats.unshift(action.payload);
        // Set the new chat as the active chat
        state.activeChat = action.payload;
        // Save to localStorage
        try {
          localStorage.setItem(
            "askAiActiveChat",
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
        // The message is already added via addMessageToChat, so we don't need to add it again here
        // Just ensure the activeChat is updated if needed
        const { chatId, message } = action.payload;

        // Also update activeChat if it's the same chat
        if (state.activeChat && state.activeChat.id === chatId) {
          if (!state.activeChat.messages) {
            state.activeChat.messages = [];
          }
          // Prevent duplicate messages in activeChat
          const messageExists = state.activeChat.messages.some(
            (msg) => msg.id === message.id,
          );
          if (!messageExists) {
            state.activeChat.messages.push(message);
            // Update localStorage with the updated activeChat
            try {
              localStorage.setItem(
                "askAiActiveChat",
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

        // Remove the deleted chat from the chats array
        state.chats = state.chats.filter((chat) => chat.id !== chatId);

        // If the deleted chat was the active chat, clear the active chat
        if (state.activeChat && state.activeChat.id === chatId) {
          state.activeChat = null;
          // Remove from localStorage
          try {
            localStorage.removeItem("askAiActiveChat");
          } catch (error) {
            console.error("Error removing active chat from storage:", error);
          }
        }
      })
      .addCase(deleteChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        const chatId = action.payload;

        // Find and clear messages in chats list
        const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          state.chats[chatIndex].messages = [];
        }

        // Clear messages in activeChat if it's the current active chat
        if (state.activeChat && state.activeChat.id === chatId) {
          state.activeChat.messages = [];
          try {
            localStorage.setItem(
              "askAiActiveChat",
              JSON.stringify(state.activeChat),
            );
          } catch (error) {
            console.error("Error saving active chat to storage:", error);
          }
        }
      })
      .addCase(clearChatMessages.rejected, (state, action) => {
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
            state.activeChat.messages.splice(index);
            state.activeChat.messages.push(message);
          } else {
            const messageExists = state.activeChat.messages.some(
              (msg) => msg.id === message.id,
            );
            if (!messageExists) {
              state.activeChat.messages.push(message);
            }
          }

          try {
            localStorage.setItem(
              "askAiActiveChat",
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

        // Update the specific chat in the chats array
        const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
        if (chatIndex !== -1) {
          state.chats[chatIndex].messages = messages;
        }

        // Update activeChat if it's the same chat
        if (state.activeChat && state.activeChat.id === chatId) {
          state.activeChat.messages = messages;
          // Update localStorage with the refreshed messages
          try {
            localStorage.setItem(
              "askAiActiveChat",
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
} = askAiSlice.actions;
export default askAiSlice.reducer;
