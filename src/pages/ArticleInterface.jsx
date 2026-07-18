import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearActiveChat } from "../store/slice/articleAiSlice";
import { fetchUserProfile } from "../store/slice/userProfileSlice";
import Sidebar from "../components/ArticleAiComponents/Sidebar";
import NewChatModal from "../components/ArticleAiComponents/NewChatModal";
import DeleteChatModal from "../components/ArticleAiComponents/DeleteChatModal";
import MobileHeader from "../components/ArticleAiComponents/MobileHeader";
import ChatContainer from "../components/ArticleAiComponents/ChatContainer";
import EmptyState from "../components/ArticleAiComponents/EmptyState";
import "../components/ArticleAiComponents/ArticleAiCommon.css";

const ArticleInterface = () => {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const { activeChat } = useSelector((state) => state.articleAi);
  const { id } = useSelector((state) => state.userProfile);

  // Clear active chat on initial load to show "No Articles" state
  useEffect(() => {
    dispatch(clearActiveChat());
    document.title = "Article Interpretation";
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
    <div className="min-h-screen bg-slate-55 article-ai-container">
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
        <div className="flex h-full bg-white overflow-hidden lg:rounded-2xl shadow-xl border border-slate-100">
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

            <div className="flex-1 overflow-hidden bg-slate-50/50">
              {activeChat ? (
                <div className="h-full article-document-view animate-fadeIn">
                  <ChatContainer />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-fadeIn w-full max-w-2xl px-4">
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

export default ArticleInterface;
