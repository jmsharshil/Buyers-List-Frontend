import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Plus } from "lucide-react";
import {
  fetchAllChats,
  setActiveChat,
  fetchChatMessages,
} from "../../store/slice/articleAiSlice";
import RecentChats from "./RecentChats";
import SidebarFooter from "./SidebarFooter";

const Sidebar = ({ isOpen, onClose, onNewChatClick, onDeleteChat }) => {
  const dispatch = useDispatch();
  const { chats, activeChat } = useSelector((state) => state.articleAi);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const isExpanded = true;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchAllChats());
  }, [dispatch]);

  const handleChatSelect = (chatId) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      dispatch(setActiveChat(chat));
      dispatch(fetchChatMessages(chatId));
    }
    if (isMobile) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          ${isExpanded ? "w-[236px]" : "w-14"}
          bg-[#f8f7f5] border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col h-full overflow-x-hidden
        `}
      >
        {/* Header */}
        <div
          className={`${
            isExpanded ? "p-3" : "py-3 px-2 items-center"
          } border-b border-gray-200 flex flex-col gap-2.5`}
        >
          {/* Brand */}
          <div
            className={`flex items-center gap-2.5 ${!isExpanded ? "justify-center" : ""}`}
          >
            <div className="w-7 h-7 rounded-[7px] bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            {isExpanded && (
              <div>
                <p className="text-[13px] font-medium text-gray-900 leading-tight">
                  Articles AI
                </p>
                <p className="text-[11px] text-indigo-500 flex items-center gap-1 leading-tight">
                  Content Studio
                  <Sparkles className="w-2.5 h-2.5" />
                </p>
              </div>
            )}
          </div>

          {/* New article button */}
          <button
            onClick={onNewChatClick}
            className="flex items-center justify-center gap-2 w-full px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700
        text-white text-[12.5px] font-medium rounded-md transition-colors duration-150
        cursor-pointer"
            title={!isExpanded ? "New Article" : ""}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            {isExpanded && <span>New article</span>}
          </button>
        </div>

        <RecentChats
          chats={chats}
          activeChat={activeChat ? activeChat.id : null}
          onChatSelect={handleChatSelect}
          isExpanded={isExpanded}
          onDeleteChat={onDeleteChat}
        />

        <SidebarFooter isExpanded={isExpanded} />
      </div>
    </>
  );
};

export default Sidebar;
