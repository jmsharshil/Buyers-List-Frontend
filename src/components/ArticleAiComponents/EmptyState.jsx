import { PenTool } from "lucide-react";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-4">
      <PenTool className="w-6 h-6 text-indigo-500" />
    </div>
    <p className="text-[14px] font-medium text-gray-700 mb-1">
      No article selected
    </p>
    <p className="text-[12.5px] text-gray-400 max-w-xs leading-relaxed">
      Create a new draft or select a recent session from the sidebar to
      continue.
    </p>
  </div>
);

export default EmptyState;
