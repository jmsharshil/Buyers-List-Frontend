import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessageToChat,
  fetchChatMessages,
  editAndResendMessage,
} from "../../store/slice/articleAiSlice";
import ChatArea from "./ChatArea";
import { getAuthHeaders } from "../../utils/helper";

const STREAM_FLUSH_INTERVAL = 60;

const ChatContainer = () => {
  const dispatch = useDispatch();
  const { activeChat, loading } = useSelector((state) => state.articleAi);

  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamBufferRef = useRef("");
  const flushTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isSendingRef = useRef(false);
  const activeChatIdRef = useRef(null);
  const sendingChatIdRef = useRef(null);

  useEffect(() => {
    if (activeChat) {
      const chatChanged = activeChatIdRef.current !== activeChat.id;
      activeChatIdRef.current = activeChat.id;

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
        }));
        setLocalMessages(formattedMessages);
      } else {
        setLocalMessages([]);
      }
    }
  }, [activeChat]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, []);

  const startFlushTimer = useCallback(() => {
    if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    flushTimerRef.current = setInterval(() => {
      if (streamBufferRef.current) {
        const buffered = streamBufferRef.current;
        streamBufferRef.current = "";
        setStreamingText((prev) => prev + buffered);
      }
    }, STREAM_FLUSH_INTERVAL);
  }, []);

  const stopFlushTimer = useCallback(() => {
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
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
        attachment_url: URL.createObjectURL(selectedFiles[0]),
        attachment_content_type: selectedFiles[0].type || "Unknown file type",
        attachment_size: selectedFiles[0].size || null,
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
          formData.append("attachment", selectedFiles[0]);
        }

        abortControllerRef.current = new AbortController();
        const headers = getAuthHeaders();

        // Update API endpoint for Article AI
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/v1/article/chats/${activeChat.id}/messages/stream/`,
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

        setIsWaitingForResponse(false);
        setIsStreaming(true);
        setStreamingText("");
        streamBufferRef.current = "";

        startFlushTimer();

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let sseBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });

          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);

            if (payload === "[DONE]") break;
            if (payload.startsWith("[ERROR]")) {
              console.error("Server streaming error:", payload);
              break;
            }

            const text = payload.replace(/\\n/g, "\n");
            streamBufferRef.current += text;
          }
        }

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
          text: "Sorry, I encountered an error. Please try again.",
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
          }));
          setLocalMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error("Error editing message:", error);
    } finally {
      setIsEditing(false);
      setIsWaitingForResponse(false);
    }
  };

  let messagesToShow = [...localMessages];
  const isCurrentChatSending = sendingChatIdRef.current === activeChat?.id;

  if (isWaitingForResponse && isCurrentChatSending) {
    messagesToShow.push({
      id: "loading",
      text: "Crafting response...",
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

  const activeChatTitle = activeChat?.title || "Article Session";

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
