import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessageToChat,
  fetchChatMessages,
  editAndResendMessage,
} from "../../store/slice/askAiSlice";
import ChatArea from "./ChatArea";
import { getAuthHeaders } from "../../utils/helper";

// Batch interval in ms — controls how often we flush buffered chunks to state
// Lower = smoother but more re-renders, Higher = less smooth but fewer re-renders
const STREAM_FLUSH_INTERVAL = 60;

const ChatContainer = () => {
  const dispatch = useDispatch();
  const { activeChat, loading } = useSelector((state) => state.askAi);

  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Streaming — all managed locally to avoid Redux re-render overhead
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamBufferRef = useRef(""); // Buffer for incoming chunks
  const flushTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isSendingRef = useRef(false); // Track if we are actively sending/streaming
  const activeChatIdRef = useRef(null); // Track the current active chat ID
  const sendingChatIdRef = useRef(null); // Track which chat the current send belongs to

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      // Only reset messages when switching to a different chat, not during send/stream
      const chatChanged = activeChatIdRef.current !== activeChat.id;
      activeChatIdRef.current = activeChat.id;

      // Skip overwriting localMessages if we are in the middle of sending/streaming
      if (isSendingRef.current && !chatChanged) return;

      if (activeChat.messages) {
        const formattedMessages = activeChat.messages.map((msg) => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.role === "user",
          timestamp: msg.created_at,
          attachment_name: msg.attachment_name,
          attachment_url: msg.attachment_url,
          attachment_content_type: msg.attachment_content_type,
          attachment_size: msg.attachment_size,
          attachments: msg.attachments || (msg.attachment_name ? [{
            name: msg.attachment_name,
            url: msg.attachment_url,
            content_type: msg.attachment_content_type,
            size: msg.attachment_size
          }] : [])
        }));
        setLocalMessages(formattedMessages);
      } else {
        setLocalMessages([]);
      }
    }
  }, [activeChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, []);

  // Start the flush timer — batches buffered chunks into state at a fixed interval
  const startFlushTimer = useCallback(() => {
    if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    flushTimerRef.current = setInterval(() => {
      if (streamBufferRef.current) {
        const buffered = streamBufferRef.current;
        streamBufferRef.current = ""; // Clear buffer
        setStreamingText((prev) => prev + buffered);
      }
    }, STREAM_FLUSH_INTERVAL);
  }, []);

  // Stop the flush timer and do one final flush
  const stopFlushTimer = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    // Final flush of any remaining buffer
    if (streamBufferRef.current) {
      const remaining = streamBufferRef.current;
      streamBufferRef.current = "";
      setStreamingText((prev) => prev + remaining);
    }
  }, []);

  const handleSendMessage = async (message, selectedFiles = []) => {
    const newMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
      timestamp: new Date().toISOString(),
      ...(selectedFiles.length > 0 && {
        attachment_name: selectedFiles[0].name,
        attachment_content_type: selectedFiles[0].type || "Unknown file type",
        attachment_size: selectedFiles[0].size || null,
        attachments: selectedFiles.map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          content_type: file.type || "Unknown file type",
          size: file.size || null,
        })),
      }),
    };

    setLocalMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setSelectedFiles([]);

    if (activeChat) {
      dispatch(
        addMessageToChat({ chatId: activeChat.id, message: newMessage }),
      );

      setIsWaitingForResponse(true);
      isSendingRef.current = true;
      sendingChatIdRef.current = activeChat.id;

      try {
        const formData = new FormData();
        formData.append("content", message);
        if (selectedFiles.length > 0) {
          selectedFiles.forEach((file) => {
            formData.append("attachment", file);
          });
        }

        abortControllerRef.current = new AbortController();
        const headers = getAuthHeaders();

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/chats/${activeChat.id}/messages/stream/`,
          {
            method: "POST",
            headers: { ...headers },
            body: formData,
            signal: abortControllerRef.current.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Switch from "Thinking..." to streaming mode
        setIsWaitingForResponse(false);
        setIsStreaming(true);
        setStreamingText("");
        streamBufferRef.current = "";

        // Start the batched flush timer
        startFlushTimer();

        // Read the SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let sseBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = sseBuffer.split("\n");
          // Keep the last (possibly incomplete) line in buffer
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6); // strip "data: "

            if (payload === "[DONE]") break;
            if (payload.startsWith("[ERROR]")) {
              console.error("Server streaming error:", payload);
              break;
            }

            // Un-escape newlines that the backend escaped for SSE transport
            const text = payload.replace(/\\n/g, "\n");
            streamBufferRef.current += text;
          }
        }

        // Stream complete — stop timer and do final flush
        stopFlushTimer();

        // Keep the streaming message visible while we fetch canonical data.
        // Do NOT clear isStreaming yet — the synthetic streaming message stays
        // on screen so there is no flash/gap.

        // Fetch the canonical message history from the backend 
        const fetchResult = await dispatch(fetchChatMessages(activeChat.id));
        if (fetchChatMessages.fulfilled.match(fetchResult)) {
          const messages = fetchResult.payload.messages;
          const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            isUser: msg.role === "user",
            timestamp: msg.created_at,
            attachment_name: msg.attachment_name,
            attachment_url: msg.attachment_url,
            attachment_content_type: msg.attachment_content_type,
            attachment_size: msg.attachment_size,
            attachments: msg.attachments || (msg.attachment_name ? [{
              name: msg.attachment_name,
              url: msg.attachment_url,
              content_type: msg.attachment_content_type,
              size: msg.attachment_size
            }] : [])
          }));
          setLocalMessages(formattedMessages);
        }

        // NOW clear streaming state — React batches this with setLocalMessages,
        // so the streaming message is replaced by the server message in one frame.
        setIsStreaming(false);
        setStreamingText("");

        // Done sending — allow useEffect to sync again
        isSendingRef.current = false;
        sendingChatIdRef.current = null;
      } catch (error) {
        stopFlushTimer();
        if (error.name === "AbortError") {
          console.log("Stream was aborted");
        } else {
          console.error("Error streaming message:", error);
        }

        isSendingRef.current = false;
        sendingChatIdRef.current = null;
        setIsWaitingForResponse(false);
        setIsStreaming(false);
        setStreamingText("");
        setSelectedFiles([]);

        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I encountered an error processing your request. Please try again.",
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setLocalMessages((prev) => [...prev, errorMessage]);
      }
    }
  };

  const handleEditMessage = async (chatId, messageId, content) => {
    if (!chatId || !messageId || !content) return;

    setIsEditing(true);
    setIsWaitingForResponse(true);

    try {
      const resultAction = await dispatch(
        editAndResendMessage({ chatId, messageId, content }),
      );

      if (editAndResendMessage.fulfilled.match(resultAction)) {
        const fetchResult = await dispatch(fetchChatMessages(chatId));
        if (fetchChatMessages.fulfilled.match(fetchResult)) {
          const messages = fetchResult.payload.messages;
          const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            text: msg.content,
            isUser: msg.role === "user",
            timestamp: msg.created_at,
            attachment_name: msg.attachment_name,
            attachment_url: msg.attachment_url,
            attachment_content_type: msg.attachment_content_type,
            attachment_size: msg.attachment_size,
            attachments: msg.attachments || (msg.attachment_name ? [{
              name: msg.attachment_name,
              url: msg.attachment_url,
              content_type: msg.attachment_content_type,
              size: msg.attachment_size
            }] : [])
          }));
          setLocalMessages(formattedMessages);
        }
      } else {
        console.error("Failed to edit message:", resultAction.payload);
      }
    } catch (error) {
      console.error("Error editing message:", error);
    } finally {
      setIsEditing(false);
      setIsWaitingForResponse(false);
    }
  };

  // Build the messages list to display
  let messagesToShow = [...localMessages];

  // Only show Thinking/streaming in the chat that initiated the request
  const isCurrentChatSending = sendingChatIdRef.current === activeChat?.id;

  if (isWaitingForResponse && isCurrentChatSending) {
    messagesToShow.push({
      id: "loading",
      text: "Thinking...",
      isUser: false,
      typing: true,
    });
  }

  if (isStreaming && streamingText && isCurrentChatSending) {
    messagesToShow.push({
      id: "streaming",
      text: streamingText,
      isUser: false,
      isStreaming: true,
    });
  }

  const activeChatTitle = activeChat?.title || "AskAI Chat";

  return (
    <ChatArea
      messages={messagesToShow}
      onSendMessage={handleSendMessage}
      inputValue={inputValue}
      onInputChange={setInputValue}
      activeChatTitle={activeChatTitle}
      loading={loading || isWaitingForResponse || isStreaming}
      activeChat={activeChat}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
      onEditMessage={handleEditMessage}
      isEditingGlobal={isEditing}
    />
  );
};

export default ChatContainer;
