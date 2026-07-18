import { FileText, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { SidebarSkeleton } from "./Skeletons";

const RecentChats = ({ chats, activeChat, onChatSelect, isExpanded, onDeleteChat }) => {
  const { loading } = useSelector((state) => state.articleAi);

  const handleDeleteChat = (e, chatId, chatTitle) => {
    e.stopPropagation();
    if (onDeleteChat) {
      onDeleteChat(chatId, chatTitle);
    }
  };

  return (
    <>

      {isExpanded && (
        <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-medium text-gray-400 uppercase tracking-widest">
          Recent
        </p>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hidden scrollbar-thin scrollbar-thumb-gray-300 px-1.5 pb-2">
        {loading && chats.length === 0 ? (
          <SidebarSkeleton />
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            {isExpanded && (
              <>
                <p className="text-[12.5px] font-medium text-gray-600">
                  No articles yet
                </p>
                <p className="text-[11.5px] text-gray-400 leading-snug">
                  Start writing your first piece
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
                  title={!isExpanded ? (chat.title ?? "Untitled Article") : ""}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors duration-150
                    ${isExpanded ? "" : "justify-center"}
                    ${isActive ? "bg-indigo-50" : "hover:bg-[#eeece8]"}
                  `}
                >
                  <div
                    className={`w-[22px] h-[22px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-colors
                      ${isActive ? "bg-indigo-600" : "bg-gray-100 group-hover:bg-gray-200"}`}
                  >
                    <FileText
                      className={`w-3 h-3 ${isActive ? "text-white" : "text-gray-500"}`}
                    />
                  </div>

                  {isExpanded && (
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[12.5px] truncate ${
                          isActive
                            ? "font-medium text-indigo-700"
                            : "text-gray-600 group-hover:text-gray-800"
                        }`}
                      >
                        {chat.title ?? "Untitled Article"}
                      </p>
                    </div>
                  )}

                  {isExpanded && (
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id, chat.title)}
                      disabled={loading}
                      aria-label="Delete article"
                      className="opacity-0 group-hover:opacity-100 w-[22px] h-[22px] flex items-center justify-center rounded bg-transparent hover:bg-gray-200 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-gray-700" />
                    </button>
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
