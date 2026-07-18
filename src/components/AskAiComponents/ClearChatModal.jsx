import { X, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearChatMessages } from "../../store/slice/askAiSlice";

const ClearChatModal = ({ isOpen, onClose, chatId, chatTitle }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.askAi);
  const modalRef = useRef(null);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleClear();
    if (e.key === "Escape") onClose();
  };

  const handleClear = async () => {
    if (loading || !chatId) return;
    try {
      const resultAction = await dispatch(clearChatMessages(chatId));
      if (clearChatMessages.fulfilled.match(resultAction)) {
        onClose();
      } else {
        console.error("Failed to clear chat:", resultAction.payload);
      }
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-sm mx-4 rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="text-[13.5px] font-medium text-gray-900">
              Clear chat messages
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
          <p className="text-[12.5px] text-gray-600 leading-relaxed mb-3">
            Are you sure you want to clear all messages in{" "}
            <span className="font-medium text-gray-900">"{chatTitle}"</span>?
            This action cannot be undone.
          </p>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
            <Trash2 className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-amber-700 leading-relaxed">
              All messages will be removed, but the chat session will remain.
            </p>
          </div>
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
            onClick={handleClear}
            disabled={loading}
            className="flex-1 py-2 text-[12.5px] font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Clearing…
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Clear chat
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearChatModal;
