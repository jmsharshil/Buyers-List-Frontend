import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearActiveChat } from "../store/slice/askAiSlice";
import Sidebar from "../components/AskAiComponents/Sidebar";
import NewChatModal from "../components/AskAiComponents/NewChatModal";
import MobileHeader from "../components/AskAiComponents/MobileHeader";
import DeleteChatModal from "../components/AskAiComponents/DeleteChatModal";
import ChatContainer from "../components/AskAiComponents/ChatContainer";
import EmptyState from "../components/AskAiComponents/EmptyState";
import "../components/AskAiComponents/AskAiCommon.css";
import { fetchUserProfile } from "../store/slice/userProfileSlice";

// Main AskAI Component
const AskAIInterface = () => {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const { activeChat } = useSelector((state) => state.askAi);
  const { id } = useSelector((state) => state.userProfile);

  // Clear active chat when component mounts to show empty state by default
  useEffect(() => {
    dispatch(clearActiveChat());
    document.title = "Ask AI";
  }, [dispatch]);

  // Fetch user profile only once when component mounts and only if user profile is not already loaded
  useEffect(() => {
    // Only fetch if we don't already have user data (id is null or undefined)
    if (!id) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, id]);

  const handleNewChatClick = (suggestion = "") => {
    setInitialPrompt(suggestion);
    setIsModalOpen(true);
  };

  const handleDeleteChatClick = (chatId, chatTitle) => {
    setChatToDelete({ id: chatId, title: chatTitle });
    setDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6]">
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialPrompt("");
        }}
        initialPrompt={initialPrompt}
      />

      <DeleteChatModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        chatId={chatToDelete?.id}
        chatTitle={chatToDelete?.title}
      />

      <div className="h-screen w-full">
        <div className="flex h-full bg-[#f9f9f6] overflow-hidden rounded-xl shadow-sm border border-[#e2e2d9]">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewChatClick={handleNewChatClick}
            onDeleteChat={handleDeleteChatClick}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <MobileHeader
              isSidebarOpen={isSidebarOpen}
              onMenuClick={() => setIsSidebarOpen(true)}
            />

            <div className="flex-1 overflow-hidden">
              {activeChat ? (
                <div className="h-full animate-slideIn">
                  <ChatContainer />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-[#f9f9f6]">
                  <div className="animate-fadeIn w-full max-w-2xl">
                    <EmptyState onNewChatClick={handleNewChatClick} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAIInterface;
