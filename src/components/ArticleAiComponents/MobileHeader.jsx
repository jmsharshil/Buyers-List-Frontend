import { useSelector } from "react-redux";
import { Menu, BookOpen, PenTool } from "lucide-react";

const MobileHeader = ({ isSidebarOpen, onMenuClick }) => {
  const { activeChat, chats } = useSelector((state) => state.articleAi);

  return (
    <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-slate-50 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          {activeChat ? (
            <BookOpen className="w-5 h-5 text-indigo-600" />
          ) : (
            <PenTool className="w-5 h-5 text-indigo-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-slate-900 truncate">
            {activeChat
              ? chats.find((chat) => chat.id === activeChat.id)?.title ||
                "Article Draft"
              : "Article AI"}
          </h1>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-none mt-0.5">
            Content Studio
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
