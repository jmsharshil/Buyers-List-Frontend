import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Sparkles, Building } from "lucide-react";
import {
  fetchAllChats,
  setActiveChat,
  fetchChatMessages,
} from "../../store/slice/askAiSlice";
import NewChatButton from "./NewChatButton";
import RecentChats from "./RecentChats";
import SidebarFooter from "./SidebarFooter";

const Sidebar = ({ isOpen, onClose, onNewChatClick, onDeleteChat }) => {
  const dispatch = useDispatch();
  const { chats, activeChat } = useSelector((state) => state.askAi);
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
          bg-slate-50 border-r border-slate-200
          transform transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col h-full overflow-x-hidden
        `}
      >
        {/* Header */}
        <div
          className={`${
            isExpanded ? "p-3.5" : "py-3.5 px-2 items-center"
          } border-b border-[#e2e2d9] flex flex-col gap-3.5`}
        >
          {/* Brand */}
          <div
            className={`flex items-center gap-2 ${
              !isExpanded ? "justify-center" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-[7px] bg-[#c6613f] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            {isExpanded && (
              <div>
                <p className="text-[17px] font-semibold text-[#191919] font-serif leading-tight">
                  Ask AI
                </p>
                <p className="text-[10px] text-[#808075] font-medium leading-tight mt-0.5">
                  Company Intelligence
                </p>
              </div>
            )}
          </div>

          <NewChatButton onClick={onNewChatClick} isExpanded={isExpanded} />
        </div>

        {/* Chat list */}
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
