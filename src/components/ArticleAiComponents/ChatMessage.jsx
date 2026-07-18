import {
  Bot,
  User,
  Sparkles,
  Copy,
  Download,
  FileText,
  Check,
  Edit3,
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

  // Thinking state
  if (typing && !isUser) {
    return (
      <div className="flex gap-3 justify-start px-4 md:px-6 py-1 mx-auto w-full">
        <div className="w-7 h-7 rounded-[5px] bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        </div>
        <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg rounded-tl-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 font-medium">
              Crafting response
            </span>
            <div className="flex gap-0.5 items-center">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
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

  if (!message && message !== 0 && !attachmentName) return null;

  return (
    <div
      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} px-4 md:px-6 py-1 mx-auto w-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-[5px] bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 self-start mt-0.5">
          <Bot className="w-3.5 h-3.5 text-indigo-500" />
        </div>
      )}

      {/* Edit button */}
      {isUser && onEditMessage && messageObject && !isEditing && (
        <button
          onClick={() => onEditMessage(messageObject)}
          className={`p-1 rounded-md hover:bg-gray-100 border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all cursor-pointer flex-shrink-0 self-start mt-1 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Edit message"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? "bg-gray-900 text-white rounded-tr-none"
            : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
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
                  className="w-full bg-white/10 text-white rounded-lg p-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-white/30 border border-white/20 resize-none min-h-[60px] max-h-[200px]"
                  placeholder="Refine your section…"
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
                  <span className="text-[10px] text-white/50">
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
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onEditSubmit && onEditSubmit(editValue)}
                      disabled={!editValue.trim() || loading}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-indigo-500 hover:bg-indigo-400 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
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
                {attachmentName && (
                  <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-white/10 rounded-lg border border-white/20 max-w-xs">
                    <FileText className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[11px] font-medium text-white truncate ${attachmentUrl ? "cursor-pointer hover:underline" : ""}`}
                        onClick={() => attachmentUrl && window.open(attachmentUrl, "_blank")}
                      >
                        {attachmentName}
                      </p>
                      {attachmentSize && (
                        <p className="text-[10px] text-white/50">
                          {formatFileSize(attachmentSize)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <MarkdownFormatter text={message} />
            <span
              className={`inline-block w-1 h-3.5 bg-indigo-400 ml-0.5 rounded-sm transition-opacity duration-300 ${isStreaming ? "opacity-100 animate-pulse" : "opacity-0"}`}
              style={{ verticalAlign: "text-bottom" }}
            />

            {attachmentName && (
              <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100 max-w-xs">
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[11px] font-medium text-gray-700 truncate ${attachmentUrl ? "cursor-pointer hover:underline" : ""}`}
                    onClick={() => attachmentUrl && window.open(attachmentUrl, "_blank")}
                  >
                    {attachmentName}
                  </p>
                  {attachmentSize && (
                    <p className="text-[10px] text-gray-400">
                      {formatFileSize(attachmentSize)}
                    </p>
                  )}
                </div>
                {attachmentUrl && (
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = attachmentUrl;
                      link.download = attachmentName;
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex-shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <div className={`mt-2 flex justify-end transition-opacity duration-300 ${showCopyButton ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[10.5px] px-2 py-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
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
        <div className="w-7 h-7 rounded-[5px] bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0 self-start mt-0.5">
          <User className="w-3.5 h-3.5 text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
