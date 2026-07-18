import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";

import { useDispatch } from "react-redux";
import { createNewChat } from "../../store/slice/askValuationGuideSlice";

const NewChatModal = ({
  isOpen,
  onClose,
  onCreateChat,
  guides,
  loading,
}) => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]); // Omit onClose from deps since it's an inline function in parent

  const createNewConversation = async () => {
    if (!selectedGuide) return;

    const payload = {
      guide_ids: [selectedGuide.id],
    };

    const response = await dispatch(createNewChat(payload));
    if (createNewChat.fulfilled.match(response)) {
      const selectedGuidesList = [selectedGuide];

      setSelectedGuide(null);
      if (onCreateChat) {
        onCreateChat(response.payload, selectedGuidesList);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-900">New Conversation</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-12 text-center">
                      {/* Selector Column */}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                      Guide Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-24 text-center">
                      Total Pages
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-20 text-center">
                      Year
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {guides?.map((guide) => (
                    <tr
                      key={guide.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedGuide?.id === guide.id ? "bg-indigo-50/50" : ""}`}
                      onClick={() => setSelectedGuide(guide)}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="radio"
                          checked={selectedGuide?.id === guide.id}
                          readOnly
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                        {guide.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {guide.total_pages || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {guide.year || "-"}
                      </td>
                    </tr>
                  ))}
                  {(!guides || guides.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                        No guides available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={createNewConversation}
            disabled={
              loading || !selectedGuide
            }
            className={`px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${loading || !selectedGuide ? "cursor-not-allowed opacity-35" : "cursor-pointer"}`}
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Plus size={16} />
            )}
            {loading ? "Creating..." : "Create Chat"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
