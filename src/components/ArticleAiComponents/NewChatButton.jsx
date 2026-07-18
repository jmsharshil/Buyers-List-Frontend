import { Plus } from "lucide-react";

const NewChatButton = ({ onClick, isExpanded }) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 flex items-center justify-center gap-2"
      title={!isExpanded ? "New Article" : ""}
    >
      <Plus className="w-3.5 h-3.5 flex-shrink-0" />
      {isExpanded && <span>New article</span>}
    </button>
  );
};

export default NewChatButton;
