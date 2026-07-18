import React, { useState, useEffect } from "react";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createNewChat, fetchChatMessages, getValuationGuides } from "../store/slice/askValuationGuideSlice";

const NewValuationChat = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { guides, createLoading, guidesLoading } = useSelector((state) => state.askValuation);

  useEffect(() => {
    document.title = "New Valuation Chat";
    dispatch(getValuationGuides());
  }, [dispatch]);

  const createNewConversation = async () => {
    if (!selectedGuide) return;

    const payload = {
      guide_ids: [selectedGuide.id],
    };

    const response = await dispatch(createNewChat(payload));
    if (createNewChat.fulfilled.match(response)) {
      setSelectedGuide(null);
      // Move to AskValuationGuide page and set activeConversation state
      navigate("/ask-valuation-chats", {
        state: { 
          activeChatId: response.payload.session_id,
          selectedGuide: selectedGuide 
        },
      });
      await dispatch(fetchChatMessages(response.payload.session_id));
    }
  };

  const handleSkip = () => {
    navigate("/ask-valuation-chats");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-2xl w-full shadow-xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-gray-100 bg-white gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Start a Valuation Conversation</h2>
            <p className="text-sm text-gray-500 mt-1">Select the valuation guides you want to query against.</p>
          </div>
          {/* <button
            onClick={handleSkip}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Go Directly to Chats <ArrowRight size={16} />
          </button> */}
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Valuation Guides
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-12 text-center">
                        {/* Selector Column */}
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500">
                        Guide Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-28 text-center">
                        Total Pages
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 w-24 text-center">
                        Year
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {guidesLoading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-12 text-center text-sm text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Loading guides...</span>
                          </div>
                        </td>
                      </tr>
                    ) : guides?.map((guide) => (
                      <tr
                        key={guide.id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedGuide?.id === guide.id ? "bg-indigo-50/50" : ""
                        }`}
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
                    {!guidesLoading && (!guides || guides.length === 0) && (
                      <tr>
                        <td colSpan="4" className="px-4 py-12 text-center text-sm text-gray-500">
                          No guides available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => navigate("/services")}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={16} /> Back to Services
          </button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* <button
              onClick={handleSkip}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 bg-transparent sm:bg-white border border-gray-200 rounded-xl transition-all cursor-pointer text-center"
            >
              Skip & Go to Chats
            </button> */}
            <button
              onClick={createNewConversation}
              disabled={createLoading || !selectedGuide}
              className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                createLoading || !selectedGuide
                  ? "cursor-not-allowed opacity-35"
                  : "cursor-pointer"
              }`}
            >
              {createLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Beginning...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Let's Begin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewValuationChat;
