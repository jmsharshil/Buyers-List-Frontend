import {
  Bot,
  User,
  Sparkles,
  Download,
  Copy,
  Check,
  Edit3,
  FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import MarkdownFormatter from "./MarkdownFormatter";
const TypewriterMessage = ({ text, speed = 5 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  useEffect(() => {
    setWords(text.split(" "));
    setDisplayedText("");
    setCurrentWordIndex(0);
  }, [text]);
  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) =>
          prev ? prev + " " + words[currentWordIndex] : words[currentWordIndex],
        );
        setCurrentWordIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentWordIndex, words, speed]);
  return <MarkdownFormatter text={displayedText} />;
};
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
const ChatMessage = ({
  message,
  isUser,
  typing = false,
  showCopyButton = true,
  isLatestMessage = false,
  isStreaming = false,
  attachmentName = null,
  attachmentUrl = null,
  attachmentContentType = null,
  attachmentSize = null,
  onEditMessage,
  isEditing = false,
  onEditChange,
  onEditCancel,
  onEditSubmit,
  messageObject = null,
  loading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editValue, setEditValue] = useState(message || "");
  const textareaRef = useRef(null);
  const attachments = messageObject?.attachments || (attachmentName ? [{
    name: attachmentName,
    url: attachmentUrl,
    content_type: attachmentContentType,
    size: attachmentSize
  }] : []);
  const copyToClipboard = () => {
    if (message) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [isEditing]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onEditSubmit) onEditSubmit(editValue);
    }
    if (e.key === "Escape" && onEditCancel) onEditCancel();
  };
  // Thinking/typing state
  if (typing && !isUser) {
    return (
      <div className="flex gap-3 justify-start px-4 md:px-6 py-1 mx-auto w-full">
        <div className="w-7 h-7 rounded-[5px] bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
        </div>
        <div className="px-3.5 py-2.5 bg-white border border-[#e2e2d9] rounded-[18px] rounded-tl-none shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#da6347] font-semibold">
              Thinking
            </span>
            <div className="flex gap-0.5 items-center">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1.5 h-1.5 bg-[#da6347] rounded-full animate-bounce"
                  style={{
                    animationDelay: `${delay}ms`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!message && message !== 0 && (!attachments || attachments.length === 0)) return null;
  return (
    <div
      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} px-4 md:px-6 py-1 mx-auto w-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-[5px] bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0 self-start mt-0.5">
          <Bot className="w-3.5 h-3.5 text-violet-600" />
        </div>
      )}
      {/* Edit button for user messages */}
      {isUser && onEditMessage && messageObject && !isEditing && (
        <button
          onClick={() => onEditMessage(messageObject)}
          className={`p-1 rounded-md hover:bg-[#e9e9e3] border border-transparent hover:border-[#e2e2d9] text-gray-400 hover:text-gray-600 transition-all cursor-pointer flex-shrink-0 self-start mt-1 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Edit message"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
      {/* Message bubble */}
      <div
        className={`max-w-[80%] rounded-[18px] px-4 py-3 text-[14px] leading-relaxed ${
          isUser
            ? "bg-[#f0f0eb] text-[#191919] rounded-tr-none border border-[#e2e2d9]"
            : "bg-white border border-[#e2e2d9] text-[#191919] rounded-tl-none shadow-[0_2px_8px_rgb(0,0,0,0.01)]"
        }`}
      >
        {isUser ? (
          <div>
            {isEditing ? (
              <div>
                <textarea
                  ref={textareaRef}
                  value={editValue}
                  onChange={(e) => {
                    setEditValue(e.target.value);
                    if (onEditChange) onEditChange(e.target.value);
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "auto";
                      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white/10 text-gray-900 rounded-lg p-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-slate-200 border border-white/20 resize-none min-h-[60px] max-h-[200px]"
                  placeholder="Edit your message…"
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-400">
                  <span className="text-[10px] text-gray-900">
                    <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">
                      Enter
                    </kbd>{" "}
                    save ·{" "}
                    <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px]">
                      Esc
                    </kbd>{" "}
                    cancel
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={onEditCancel}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onEditSubmit && onEditSubmit(editValue)}
                      disabled={!editValue.trim() || loading}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-3 h-3 border border-gray-400 border-t-gray-800 rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{message}</p>
                {attachments && attachments.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-2 py-1.5 bg-slate-200 rounded-lg border border-slate-400/20 max-w-xs cursor-pointer hover:bg-slate-300/60 transition-colors"
                        onClick={() => att.url && window.open(att.url, "_blank")}
                      >
                        <FileText className="w-3.5 h-3.5 text-black/70 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-black truncate hover:underline">
                            {att.name}
                          </p>
                          {att.size && (
                            <p className="text-[10px] text-black/50">
                              {formatFileSize(att.size)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <MarkdownFormatter text={message} />
            <span
              className={`inline-block w-1 h-3.5 bg-blue-400 ml-0.5 rounded-sm transition-opacity duration-300 ${isStreaming ? "opacity-100 animate-pulse" : "opacity-0"}`}
              style={{ verticalAlign: "text-bottom" }}
            />
            {attachments && attachments.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100 max-w-xs cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => att.url && window.open(att.url, "_blank")}
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-700 truncate hover:underline">
                        {att.name}
                      </p>
                      {att.size && (
                        <p className="text-[10px] text-gray-400">
                          {formatFileSize(att.size)}
                        </p>
                      )}
                    </div>
                    {att.url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = att.url;
                          link.download = att.name;
                          link.target = "_blank";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="flex-shrink-0 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div
              className={`mt-2 flex justify-end transition-opacity duration-300 ${showCopyButton ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[10.5px] px-2 py-1 rounded-md bg-transparent hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-transparent hover:border-emerald-200 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* User avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-[5px] bg-[#e9e9e3] border border-[#e2e2d9] flex items-center justify-center flex-shrink-0 self-start mt-0.5 shadow-sm">
          <User className="w-3.5 h-3.5 text-[#808075]" />
        </div>
      )}
    </div>
  );
};
export default ChatMessage;
