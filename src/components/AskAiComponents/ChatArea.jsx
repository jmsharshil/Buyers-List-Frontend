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
  Trash2,
} from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  downloadAsWordDocument,
  downloadAsExcel,
  downloadAsPDF,
  getLastAIResponse,
} from "./downloadUtils";
import FeedbackModal from "../ui/FeedbackModal";
import ClearChatModal from "./ClearChatModal";
import "./ChatArea.css";
import { useSelector } from "react-redux";

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
  const [isClearChatOpen, setIsClearChatOpen] = useState(false);
  const isUserNearBottomRef = useRef(true);
  const { first_name } = useSelector((state) => state.userProfile);

  const hour = new Date().getHours();
  const greetingText = useMemo(() => {
    let timeGreetings = [];
    // Replace the static userName placeholder with a dynamic one
    const U = first_name || "there";

    if (hour >= 5 && hour < 12) {
      timeGreetings = [
        `Good morning, ${U}`,
        `Morning! Ready to analyze, ${U}?`,
        `Fresh morning, fresh valuations — let's go, ${U}`,
        `${U}, any appraisals due today?`,
        `Start the day with precision, ${U}`,
        `Good morning ${U}, briefing time`,
        `${U}, the valuation desk awaits`,
        `New day, new assessments — you've got this, ${U}`,
        `Morning ${U}! Let's crunch some numbers`,
        `Ready to assess and conquer, ${U}?`,
        `${U}, what's on the valuation desk today?`,
        `Sharp mind, sharper valuations — good morning, ${U}`,
        `Let's get the numbers right today, ${U}`,
        `Morning ${U}! Time to dig into the financials`,
        `EBITDA doesn't calculate itself, ${U}`,
        `${U}, what's today's enterprise value?`,
        `Fresh eyes on fresh financials, ${U}`,
        `Morning ${U}! Any DCF models to run?`,
        `Coffee in hand, models ready — let's go, ${U}`,
        `${U}, let's uncover today's true value`,
        `Good morning ${U}! M&A season never sleeps`,
        `Morning ${U}! Time to stress-test those assumptions`,
        `The market opened — let's analyze, ${U}`,
        `${U}, any new comps to pull this morning?`,
        `Morning ${U}! Let's benchmark some multiples`,
        `Time to validate those projections, ${U}`,
        `${U}, what's the cap rate looking like today?`,
        `Due diligence starts at dawn, ${U}`,
        `Good morning ${U}, let's find the fair value`,
        `${U}, the financials are waiting`,
      ];
    } else if (hour >= 12 && hour < 17) {
      timeGreetings = [
        `Good afternoon, ${U}`,
        `${U}, how are the reports coming along?`,
        `Afternoon ${U}! Stay sharp on those figures`,
        `Halfway through — any deals closing, ${U}?`,
        `Afternoon valuation check-in, ${U}`,
        `Keep the assessments rolling, ${U}`,
        `${U}, numbers don't lie — keep going`,
        `Let's push through the afternoon reports, ${U}`,
        `Good afternoon ${U}, any site visits today?`,
        `Midday momentum — keep it going, ${U}`,
        `${U}, what's on the desk this afternoon?`,
        `Let's close out these valuations strong, ${U}`,
        `Afternoon ${U}! How are those multiples looking?`,
        `${U}, time for a midday model review`,
        `Any acquisition targets on the radar, ${U}?`,
        `Afternoon ${U}! Running sensitivity analysis?`,
        `${U}, let's revisit those growth assumptions`,
        `Comparable transactions pulled yet, ${U}?`,
        `Time to pressure-test the model, ${U}`,
        `Afternoon ${U}! Discount rate holding up?`,
        `${U}, how's the WACC looking today?`,
        `Valuation gap narrowing this afternoon, ${U}?`,
        `${U}, any new comps in the market?`,
        `Afternoon ${U}! Checking those terminal values?`,
        `Let's align the financials before EOD, ${U}`,
        `${U}, equity value on track?`,
        `Afternoon ${U}! IRR looking favorable?`,
        `${U}, let's refine those revenue projections`,
        `Any precedent transactions to review, ${U}?`,
        `Afternoon deep dive into the balance sheet, ${U}?`,
      ];
    } else if (hour >= 17 && hour < 22) {
      timeGreetings = [
        `Good evening, ${U}`,
        `${U}, wrapping up the reports?`,
        `Evening ${U}! Final reviews time`,
        `End of day ${U} — any pending valuations?`,
        `${U}, let's close the files for today`,
        `Finishing the valuation queue, ${U}?`,
        `Good evening ${U}, one last look at the numbers`,
        `${U}, what's still outstanding?`,
        `Almost done for the day, ${U}?`,
        `Evening ${U}! Submitting those final figures?`,
        `Let's wrap today's assessments, ${U}`,
        `${U}, is the desk almost clear?`,
        `Tying up loose ends, ${U}?`,
        `Evening ${U}! Final model check before submission?`,
        `${U}, last look at those assumptions tonight?`,
        `Any valuation adjustments needed, ${U}?`,
        `${U}, closing the books on today's analysis`,
        `Evening ${U}! Any last-minute deal considerations?`,
        `Final sanity check on the numbers, ${U}?`,
        `Good evening ${U}! Locking in the fair value?`,
        `${U}, time for an evening peer review?`,
        `Wrapping up the financial model tonight, ${U}?`,
        `${U}, reconciling the valuation gaps?`,
        `One last look at the cap table, ${U}?`,
        `Good evening ${U} — audit trail complete?`,
        `${U}, any board presentation prep tonight?`,
        `Finalizing the investment thesis, ${U}?`,
        `${U}, stress test done?`,
        `Closing thoughts on today's deal pipeline, ${U}?`,
        `Good evening ${U}! Last check on enterprise value?`,
      ];
    } else {
      timeGreetings = [
        `Late night on the valuation desk, ${U}?`,
        `Deadlines keeping you up, ${U}?`,
        `Night owl valuer — respect, ${U}`,
        `${U}, burning the midnight oil on reports?`,
        `Late night, precise mind — that's you, ${U}`,
        `Still crunching numbers, ${U}?`,
        `${U}, deadlines wait for no one`,
        `Late night review session, ${U}?`,
        `${U}, the numbers need you tonight`,
        `Up late perfecting the report, ${U}?`,
        `Night shift on the valuation floor, ${U}`,
        `Late but never imprecise — good on you, ${U}`,
        `${U}, midnight DCF run?`,
        `Late night — model still open, ${U}?`,
        `${U}, the deal waits for no one`,
        `Finalizing the valuation at midnight, ${U}?`,
        `${U}, late night sensitivity analysis?`,
        `Still chasing the right discount rate, ${U}?`,
        `${U}, midnight adjustments to the model?`,
        `The financials don't sleep, and neither do you, ${U}`,
        `${U}, checking those terminal multiples?`,
        `One more iteration of the model, ${U}?`,
        `Midnight deal review — let's get it right, ${U}`,
        `Up late reconciling the numbers, ${U}?`,
        `${U}, late night fairness opinion draft?`,
        `The best valuations are built after midnight, ${U}`,
        `Still stress-testing at this hour, ${U}?`,
        `Late but locked in — that's you, ${U}`,
        `${U}, night mode — precision over speed`,
        `The market closes, the analysis doesn't — right, ${U}?`,
      ];
    }

    const randomIndex = Math.floor(Math.random() * timeGreetings.length);
    return timeGreetings[randomIndex];
  }, [activeChat, hour]);

  useEffect(() => {
    if (activeChatTitle && textareaRef.current) {
      textareaRef.current.focus();
    }
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
    const handleClickOutside = (event) => {
      if (showDownloadDropdown && !event.target.closest(".download-dropdown")) {
        setShowDownloadDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDownloadDropdown]);

  const scrollToBottom = () => {
    if (isUserNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
    if (files.length > 0) {
      setSelectedFiles((prev) => {
        const newFiles = files.filter(
          (file) => !prev.some((f) => f.name === file.name && f.size === file.size)
        );
        return [...prev, ...newFiles];
      });
    }
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
      setSelectedFiles((prev) => {
        const newFiles = pastedFiles.filter(
          (file) => !prev.some((f) => f.name === file.name && f.size === file.size)
        );
        return [...prev, ...newFiles];
      });
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
    return new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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
      return count + (text.trim().split(/\s+/).length || 0);
    }, 0);
    const readingTime = Math.max(1, Math.round(totalWords / 200));
    return {
      userMessages: userMessages.length,
      aiMessages: aiMessages.length,
      readingTime,
    };
  };

  const conversationStats = getConversationStats();

  const groupedMessages = useMemo(() => {
    const grouped = [];
    messages.forEach((msg) => {
      const isUser = msg.isUser || msg.role === "user";
      if (isUser && grouped.length > 0) {
        const lastMsg = grouped[grouped.length - 1];
        const isLastUser = lastMsg.isUser || lastMsg.role === "user";
        
        const msgTime = msg.timestamp ? new Date(msg.timestamp) : new Date();
        const lastMsgTime = lastMsg.timestamp ? new Date(lastMsg.timestamp) : new Date();
        const timeDiff = Math.abs(msgTime - lastMsgTime) / 1000; // in seconds
        
        const sameTextOrEmpty = !msg.text || msg.text.trim() === "" || msg.text === lastMsg.text || !msg.content || msg.content.trim() === "" || msg.content === lastMsg.content;
        
        if (isLastUser && (timeDiff < 10 || sameTextOrEmpty)) {
          const currentAtts = msg.attachments || (msg.attachment_name ? [{
            name: msg.attachment_name,
            url: msg.attachment_url,
            content_type: msg.attachment_content_type,
            size: msg.attachment_size
          }] : []);
          
          if (!lastMsg.attachments) {
            lastMsg.attachments = lastMsg.attachment_name ? [{
              name: lastMsg.attachment_name,
              url: lastMsg.attachment_url,
              content_type: lastMsg.attachment_content_type,
              size: lastMsg.attachment_size
            }] : [];
          }
          
          currentAtts.forEach((att) => {
            const isDup = lastMsg.attachments.some(
              (existing) => existing.name === att.name && existing.size === att.size
            );
            if (!isDup) {
              lastMsg.attachments.push(att);
            }
          });
          
          if ((!lastMsg.text || lastMsg.text.trim() === "") && msg.text) {
            lastMsg.text = msg.text;
          }
          if ((!lastMsg.content || lastMsg.content.trim() === "") && msg.content) {
            lastMsg.content = msg.content;
          }
          return;
        }
      }
      
      grouped.push({
        ...msg,
        attachments: msg.attachments ? [...msg.attachments] : (msg.attachment_name ? [{
          name: msg.attachment_name,
          url: msg.attachment_url,
          content_type: msg.attachment_content_type,
          size: msg.attachment_size
        }] : [])
      });
    });
    return grouped;
  }, [messages]);

  const handleDownloadLastResponse = async (format) => {
    const lastResponse = getLastAIResponse(messages);
    if (!lastResponse) {
      alert("No AI response found to download.");
      return;
    }
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
    if (!success) alert("Failed to download. Please try again.");
    setShowDownloadDropdown(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9f6]">
      {/* Header */}
      <div className="border-b border-[#e2e2d9] bg-[#f9f9f6] px-4 py-2.5 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-[5px] bg-[#c6613f] flex items-center justify-center flex-shrink-0 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-800 truncate leading-tight">
              {activeChatTitle}
            </p>
            {activeChatTitle !== "AskAI Chat" && (
              <p className="text-[11px] text-[#808075] leading-tight">
                {getChatCreationDate()} · {messages.length} messages
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* {messages.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {conversationStats.userMessages}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                {conversationStats.aiMessages}
              </span>
              <span className="text-slate-300">·</span>
              <span>~{conversationStats.readingTime}m read</span>
            </div>
          )} */}

          {conversationStats.aiMessages > 0 && (
            <>
              <button
                onClick={() => setIsClearChatOpen(true)}
                className="hidden sm:flex items-center gap-1 text-[11.5px] font-semibold text-white bg-[#c6613f] hover:bg-[#a84d2f] px-2.5 py-1.5 rounded-md transition-colors shadow-sm cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Chat
              </button>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="hidden sm:flex items-center gap-1 text-[11.5px] text-[#c6613f] hover:text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Feedback
              </button>

              <div className="relative download-dropdown">
                <button
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                  className="hidden sm:flex items-center gap-1 text-[11.5px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showDownloadDropdown && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                    <button
                      onClick={() => handleDownloadLastResponse("excel")}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                      Excel (.xlsx)
                    </button>
                    <button
                      onClick={() => handleDownloadLastResponse("pdf")}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      PDF (.pdf)
                    </button>
                    <button
                      onClick={() => handleDownloadLastResponse("word")}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
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
        className="flex-1 overflow-y-auto scrollbar-hidden scrollbar-thin scrollbar-thumb-slate-200 bg-[#f9f9f6]"
      >
        {loading && messages.length === 0 ? (
          <div className="flex flex-col gap-6 p-6 h-full max-w-4xl mx-auto w-full mt-4">
            {/* User message skeleton */}
            <div className="flex gap-2.5 justify-end w-full animate-pulse">
              <div className="max-w-[70%] bg-[#e9e9e3] rounded-[18px] rounded-tr-none h-[60px] w-[300px]"></div>
              <div className="w-7 h-7 rounded-[5px] bg-[#e9e9e3] border border-[#e2e2d9] flex-shrink-0 self-start mt-0.5"></div>
            </div>

            {/* Bot message skeleton */}
            <div className="flex gap-2.5 justify-start w-full animate-pulse">
              <div className="w-7 h-7 rounded-[5px] bg-[#e9e9e3] border border-[#e2e2d9] flex-shrink-0 self-start mt-0.5"></div>
              <div className="max-w-[70%] bg-white border border-[#e2e2d9] rounded-[18px] rounded-tl-none h-[120px] w-[500px]"></div>
            </div>

            {/* Another user message skeleton */}
            <div className="flex gap-2.5 justify-end w-full animate-pulse mt-4">
              <div className="max-w-[70%] bg-[#e9e9e3] rounded-[18px] rounded-tr-none h-[40px] w-[200px]"></div>
              <div className="w-7 h-7 rounded-[5px] bg-[#e9e9e3] border border-[#e2e2d9] flex-shrink-0 self-start mt-0.5"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center flex-col justify-center h-full text-center px-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#c6613f] border border-sky-200 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[38px] font-medium text-[#191919] font-serif tracking-tight">
                {greetingText}
              </h1>
            </div>
            <div className="flex flex-col">
              {selectedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-2 py-1 bg-cyan-50 border border-cyan-100 rounded-md text-[11.5px]"
                    >
                      <Paperclip className="w-3 h-3 text-cyan-600" />
                      <span className="text-cyan-700 truncate max-w-[140px]">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-cyan-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus-within:border-slate-400 focus-within:bg-white focus-within:shadow-sm transition-all">
                <label className="cursor-pointer flex-shrink-0 p-1.5 rounded-md hover:bg-slate-100 transition-colors self-end mb-0.5">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                </label>

                <textarea
                  ref={textareaRef}
                  value={editingMessage ? editingContent : inputValue}
                  onChange={(e) => {
                    if (editingMessage) {
                      setEditingContent(e.target.value);
                    } else {
                      handleTextareaChange(e);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder={
                    editingMessage
                      ? "Edit your message…"
                      : "Ask anything… (Shift+Enter for new line)"
                  }
                  rows={1}
                  disabled={loading || isEditingGlobal}
                  className="flex-1 w-[500px] min-h-[32px] max-h-[180px] resize-none border-0 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 leading-relaxed focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 py-1.5 scrollbar-hide"
                  style={{ height: "auto" }}
                  aria-label="Message input"
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
                  className="flex-shrink-0 w-7 h-7 rounded-md bg-[#c6613f] text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors self-end mb-0.5 cursor-pointer"
                >
                  {loading ? (
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
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
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                      />
                    </svg>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-1">
            {groupedMessages.map((msg, index) => (
              <div key={msg.id || index}>
                <ChatMessage
                  message={msg.text || msg.content || ""}
                  isUser={msg.isUser || msg.role === "user"}
                  typing={msg.typing}
                  showCopyButton={
                    !msg.isUser &&
                    !msg.typing &&
                    msg.role !== "user" &&
                    !msg.isStreaming
                  }
                  isLatestMessage={false}
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
              </div>
            ))}
            <div
              ref={messagesEndRef}
              style={{ overflowAnchor: "auto", height: 1 }}
            />
          </div>
        )}
      </div>

      {/* Input Area */}
      {messages?.length > 0 && (
        <div className="border-t border-[#e2e2d9] bg-[#f9f9f6] px-4 py-3 flex-shrink-0">
          {selectedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 px-2 py-1 bg-cyan-50 border border-cyan-100 rounded-md text-[11.5px]"
                >
                  <Paperclip className="w-3 h-3 text-cyan-600" />
                  <span className="text-cyan-700 truncate max-w-[140px]">
                    {file.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-cyan-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {editingMessage && (
            <div className="mb-2 flex items-center gap-2 text-[11px] text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1.5 rounded-md">
              <Edit3 className="w-3 h-3 text-sky-500" />
              <span className="font-medium">Editing message</span>
              <button
                onClick={handleEditCancel}
                className="ml-auto text-sky-500 hover:text-sky-700 font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus-within:border-slate-400 focus-within:bg-white focus-within:shadow-sm transition-all">
            <label className="cursor-pointer flex-shrink-0 p-1.5 rounded-md hover:bg-slate-100 transition-colors self-end mb-0.5">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Paperclip className="w-3.5 h-3.5 text-gray-500" />
            </label>

            <textarea
              ref={textareaRef}
              value={editingMessage ? editingContent : inputValue}
              onChange={(e) => {
                if (editingMessage) {
                  setEditingContent(e.target.value);
                } else {
                  handleTextareaChange(e);
                }
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                editingMessage
                  ? "Edit your message…"
                  : "Ask anything… (Shift+Enter for new line)"
              }
              rows={1}
              disabled={loading || isEditingGlobal}
              className="flex-1 min-h-[32px] max-h-[180px] resize-none border-0 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 leading-relaxed focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 py-1.5 scrollbar-hide"
              style={{ height: "auto" }}
              aria-label="Message input"
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
              className="flex-shrink-0 w-7 h-7 rounded-md bg-[#191919] text-white flex items-center justify-center disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors self-end mb-0.5 cursor-pointer"
            >
              {loading ? (
                <svg
                  className="w-3.5 h-3.5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
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
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                  />
                </svg>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* <p className="text-[10.5px] text-gray-400 mt-1.5 text-center">
          AskAI can make mistakes. Verify important information.
        </p> */}
        </div>
      )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Ask AI Feedback"
        workflow="ask_ai"
      />

      <ClearChatModal
        isOpen={isClearChatOpen}
        onClose={() => setIsClearChatOpen(false)}
        chatId={activeChat?.id}
        chatTitle={activeChatTitle}
      />
    </div>
  );
};

export default ChatArea;
