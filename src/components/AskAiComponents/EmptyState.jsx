import { useSelector } from "react-redux";
import { Sparkles } from "lucide-react";


const EmptyState = ({ onNewChat }) => {
  const { first_name, loading } = useSelector((state) => state.userProfile);

  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center px-4"
      role="img"
      aria-label="Welcome"
    >
      <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
        <Sparkles className="w-4.5 h-4.5 text-violet-500" />
      </div>

      <div className="flex items-center justify-center min-h-[50px] mb-1">
        {loading && !first_name ? (
          <div className="h-9 w-56 bg-slate-200/70 animate-pulse rounded-lg"></div>
        ) : (
          <p className="text-[34px] font-semibold text-[#191919] font-serif tracking-tight">
            Welcome{first_name ? `, ${first_name}` : ""}
          </p>
        )}
      </div>

      <p className="text-[20px] text-[#808075] mb-6 leading-snug">
        Select a chat or start a new conversation to begin
      </p>

      {onNewChat && (
        <button
          onClick={onNewChat}
          className="text-[11.5px] px-3.5 py-1.5 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          Start new chat
        </button>
      )}
    </div>
  );
};

export default EmptyState;
