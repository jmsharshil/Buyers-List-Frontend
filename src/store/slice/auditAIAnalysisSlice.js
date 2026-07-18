import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAuthHeaders } from "../../utils/helper";

const RESULT_KEY = "auditAiAnalysisResult";
const FORM_KEY = "auditAiAnalysisForm";

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to storage:", error);
  }
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch (error) {
    console.error("Error loading from storage:", error);
    return defaultValue;
  }
};

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from storage:", error);
  }
};

const formatMatches = (matches) => {
  if (!matches || matches.length === 0) return "";

  // Sort by type
  const sorted = [...matches].sort((a, b) => {
    const typeA = String(a.type || "").toLowerCase();
    const typeB = String(b.type || "").toLowerCase();
    return typeA.localeCompare(typeB);
  });

  return sorted
    .map((match) => {
      const detailsLine = [
        match.s_no && `**Serial Number:** ${match.s_no}`,
        match.type && `**Type:** ${match.type}`,
        match.project && `**Project Name:** ${match.project}`,
        match.auditor && `**Assigned Auditor:** ${match.auditor}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const safeQuestion = String(match.question || "").replace(
        /\r?\n/g,
        "  \n> ",
      );
      const safeAnswer = String(match.answer || "").replace(
        /\r?\n/g,
        "  \n> ",
      );

      return `\n### Matched Database Context\nSOURCE: ${
        match.source || "Database"
      }\n\n${detailsLine}\n\n> **QUESTION:**\n> ${safeQuestion}\n> \n> **ANSWER:**\n> ${safeAnswer}\n\n`;
    })
    .join("");
};

export const generateAuditAiAnalysis = createAsyncThunk(
  "auditAiAnalysis/generate",
  async (payload, { rejectWithValue, dispatch }) => {
    let fullData = "";
    let dbMatches = [];

    try {
      const formData = new FormData();

      // Append each query as a separate 'queries' key in FormData
      const queries = Array.isArray(payload.queries)
        ? payload.queries
        : (payload.queries || "")
            .split(",")
            .map((q) => q.trim())
            .filter(Boolean);
      queries.forEach((query) => {
        formData.append("queries", query);
      });
      if (payload.notes) {
        formData.append("notes", payload.notes);
      }
      if (payload.type) {
        formData.append("type", payload.type);
      }
      if (payload.classification) {
        formData.append("classification", payload.classification);
      }
      if (payload.auditor) {
        formData.append("auditor", payload.auditor);
      }
      if (Array.isArray(payload.files) && payload.files.length > 0) {
        payload.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/audit/run-ai-stream/`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // SSE events are typically separated by double newlines (\n\n or \r\n\r\n)
            const events = buffer.split(/\r?\n\r?\n/);

            // The last part of the split might be an incomplete event,
            // so we keep it in the buffer for the next chunk.
            buffer = events.pop() || "";

            for (const event of events) {
              if (!event.trim()) continue;

              const lines = event.split(/\r?\n/);
              let eventType = "message";
              let dataString = "";

              for (const line of lines) {
                if (line.startsWith("event:")) {
                  eventType = line.replace("event:", "").trim();
                } else if (line.startsWith("data:")) {
                  dataString = line.replace("data:", "").trim();
                }
              }

              if (dataString) {
                try {
                  const parsedData = JSON.parse(dataString);
                  let textToAppend = "";

                  switch (eventType) {
                    case "query_start":
                      // eslint-disable-next-line no-case-declarations
                      const prevMatches = formatMatches(dbMatches);
                      dbMatches = [];
                      textToAppend =
                        (prevMatches ? prevMatches : "") +
                        `\n===== QUERY: ${parsedData.query} =====\n`;
                      break;
                    case "db_match":
                      if (parsedData.question && parsedData.answer) {
                        dbMatches.push(parsedData);
                      }
                      break;
                    case "ai_answer_start":
                      textToAppend = `\n\n[AI_ANSWER_START]\n`;
                      break;
                    case "ai_answer_chunk":
                      textToAppend = parsedData.text || "";
                      break;
                    case "ai_answer_end":
                      // eslint-disable-next-line no-case-declarations
                      let endText = "";
                      if (parsedData.source) {
                        endText += `\n\n[SOURCE_PLACEHOLDER]${parsedData.source}[/SOURCE_PLACEHOLDER]\n`;
                      }
                      // Flush db_matches AFTER the AI answer
                      endText += formatMatches(dbMatches);
                      dbMatches = [];
                      if (endText) textToAppend = endText;
                      break;
                    case "phase":
                      if (parsedData.message) {
                        dispatch(setStatusMessage(parsedData.message));
                      }
                      break;
                    default:
                      // Ignore other events like job_created, etc.
                      break;
                  }

                  if (textToAppend) {
                    fullData += textToAppend;
                    dispatch(streamChunkReceived(textToAppend));
                  }
                } catch (e) {
                  console.warn("Failed to parse SSE data string:", dataString);
                }
              }
            }
          }
          // Flush any remaining matches (if any query/answer didn't trigger it)
          const finalMatches = formatMatches(dbMatches);
          if (finalMatches) {
            fullData += finalMatches;
            dispatch(streamChunkReceived(finalMatches));
          }
        } catch (streamEndError) {
          console.warn(
            "Stream closed by server (expected):",
            streamEndError.message,
          );

          if (!fullData) {
            return rejectWithValue({
              message: "Stream ended with no data received.",
            });
          }
          return { text: fullData };
        }
      } else {
        // Fallback for environments without ReadableStream support
        fullData = await response.text();
        dispatch(streamChunkReceived(fullData));
      }
      saveToStorage(RESULT_KEY, fullData);

      // Clean stream end (done === true from reader)
      return { text: fullData };
    } catch (error) {
      console.error("Request error:", error);
      return rejectWithValue({
        message: error.message || "Failed to generate analysis",
        partialData: fullData,
      });
    }
  },
);

const initialState = {
  analysisResult: loadFromStorage(RESULT_KEY, null),
  streamingContent: "",
  loading: false,
  error: null,
  statusMessage: "",
};

const auditAiAnalysisSlice = createSlice({
  name: "auditAiAnalysis",
  initialState,
  reducers: {
    streamChunkReceived: (state, action) => {
      state.streamingContent += action.payload;
    },
    clearStreamingContent: (state) => {
      state.streamingContent = "";
    },
    setStatusMessage: (state, action) => {
      state.statusMessage = action.payload;
    },
    resetAuditAIAnalysis: (state) => {
      removeFromStorage(RESULT_KEY);
      removeFromStorage(FORM_KEY);
      state.analysisResult = null;
      state.streamingContent = "";
      state.loading = false;
      state.error = null;
      state.statusMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAuditAiAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.streamingContent = "";
        state.analysisResult = null;
        state.statusMessage = "Starting analysis...";
      })
      .addCase(generateAuditAiAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.analysisResult = action.payload?.text || state.streamingContent;
        state.streamingContent = "";
      })
      .addCase(generateAuditAiAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to generate analysis";
        state.statusMessage = "";
      });
  },
});

export const {
  streamChunkReceived,
  clearStreamingContent,
  setStatusMessage,
  resetAuditAIAnalysis,
} = auditAiAnalysisSlice.actions;

export default auditAiAnalysisSlice.reducer;
