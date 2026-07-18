import { Home, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SidebarFooter = ({ isExpanded }) => {
  const navigate = useNavigate();
  const { first_name, last_name, email } = useSelector(
    (state) => state.userProfile,
  );

  const getInitials = () => {
    if (first_name && last_name) {
      return `${first_name[0]}${last_name[0]}`.toUpperCase();
    }
    return "U";
  };

  return (
    <div
      className={`p-2.5 border-t border-[#e2e2d9] bg-[#f4f4f0] ${!isExpanded ? "flex flex-col items-center gap-2" : "flex flex-col gap-2"}`}
    >
      <button
        onClick={() => navigate("/services")}
        title={!isExpanded ? "Go to Services" : ""}
        className={`flex items-center justify-center gap-2 bg-white border border-[#e2e2d9] rounded-lg
          text-[12.5px] text-[#191919] font-medium hover:bg-[#e9e9e3] hover:border-[#c9c9bd]
          transition-all duration-150 cursor-pointer
          ${isExpanded ? "w-full px-2.5 py-1.5" : "p-2 w-full"}`}
      >
        <Home className="w-3.5 h-3.5 flex-shrink-0 text-[#808075]" />
        {isExpanded && <span>Go to Services</span>}
      </button>

      <div
        className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#e9e9e3] transition-colors cursor-pointer border border-transparent hover:border-[#e2e2d9] ${!isExpanded ? "justify-center w-full" : "w-full"}`}
      >
        <div className="w-7 h-7 rounded-md bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
          <span className="text-[11.5px] font-bold text-indigo-700">
            {getInitials()}
          </span>
        </div>
        <div className="flex flex-col overflow-hidden text-left flex-1">
          <span className="text-[12.5px] font-medium text-[#191919] truncate leading-tight">
            {first_name || "User"} {last_name || ""}
          </span>
          <span className="text-[10px] text-[#808075] truncate leading-tight mt-0.5">
            {email || "User Profile"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarFooter;
