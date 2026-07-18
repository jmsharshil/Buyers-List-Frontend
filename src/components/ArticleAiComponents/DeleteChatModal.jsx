import { X, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteChat } from "../../store/slice/articleAiSlice";
import { Delete } from "../../icons/AnimatedIcons";

const DeleteChatModal = ({ isOpen, onClose, chatId, chatTitle }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.articleAi);
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
    if (e.key === "Enter" && !loading) handleDelete();
    if (e.key === "Escape") onClose();
  };

  const handleDelete = async () => {
    if (loading || !chatId) return;
    try {
      const resultAction = await dispatch(deleteChat(chatId));
      if (deleteChat.fulfilled.match(resultAction)) {
        onClose();
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 transform transition-all duration-300 scale-100 animate-slideIn border border-slate-100"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-[14px] font-semibold text-slate-800">Delete Draft</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[13px] text-slate-600 mb-3 leading-relaxed">
            Are you sure you want to delete the draft{" "}
            <span className="font-semibold text-slate-900">"{chatTitle}"</span>?
            This action cannot be undone.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <p className="text-[11.5px] text-amber-700 leading-normal">
              <strong>Note:</strong> All progress and messages in this session will be
              permanently removed.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-[12.5px] font-medium active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:bg-slate-200 transition-colors text-[12.5px] font-medium active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
