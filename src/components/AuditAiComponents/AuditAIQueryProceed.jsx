import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Sparkles, XCircle } from "lucide-react";
import { setSelectedRows } from "../../store/slice/auditScreeningSlice";

const AuditAIQuery = ({ onCancel, isDownloadDisabled, selectedData }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleStartAnalysis = () => {
    dispatch(setSelectedRows(selectedData));
    navigate("/auditai-analysis");
    window.scrollTo(0, 0);
  };
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-10 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          AI Deep Dive Analysis
        </h2>
        <p className="text-gray-500 mb-8 text-base">
          Do you want to proceed for AI Deep Dive Analysis on the selected
          entities?
        </p>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartAnalysis}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg font-semibold text-base hover:bg-indigo-700 transition-colors cursor-pointer hover:bg-indigo-700 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Yes, Proceed
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            disabled={isDownloadDisabled}
            className={`flex items-center gap-2 px-8 py-3 bg-gray-300 text-gray-600 rounded-xl shadow-lg font-semibold text-base transition-colors cursor-pointer disabled:cursor-not-allowed ${isDownloadDisabled ? "opacity-50" : "hover:bg-gray-400"}`}
          >
            <XCircle className="w-4 h-4 text-gray-400" />
            Cancel
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AuditAIQuery;
