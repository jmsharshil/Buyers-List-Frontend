import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SidebarFooter = ({ isExpanded }) => {
  const navigate = useNavigate();

  const { first_name, last_name, email } = useSelector(
    (state) => state.userProfile
  );

  const getInitials = () => {
    if (first_name && last_name) {
      return `${first_name[0]}${last_name[0]}`.toUpperCase();
    }
    return "U";
  };

  return (
    <div
      className={`p-2.5 border-t border-gray-200 bg-[#f8f7f5] ${!isExpanded ? "flex justify-center" : ""}`}
    >
      <button
        onClick={() => navigate("/services")}
        title={!isExpanded ? "Back to Services" : ""}
        className={`flex items-center justify-center gap-2 mb-3 bg-transparent border border-gray-200 rounded-md
          text-[12.5px] text-gray-500 hover:bg-[#eeece8] hover:border-gray-300 hover:text-gray-800
          transition-colors duration-150 font-[inherit] cursor-pointer
          ${isExpanded ? "w-full px-2.5 py-1.5" : "p-2"}`}
      >
        <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
        {isExpanded && <span>Back to services</span>}
      </button>

      <div
        className={`flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#e9e9e3] transition-colors cursor-pointer border border-transparent hover:border-[#e2e2d9] ${!isExpanded ? "justify-center w-full" : "w-full"}`}
      >
        <div className="w-7 h-7 rounded-md bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0">
          <span className="text-[11.5px] font-bold text-indigo-700">
            {getInitials()}
          </span>
        </div>
        
        {isExpanded && (
          <div className="flex flex-col overflow-hidden text-left flex-1">
            <span className="text-[12.5px] font-medium text-[#191919] truncate leading-tight">
              {first_name || "User"} {last_name || ""}
            </span>
            <span className="text-[10px] text-[#808075] truncate leading-tight mt-0.5">
              {email || "User Profile"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarFooter;
