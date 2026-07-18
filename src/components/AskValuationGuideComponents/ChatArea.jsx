import React, { useEffect, useRef } from "react";
import {
  Menu,
  BookOpen,
  Sparkles,
  FileText,
  Paperclip,
  Send,
  Download,
  Edit3,
  User,
  Bot,
  ChevronDown,
  FileSpreadsheet,
  File,
  Trash2,
} from "lucide-react";
import MarkdownFormatter from "../AskAiComponents/MarkdownFormatter";
import { ChatAreaSkeleton } from "../ArticleAiComponents/Skeletons";
import {
  downloadAsWordDocument,
  downloadAsExcel,
  downloadAsPDF,
  getLastAIResponse,
} from "../AskAiComponents/downloadUtils";

const ChatArea = ({
  chatTitle,
  selectedGuides,
  getGuideColor,
  historyOpen,
  setHistoryOpen,
  setGuidesOpen,
  activeConversation,
  messages,
  isTyping,
  messagesEndRef,
  inputValue,
  setInputValue,
  handleKeyDown,
  handleSend,
  onEditMessage,
  loading,
  editLoading,
  handleClearChat,
}) => {
  const [editingId, setEditingId] = React.useState(null);
  const [editingValue, setEditingValue] = React.useState("");
  const [showDownloadDropdown, setShowDownloadDropdown] = React.useState(false);
  const [showDownloadDropdownMobile, setShowDownloadDropdownMobile] =
    React.useState(false);

  const messagesContainerRef = useRef(null);
  const isUserNearBottomRef = useRef(true);
  useEffect(() => {
    // Always force scroll when a new message is sent (isTyping is true),
    // otherwise only auto-scroll if the user is already near the bottom.
    if (isTyping || isUserNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Increased threshold to 500px so the smooth-scroll animation
      // lagging behind text rendering doesn't falsely disengage auto-scroll
      isUserNearBottomRef.current =
        scrollHeight - scrollTop - clientHeight < 500;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDownloadDropdown && !event.target.closest(".download-dropdown")) {
        setShowDownloadDropdown(false);
      }
      if (
        showDownloadDropdownMobile &&
        !event.target.closest(".download-dropdown-mobile")
      ) {
        setShowDownloadDropdownMobile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDownloadDropdown, showDownloadDropdownMobile]);

  const handleDownloadLastResponse = async (format, isMobile = false) => {
    const lastResponse = getLastAIResponse(messages);
    if (!lastResponse) {
      alert("No AI response found to download.");
      return;
    }

    let lastQuestion = "";
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        lastQuestion = messages[i].text || "";
        break;
      }
    }

    const contentToDownload = lastQuestion
      ? `### Question\n${lastQuestion}\n###\n${lastResponse}`
      : lastResponse;

    let success = false;
    const filenameBase = chatTitle
      ? chatTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      : "valuation_response";
    switch (format) {
      case "excel":
        success = await downloadAsExcel(contentToDownload, `${filenameBase}.xlsx`);
        break;
      case "pdf": {
        const filteredResponse = contentToDownload.replace(/📄\s?/g, "");
        success = await downloadAsPDF(filteredResponse, `${filenameBase}.pdf`);
        break;
      }
      default:
        success = await downloadAsWordDocument(
          contentToDownload,
          `${filenameBase}.doc`,
        );
        break;
    }
    if (!success) alert("Failed to download. Please try again.");
    if (isMobile) {
      setShowDownloadDropdownMobile(false);
    } else {
      setShowDownloadDropdown(false);
    }
  };

  const handleEditSubmit = async (messageId) => {
    if (!editingValue.trim() || !onEditMessage) return;
    const success = await onEditMessage(
      activeConversation,
      messageId,
      editingValue.trim(),
    );
    if (success) {
      setEditingId(null);
      setEditingValue("");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
      {/* Mobile header */}
      <div className="flex lg:hidden items-center justify-between gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => setHistoryOpen(true)}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          <Menu size={20} />
        </button>
        {activeConversation && (
          <div className="flex-1 min-w-0 text-center px-2">
            <h1 className="line-clamp-2 text-[15px] font-bold text-gray-900">
              {chatTitle}
            </h1>
          </div>
        )}
        <>
          {selectedGuides.length > 0 && (
            <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
              {selectedGuides[0].year || "N/A"} ·{" "}
              {selectedGuides[0].total_pages || "0"} pgs
            </p>
          )}
          {activeConversation && messages && messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 border border-red-200 bg-red-50/50 hover:bg-red-50 rounded-lg text-red-600 cursor-pointer"
              title="Clear Chat"
            >
              <Trash2 size={15} />
            </button>
          )}
          {activeConversation && (
            <div className="relative download-dropdown-mobile">
              <button
                onClick={() =>
                  setShowDownloadDropdownMobile(!showDownloadDropdownMobile)
                }
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
              >
                <Download size={13} /> Export
                <ChevronDown size={11} />
              </button>
              {showDownloadDropdownMobile && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                  <button
                    onClick={() => handleDownloadLastResponse("pdf", true)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    PDF (.pdf)
                  </button>
                  <button
                    onClick={() => handleDownloadLastResponse("word", true)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
                  >
                    <File className="w-3.5 h-3.5 text-blue-500" />
                    Word (.doc)
                  </button>
                  <button
                    onClick={() => handleDownloadLastResponse("excel", true)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                    Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setGuidesOpen(true)}
            className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer md:hidden"
          >
            <BookOpen size={20} />
          </button>
        </>
      </div>

      {/* Desktop header */}
      {activeConversation && (
        <div className="hidden lg:flex h-16 items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className={`p-2 border rounded-xl text-gray-600 hover:bg-slate-50 hover:text-gray-900 transition-all cursor-pointer flex items-center justify-center ${
                historyOpen
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-white border-gray-200"
              }`}
              title={historyOpen ? "Collapse Sidebar" : "Pin Sidebar"}
            >
              <Menu size={16} />
            </button>
            <span className="text-[17px] line-clamp-2 font-bold text-gray-900">
              {chatTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedGuides.length > 0 && (
              <span className="text-[12px] text-gray-500 font-semibold shrink-0 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-lg ml-2">
                {selectedGuides[0].year || "N/A"} ·{" "}
                {selectedGuides[0].total_pages || "0"} pgs
              </span>
            )}
            {selectedGuides.length > 0 && (
              <div className="flex items-center">
                {selectedGuides.slice(0, 3).map((g) => (
                  <div
                    key={g.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-white -ml-1.5 first:ml-0"
                    style={{ background: getGuideColor(g.id) }}
                    title={g.name}
                  >
                    {g.name.charAt(0)}
                  </div>
                ))}
                {selectedGuides.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border-2 border-white -ml-1.5">
                    +{selectedGuides.length - 3}
                  </div>
                )}
              </div>
            )}
            {activeConversation && messages && messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 text-[13px] font-semibold text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 size={13} /> Clear Chat
              </button>
            )}
            <div className="relative download-dropdown">
              <button
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-600 flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
              >
                <Download size={13} /> Export
                <ChevronDown size={11} />
              </button>
              {showDownloadDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                  <button
                    onClick={() => handleDownloadLastResponse("excel", false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleDownloadLastResponse("pdf", false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    PDF (.pdf)
                  </button>
                  <button
                    onClick={() => handleDownloadLastResponse("word", false)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left cursor-pointer"
                  >
                    <File className="w-3.5 h-3.5 text-blue-500" />
                    Word (.doc)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6"
        style={{ scrollbarWidth: "thin" }}
      >
        {loading ? (
          <ChatAreaSkeleton />
        ) : selectedGuides.length === 0 && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-[72px] h-[72px] rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-5">
              <BookOpen size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Select Valuation Guides
            </h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Choose one or more guides from the panel to start asking questions
              about valuation methodologies.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <div className="w-[72px] h-[72px] rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-5">
              <Sparkles size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Ask about the selected guides
            </h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Type your question below to get insights from the selected guides.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) =>
              msg.sender === "user" ? (
                editingId === msg.id ? (
                  <div
                    key={msg.id}
                    className="flex justify-end mb-6 animate-fade-in w-full"
                  >
                    <div className="w-full max-w-[85%] ml-auto">
                      <div className="bg-white border border-indigo-200 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
                        <textarea
                          value={editingValue}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEditSubmit(msg.id);
                            }
                          }}
                          onChange={(e) => setEditingValue(e.target.value)}
                          rows={2}
                          disabled={editLoading}
                          className="w-full text-sm border-0 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none disabled:opacity-50"
                        />
                        <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingValue("");
                            }}
                            disabled={editLoading}
                            className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSubmit(msg.id)}
                            disabled={editLoading || !editingValue.trim()}
                            className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            {editLoading ? (
                              <>
                                <svg
                                  className="animate-spin h-3 w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Saving...
                              </>
                            ) : (
                              "Save & Submit"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className="flex justify-end mb-6 animate-fade-in group relative gap-3"
                  >
                    <div className="flex items-start gap-2 justify-end max-w-[85%]">
                      <button
                        onClick={() => {
                          setEditingId(msg.id);
                          setEditingValue(msg.text);
                        }}
                        className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer self-center"
                        aria-label="Edit message"
                      >
                        <Edit3 size={14} />
                      </button>
                      <div className="bg-indigo-500 text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed break-words max-w-full">
                        {msg.text}
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                      <User size={16} className="text-white" />
                    </div>
                  </div>
                )
              ) : (
                <div key={msg.id} className="flex gap-3 mb-6 animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed text-gray-700">
                      <MarkdownFormatter text={msg.text} />
                    </div>
                  </div>
                </div>
              ),
            )}

            {isTyping && (
              <div className="flex gap-3 mb-6 animate-fade-in">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-400 avg-typing-dot" />
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 avg-typing-dot"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 avg-typing-dot"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            )}
            <div
              ref={messagesEndRef}
              style={{ overflowAnchor: "auto", height: 1 }}
            />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-2 md:px-6 py-2 bg-white border-t border-gray-200 shrink-0">
        <div
          className={`flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-1 transition-all focus-within:border-indigo-400 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] focus-within:bg-white ${!activeConversation ? "opacity-50 pointer-events-none" : ""}`}
        >
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeConversation || loading || isTyping}
            placeholder={"Type your message here..."}
            rows={1}
            style={{ height: "auto", scrollbarWidth: "none" }}
            className="flex-1 bg-transparent border-none resize-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none py-1.5 max-h-30 min-h-[36px]"
          />
          <button
            onClick={handleSend}
            disabled={
              !inputValue.trim() || !activeConversation || loading || isTyping
            }
            className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send size={17} />
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-2">
          Responses are generated by selected guides. Please verify important
          information.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
