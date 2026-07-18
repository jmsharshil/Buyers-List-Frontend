import {
  MessageSquare,
  MessageSquarePlus,
  Paperclip,
  Send,
  Sparkles,
  X,
  Edit3,
  User,
  Bot,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  File,
  BookOpen,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import { ChatAreaSkeleton } from "./Skeletons";
import { useEffect, useRef, useState } from "react";
import {
  downloadAsWordDocument,
  downloadAsExcel,
  downloadAsPDF,
  getLastAIResponse,
} from "./downloadUtils";
import FeedbackModal from "../ui/FeedbackModal";
import "./ArticleAiCommon.css";

const ChatArea = ({
  messages = [],
  onSendMessage,
  inputValue,
  onInputChange,
  activeChatTitle,
  loading,
  activeChat,
  selectedFiles,
  setSelectedFiles,
  onEditMessage,
  isEditingGlobal = false,
}) => {
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const isUserNearBottomRef = useRef(true);

  useEffect(() => {
    if (activeChatTitle && textareaRef.current) textareaRef.current.focus();
  }, [activeChatTitle]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      isUserNearBottomRef.current =
        scrollHeight - scrollTop - clientHeight < 150;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showDownloadDropdown && !e.target.closest(".download-dropdown"))
        setShowDownloadDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDownloadDropdown]);

  const scrollToBottom = () => {
    if (isUserNearBottomRef.current)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (editingMessage) {
      if (editingContent.trim()) handleEditSubmit(editingContent);
    } else {
      if (inputValue.trim() || selectedFiles.length > 0) {
        onSendMessage(inputValue, selectedFiles);
        setSelectedFiles([]);
        if (textareaRef.current) textareaRef.current.style.height = "36px";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) setSelectedFiles([files[0]]);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const pastedFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      setSelectedFiles([pastedFiles[0]]);
    }
  };

  const removeFile = (index) =>
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleTextareaChange = (e) => {
    onInputChange(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleEditMessage = (msgObject) => {
    setEditingMessage(msgObject);
    setEditingContent(msgObject.text || msgObject.content || "");
  };

  const handleEditCancel = () => {
    setEditingMessage(null);
    setEditingContent("");
  };

  const handleEditSubmit = async (editedContent) => {
    if (!editingMessage || !activeChat || !editedContent.trim()) return;
    await onEditMessage(activeChat.id, editingMessage.id, editedContent);
    setEditingMessage(null);
    setEditingContent("");
  };

  const getChatCreationDate = () => {
    if (activeChat?.created_at) {
      return new Date(activeChat.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return "New session";
  };

  const getConversationStats = () => {
    const userMessages = messages.filter(
      (msg) => msg.isUser || msg.role === "user",
    );
    const aiMessages = messages.filter(
      (msg) => !msg.isUser && msg.role !== "user",
    );
    const totalWords = messages.reduce((count, msg) => {
      const text = msg.text || msg.content || "";
      return count + (text.trim().split(/\s+/).filter(Boolean).length || 0);
    }, 0);
    const readingTime = Math.max(1, Math.round(totalWords / 200));
    return {
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      readingTime,
    };
  };

  const conversationStats = getConversationStats();

  const handleDownloadLastResponse = async (format) => {
    const lastResponse = getLastAIResponse(messages);
    if (!lastResponse) return;
    let success = false;
    switch (format) {
      case "excel":
        success = await downloadAsExcel(lastResponse);
        break;
      case "pdf":
        success = await downloadAsPDF(lastResponse);
        break;
      default:
        success = await downloadAsWordDocument(lastResponse);
        break;
    }
    setShowDownloadDropdown(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-2.5 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-[5px] bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900 truncate leading-tight">
              {activeChatTitle}
            </p>
            {activeChatTitle !== "Article Session" && (
              <p className="text-[11px] text-gray-400 leading-tight">
                {getChatCreationDate()} · {messages.length} messages
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {messages.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {conversationStats.userMessages}
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                {conversationStats.aiMessages}
              </span>
              <span className="text-gray-300">·</span>
              <span>~{conversationStats.readingTime}m read</span>
            </div>
          )}

          {conversationStats.userMessages > 0 && (
            <>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="hidden sm:flex items-center gap-1 text-[11.5px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Feedback
              </button>

              <div className="relative download-dropdown">
                <button
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  className="hidden sm:flex items-center gap-1 text-[11.5px] text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-2 py-1 rounded-md transition-colors border border-indigo-100 hover:border-indigo-600 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showDownloadDropdown && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                    <button
                      onClick={() => handleDownloadLastResponse("excel")}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                      Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => handleDownloadLastResponse("pdf")}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      PDF (.pdf)
                    </button>
                    <button
                      onClick={() => handleDownloadLastResponse("word")}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <File className="w-3.5 h-3.5 text-blue-500" />
                      Word (.doc)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 bg-[#f8f7f5]"
      >
        {loading && messages.length === 0 ? (
          <ChatAreaSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-4">
              <Edit3 className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-[14px] font-medium text-gray-700 mb-1">
              Create your next article
            </p>
            <p className="text-[12.5px] text-gray-400 max-w-xs leading-relaxed">
              Start with an outline, refine your tone, or get help with
              research.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((msg, index) => (
              <ChatMessage
                key={msg.id || index}
                message={msg.text || msg.content || ""}
                isUser={msg.isUser || msg.role === "user"}
                typing={msg.typing}
                showCopyButton={!msg.isUser && !msg.typing && !msg.isStreaming}
                isLatestMessage={index === messages.length - 1}
                isStreaming={msg.isStreaming || false}
                attachmentName={msg.attachment_name}
                attachmentUrl={msg.attachment_url}
                attachmentContentType={msg.attachment_content_type}
                attachmentSize={msg.attachment_size}
                onEditMessage={
                  msg.isUser || msg.role === "user" ? handleEditMessage : null
                }
                isEditing={editingMessage?.id === msg.id}
                onEditChange={(val) => setEditingContent(val)}
                onEditCancel={handleEditCancel}
                onEditSubmit={handleEditSubmit}
                messageObject={msg}
                loading={loading}
              />
            ))}
            <div
              ref={messagesEndRef}
              style={{ overflowAnchor: "auto", height: 1 }}
            />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-[11.5px]"
              >
                <Paperclip className="w-3 h-3 text-indigo-400" />
                <span className="text-indigo-700 truncate max-w-[140px]">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-indigo-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {editingMessage && (
          <div className="mb-2 flex items-center gap-2 text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-md">
            <Edit3 className="w-3 h-3" />
            <span className="font-medium">Editing message</span>
            <button
              onClick={handleEditCancel}
              className="ml-auto text-indigo-500 hover:text-indigo-700 font-medium"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-[#f8f7f5] border border-gray-200 rounded-lg px-2 py-1.5 focus-within:border-indigo-400 focus-within:bg-white transition-all">
          <label className="cursor-pointer flex-shrink-0 p-1.5 rounded-md hover:bg-gray-200 transition-colors self-end mb-0.5">
            <input type="file" onChange={handleFileSelect} className="hidden" />
            <Paperclip className="w-3.5 h-3.5 text-gray-500" />
          </label>

          <textarea
            ref={textareaRef}
            value={editingMessage ? editingContent : inputValue}
            onChange={(e) => {
              if (editingMessage) setEditingContent(e.target.value);
              else handleTextareaChange(e);
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              editingMessage
                ? "Refine your section…"
                : "What are we writing today?"
            }
            rows={1}
            disabled={loading || isEditingGlobal}
            className="flex-1 min-h-[32px] max-h-[180px] resize-none border-0 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 leading-relaxed focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 py-1.5 scrollbar-hide"
            style={{ height: "auto" }}
          />

          <button
            onClick={handleSubmit}
            disabled={
              (editingMessage
                ? !editingContent.trim()
                : !inputValue.trim() && selectedFiles.length === 0) ||
              loading ||
              isEditingGlobal
            }
            className="flex-shrink-0 w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors self-end mb-0.5 cursor-pointer"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <p className="text-[10.5px] text-gray-400 mt-1.5 text-center">
          Article AI · Always verify AI-generated content
        </p>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Article AI Feedback"
        workflow="article_interpretation_ai"
      />
    </div>
  );
};

export default ChatArea;
