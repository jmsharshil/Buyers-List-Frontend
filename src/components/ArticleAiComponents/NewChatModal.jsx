import { X, Sparkles, Plus, PenTool } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../../store/slice/articleAiSlice";

const NewChatModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.articleAi);
  
  const [chatTitle, setChatTitle] = useState('');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (chatTitle.trim() && !loading) {
      try {
        const resultAction = await dispatch(createNewChat({ title: chatTitle.trim() }));
        if (createNewChat.fulfilled.match(resultAction)) {
          setChatTitle('');
          onClose();
        }
      } catch (err) {
        console.error("Error creating article session:", err);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 transform transition-all duration-300 scale-100 animate-slideIn border border-slate-100"
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <PenTool className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-slate-800 leading-tight">New Article Draft</h3>
              <p className="text-[11px] text-slate-400 font-medium">Define your writing project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-5">
          <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 ml-0.5">
            Article Title
          </label>
          <input
            ref={inputRef}
            type="text"
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="e.g., The Future of Quantum Computing"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-[13px] transition-all placeholder:text-slate-300"
          />
          <p className="text-[10.5px] text-slate-400 mt-1.5 ml-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            AI will help you structure this article.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-[12.5px] font-medium active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!chatTitle.trim() || loading}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-200 transition-colors text-[12.5px] font-medium active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Start Writing</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
