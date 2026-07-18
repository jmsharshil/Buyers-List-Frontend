import { X, Sparkles } from "lucide-react";

const SidebarHeader = ({ onClose }) => {
  return (
    <div className=" border-b border-slate-200 bg-white/80 backdrop-blur-sm lg:rounded-tl-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-[7px] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-[14px] font-medium text-slate-800 tracking-tight">
            AskAI
          </h2>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-rose-50 rounded-lg transition active:scale-95"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;