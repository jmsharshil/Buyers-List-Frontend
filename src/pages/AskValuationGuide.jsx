import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getValuationChats,
  getValuationGuides,
  fetchChatMessages,
  deleteChat,
  updateChatGuides,
  editValuationMessage,
  createNewChat,
  clearChat,
} from "../store/slice/askValuationGuideSlice";
import DeleteChatModal from "../components/AskValuationGuideComponents/DeleteChatModal";
import ClearChatModal from "../components/AskValuationGuideComponents/ClearChatModal";
import ChatHistorySidebar from "../components/AskValuationGuideComponents/ChatHistorySidebar";
import GuideSelectionSidebar from "../components/AskValuationGuideComponents/GuideSelectionSidebar";
import ChatArea from "../components/AskValuationGuideComponents/ChatArea";
import { getAuthHeaders } from "../utils/helper";

const GUIDE_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];
const getGuideColor = (id) => GUIDE_COLORS[(id - 1) % GUIDE_COLORS.length];

const AskValuationGuide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGuides, setSelectedGuides] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const dispatch = useDispatch();

  const {
    chats,
    guides: availableGuides,
    chatsLoading,
    guidesLoading,
    createLoading,
    messagesLoading,
    deleteLoading,
    updateGuidesLoading,
    editLoading,
  } = useSelector((state) => state.askValuation);

  useEffect(() => {
    document.title = "Ask Valuation Guide";
    dispatch(getValuationGuides());
  }, [dispatch]);

  // Handle activeChatId passed via routing state
  useEffect(() => {
    if (location.state?.activeChatId) {
      setActiveConversation(location.state.activeChatId);
      if (location.state.selectedGuide) {
        setSelectedGuides([location.state.selectedGuide]);
      }
      // Clean up location state so refreshing doesn't force re-selecting
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch chat messages when the active conversation changes
  useEffect(() => {
    if (activeConversation) {
      dispatch(fetchChatMessages(activeConversation));
    }
  }, [activeConversation, dispatch]);

  // Sync selectedGuides from loaded messages if currently empty and availableGuides is loaded
  useEffect(() => {
    if (activeConversation && selectedGuides.length === 0 && messages.length > 0 && availableGuides.length > 0) {
      const msgWithGuide = messages.find((m) => m.guideId || m.metadata?.guide_id);
      if (msgWithGuide) {
        const gId = msgWithGuide.guideId || msgWithGuide.metadata?.guide_id;
        const matchedGuide = availableGuides.find((g) => String(g.id) === String(gId));
        if (matchedGuide) {
          setSelectedGuides([matchedGuide]);
        }
      }
    }
  }, [activeConversation, messages, availableGuides, selectedGuides.length]);

  const activeChat = chats.find((c) => String(c.id) === String(activeConversation));

  // Sync messages from Redux store to local state for display
  useEffect(() => {
    if (Array.isArray(activeChat?.messages)) {
      const formatted = activeChat.messages.map((msg) => ({
        id: msg.id,
        text: (msg.content || msg.text || "").replace(/\\n/g, "\n"),
        sender: msg.role === "user" ? "user" : "ai",
        time: msg.created_at
          ? new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
        guideId: msg.metadata?.guide_id || msg.guideId,
        guideName: msg.metadata?.guide_name || msg.guideName,
        metadata: msg.metadata ? {
          guideName: msg.metadata.guide_name,
          pageNumber: msg.metadata.page_number,
          source: msg.metadata.source || `Page ${msg.metadata.page_number}`,
        } : undefined,
      }));
      setMessages(formatted);
    } else {
      setMessages([]);
    }
  }, [activeChat?.messages]);

  // Auto-scroll logic moved to ChatArea component

  const toggleGuide = async (guide) => {
    const payload = {
      guide_ids: [guide.id],
    };

    const response = await dispatch(createNewChat(payload));
    if (createNewChat.fulfilled.match(response)) {
      const sessionId = response.payload.session_id;
      setSelectedGuides([guide]);
      setActiveConversation(sessionId);
    }
  };

  const handleSend = async () => {
    // if (!inputValue.trim() || selectedGuides.length === 0) return;

    const content = inputValue.trim();
    const userMsg = {
      id: Date.now(),
      text: content,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/ask-valuation/chats/${activeConversation}/ask/stream/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let sseBuffer = "";
      let isFirstChunk = true;
      const currentStreamingId = "streaming-ai-" + Date.now();

      let streamBuffer = "";
      let flushTimer = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6); // strip "data: "

          if (payload === "[DONE]") break;
          if (payload.startsWith("[ERROR]")) {
            console.error("Server streaming error:", payload);
            break;
          }

          let text = payload;
          try {
            const parsed = JSON.parse(payload);
            text = parsed.text || parsed.content || parsed.chunk || payload;
          } catch (e) {
            // Keep payload as text
          }
          text = text.replace(/\\n/g, "\n");
          streamBuffer += text;
        }

        if (isFirstChunk && streamBuffer) {
          isFirstChunk = false;
          setIsTyping(false);
          const aiMsg = {
            id: currentStreamingId,
            text: streamBuffer,
            sender: "ai",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, aiMsg]);
          streamBuffer = "";
          
          flushTimer = setInterval(() => {
            if (streamBuffer) {
              const textToFlush = streamBuffer;
              streamBuffer = "";
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === currentStreamingId
                    ? { ...msg, text: msg.text + textToFlush }
                    : msg
                )
              );
            }
          }, 60);
        }
      }

      if (flushTimer) clearInterval(flushTimer);
      if (streamBuffer) {
        const textToFlush = streamBuffer;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === currentStreamingId
              ? { ...msg, text: msg.text + textToFlush }
              : msg
          )
        );
      }

      // Fetch official history to synchronize with database
      // dispatch(fetchChatMessages(activeConversation));

    } catch (error) {
      console.error("Failed to stream response:", error);
      setIsTyping(false);
      // Remove temporary streaming message if it was created
      setMessages((prev) => prev.filter((msg) => msg.id !== currentStreamingId));
      // Add a system / failure error message
      const errorMsg = {
        id: Date.now() + 999,
        text: "Sorry, I encountered an error while retrieving the response. Please try again.",
        sender: "ai",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleEditMessage = async (chatId, messageId, content) => {
    try {
      const result = await dispatch(editValuationMessage({ chatId, messageId, content }));
      if (editValuationMessage.fulfilled.match(result)) {
        dispatch(fetchChatMessages(chatId));
        return true;
      }
    } catch (error) {
      console.error("Failed to edit valuation message:", error);
    }
    return false;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversationClick = () => {
    navigate("/ask-valuation-guide");
  };
 
  const confirmDeleteConversation = (e, convId) => {
    e.stopPropagation();
    setChatToDelete(convId);
    setSelectedGuides([]);
    setIsDeleteModalOpen(true);
  };
 
  const executeDelete = async () => {
    if (!chatToDelete) return;
    const result = await dispatch(deleteChat(chatToDelete));
    if (deleteChat.fulfilled.match(result)) {
      if (String(activeConversation) === String(chatToDelete)) {
        setActiveConversation(null);
        setMessages([]);
      }
      setIsDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };
 
  const handleClearChat = () => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }
    setIsClearModalOpen(true);
  };

  const executeClear = async () => {
    if (!activeConversation) return;
    const result = await dispatch(clearChat(activeConversation));
    if (clearChat.fulfilled.match(result)) {
      setMessages([]);
      setIsClearModalOpen(false);
    }
  };

  const selectConversation = (convId) => {
    setActiveConversation(convId);
    const chat = chats.find((c) => String(c.id) === String(convId));
    if (chat) {
      const ids = chat.selected_guides?.map((s) => s?.id) || chat.guide_ids || chat.selected_guide_ids || [];
      const guidesForChat = availableGuides.filter((g) =>
        ids.map(String).includes(String(g.id))
      );
      setSelectedGuides(guidesForChat);
    } else {
      setSelectedGuides([]);
    }
    setHistoryOpen(false);
  };

  const formatDateTime = (isoStr) => {
    const d = new Date(isoStr);
    return (
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " · " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const activeChatForTitle = chats.find((c) => String(c.id) === String(activeConversation));
  const chatTitle = activeConversation
    ? activeChatForTitle?.title && activeChatForTitle.title !== "Conversation"
      ? activeChatForTitle.title
      : selectedGuides.length > 0
        ? selectedGuides[0].name
        : "Conversation"
    : selectedGuides.length > 0
      ? "New Conversation"
      : "Ask Valuation Guide";

  return (
    <>
      <style>{`
        @keyframes avgFadeIn {
          from { opacity: 0; transform:   translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: avgFadeIn 0.3s ease-out forwards;
        }
      `}</style>
      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50 relative">
        <DeleteChatModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirmDelete={executeDelete}
          loading={deleteLoading}
        />
        <ClearChatModal
          isOpen={isClearModalOpen}
          onClose={() => setIsClearModalOpen(false)}
          onConfirmClear={executeClear}
          loading={chatsLoading}
        />

        {/* Mobile overlays */}
        {historyOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45 lg:hidden"
            onClick={() => setHistoryOpen(false)}
          />
        )}
        {guidesOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-35 md:hidden"
            onClick={() => setGuidesOpen(false)}
          />
        )}

        {/* <ChatHistorySidebar
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          conversations={chats}
          activeConversation={activeConversation}
          handleNewConversationClick={handleNewConversationClick}
          selectConversation={selectConversation}
          confirmDeleteConversation={confirmDeleteConversation}
          formatDateTime={formatDateTime}
          loading={chatsLoading}
        /> */}

        <GuideSelectionSidebar
          guidesOpen={guidesOpen}
          selectedGuides={selectedGuides}
          availableGuides={availableGuides}
          toggleGuide={toggleGuide}
          activeConversation={activeConversation}
          loading={guidesLoading}
          updateGuidesLoading={updateGuidesLoading}
        />

        <ChatArea
          chatTitle={chatTitle}
          selectedGuides={selectedGuides}
          getGuideColor={getGuideColor}
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          setGuidesOpen={setGuidesOpen}
          activeConversation={activeConversation}
          confirmDeleteConversation={confirmDeleteConversation}
          messages={messages}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleKeyDown={handleKeyDown}
          handleSend={handleSend}
          onEditMessage={handleEditMessage}
          loading={messagesLoading}
          editLoading={editLoading}
          handleClearChat={handleClearChat}
        />
      </div>
    </>
  );
};

export default AskValuationGuide;
