import { X, Sparkles, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../../store/slice/askAiSlice";

const NewChatModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.askAi);
  const [chatTitle, setChatTitle] = useState("");
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!chatTitle.trim() || loading) return;
    try {
      const resultAction = await dispatch(
        createNewChat({ title: chatTitle.trim() }),
      );
      if (createNewChat.fulfilled.match(resultAction)) {
        setChatTitle("");
        onClose();
      } else {
        console.error("Failed to create chat:", resultAction.payload);
      }
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleSubmit();
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#c6613f] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-[13.5px] font-medium text-gray-900">
              New chat
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <label className="block text-[11.5px] font-medium text-gray-500 mb-1.5">
            Chat title
          </label>
          <input
            ref={inputRef}
            type="text"
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="e.g. Company Analysis, Investment Research…"
            className="w-full px-3 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/50 focus:bg-white placeholder:text-slate-400 text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
              Enter
            </kbd>{" "}
            to create
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 text-[12.5px] font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!chatTitle.trim() || loading}
            className="flex-1 py-2 text-[12.5px] font-medium rounded-lg bg-[#c6613f] hover:bg-[#c6613f] text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-3.5 h-3.5 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating…
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Create chat
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
