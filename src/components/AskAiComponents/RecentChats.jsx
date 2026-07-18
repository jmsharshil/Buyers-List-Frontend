import { MessageSquare, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

const RecentChats = ({ chats, activeChat, onChatSelect, isExpanded, onDeleteChat }) => {
  const { loading } = useSelector((state) => state.askAi);

  const handleDeleteChat = (e, chatId, chatTitle) => {
    e.stopPropagation();
    if (onDeleteChat) {
      onDeleteChat(chatId, chatTitle);
    }
  };

  return (
    <>
      {isExpanded && (
        <p className="px-3.5 pt-4 pb-1.5 text-[10.5px] font-bold text-[#808075] uppercase tracking-widest">
          Recent
        </p>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hidden scrollbar-thin scrollbar-thumb-gray-200 px-2 pb-2">
        {loading && chats.length === 0 ? (
          <div className="space-y-1.5 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex items-center px-2.5 py-1.5 rounded-lg animate-pulse ${isExpanded ? "" : "justify-center"}`}>
                {isExpanded ? (
                  <div className="h-3.5 bg-slate-200/60 rounded w-full max-w-[130px]"></div>
                ) : (
                  <div className="w-6 h-6 bg-slate-200/60 rounded-md"></div>
                )}
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-3">
            <div className="w-8 h-8 rounded-lg bg-[#e9e9e3] flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#808075]" />
            </div>
            {isExpanded && (
              <>
                <p className="text-[13px] font-medium text-violet-600">
                  No chats yet
                </p>
                <p className="text-[12px] text-violet-400 leading-snug">
                  Start a new conversation
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {chats.map((chat) => {
              const isActive = activeChat === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  title={!isExpanded ? chat.title : ""}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150
                    ${isExpanded ? "" : "justify-center"}
                    ${isActive ? "bg-[#e9e9e3] text-[#191919] font-medium" : "text-[#505045] hover:bg-[#ecece7] hover:text-[#191919]"}
                  `}
                >
                  {isExpanded ? (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                      <p className="text-[13px] truncate flex-1">
                        {chat.title || "Untitled Chat"}
                      </p>
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id, chat.title)}
                        disabled={loading}
                        aria-label="Delete chat"
                        className="opacity-0 group-hover:opacity-100 cursor-pointer w-[22px] h-[22px] flex items-center justify-center rounded-md bg-transparent hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-[#e9e9e3] flex items-center justify-center text-[11px] font-bold text-[#808075]">
                      {chat.title ? chat.title.charAt(0).toUpperCase() : "C"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default RecentChats;
