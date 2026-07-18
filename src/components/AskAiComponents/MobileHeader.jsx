import { useSelector } from "react-redux";
import { Menu, MessageSquare, Bot } from "lucide-react";

const MobileHeader = ({ isSidebarOpen, onMenuClick }) => {
  const { activeChat, chats } = useSelector((state) => state.askAi);

  return (
    <div className="lg:hidden flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm">
      <button 
        onClick={onMenuClick}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 active:scale-95"
      >
        <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
      </button>
      
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {activeChat ? (
          <>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {activeChat 
                  ? chats.find(chat => chat.id === activeChat.id)?.title || 'AskAI Chat'
                  : 'AskAI Chat'
                }
              </h1>
              <p className="text-xs text-gray-500 truncate hidden sm:block">AI Assistant</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900">AskAI</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Company Intelligence</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;