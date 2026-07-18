import { Edit } from "lucide-react";

const NewChatButton = ({ onClick, isExpanded }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white border border-[#e2e2d9] rounded-lg
    text-[12.5px] font-medium hover:bg-[#e9e9e3] hover:border-[#c9c9bd]
    transition-all duration-150 cursor-pointer active:scale-98"
    >
      <Edit className="w-3.5 h-3.5 flex-shrink-0" />
      {isExpanded && <span>New chat</span>}
    </button>
  );
};

export default NewChatButton;
