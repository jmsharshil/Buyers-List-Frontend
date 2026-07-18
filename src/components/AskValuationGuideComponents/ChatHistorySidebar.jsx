import React from "react";
import { MessageSquare, Plus, Trash2, Settings, Sparkle, ChevronRight, ChevronLeft, Pin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarSkeleton } from "../ArticleAiComponents/Skeletons";

const ChatHistorySidebar = ({
  historyOpen,
  setHistoryOpen,
  conversations,
  activeConversation,
  handleNewConversationClick,
  selectConversation,
  confirmDeleteConversation,
  loading,
}) => {
  const sortedConversations = React.useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [conversations]);

  const navigate = useNavigate();

  const isHoverable = activeConversation !== null && !historyOpen;

  const wrapperClass = isHoverable
    ? "fixed lg:fixed inset-y-0 left-0 z-50 flex pointer-events-none w-auto lg:w-64 lg:transform lg:-translate-x-60 lg:hover:translate-x-0 lg:transition-all lg:duration-300 lg:ease-in-out group/sidebar-wrapper"
    : `fixed lg:static inset-y-0 left-0 z-50 flex lg:block pointer-events-none lg:pointer-events-auto lg:w-60 lg:h-full shrink-0`;

  const sidebarClass = `w-[85vw] sm:w-72 md:w-60 bg-white border-r border-gray-200 flex flex-col h-full pointer-events-auto transform transition-transform duration-300 shadow-xl ` +
    (isHoverable
      ? `lg:translate-x-0 lg:group-hover/sidebar-wrapper:shadow-2xl lg:w-60 ${historyOpen ? "translate-x-0" : "-translate-x-full"}`
      : `${historyOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:shadow-none lg:w-full`
    );

  return (
    <div className={wrapperClass}>
      <div className={sidebarClass}>
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Sparkle size={15} color="#fff" />
              </div>
              <h2 className="text-md font-bold text-gray-900">Ask Valuation</h2>
            </div>
            {isHoverable && (
              <button
                onClick={() => setHistoryOpen(true)}
                className="hidden lg:flex p-1.5 hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title="Pin sidebar"
              >
                <Pin size={13} className="rotate-45" />
              </button>
            )}
            {!isHoverable && activeConversation && (
              <button
                onClick={() => setHistoryOpen(false)}
                className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft size={15} />
              </button>
            )}
          </div>
          {/* <button
            onClick={handleNewConversationClick}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer shadow-md hover:shadow-lg"
          >
            <Plus size={16} /> New Conversation
          </button> */}
        </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-hidden">
        {loading ? (
          <SidebarSkeleton />
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <MessageSquare size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">
              No chats yet
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Start a new conversation to begin exploring valuation guides
            </p>
          </div>
        ) : (
          sortedConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer mb-0.5 group transition-all border ${activeConversation === conv.id ? "bg-indigo-50 border-indigo-200" : "border-transparent hover:bg-gray-50"}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-700 truncate">
                  {conv.title}
                </p>
              </div>
              <button
                onClick={(e) => confirmDeleteConversation(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => navigate("/services")}
          className="w-full py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-200 transition-all cursor-pointer"
        >
          <Settings size={15} /> Go to Services
        </button>
      </div>
    </div>
    {/* Hover handle element */}
    {isHoverable && (
      <div className="hidden lg:flex pointer-events-auto w-4 h-full items-center justify-center cursor-pointer bg-transparent group/handle transition-opacity duration-300">
        <div className="w-1.5 h-16 rounded-full bg-gray-300 group-hover/handle:bg-indigo-500 transition-all shadow-sm flex items-center justify-center">
          <ChevronRight size={10} className="text-gray-600 group-hover/handle:text-white" />
        </div>
      </div>
    )}
  </div>
  );
};

export default ChatHistorySidebar;
