import React, {useEffect} from "react";
import { motion } from "framer-motion";
import { X, Users, Activity, MessageSquare } from "lucide-react";
import Stars from "./Stars";
import { formatWorkflowName } from "./utils";

export const ActivityDetailModal = ({
  isModalOpen,
  selectedActivity,
  setIsModalOpen,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
  
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  if (!isModalOpen || !selectedActivity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">
            Activity Details
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> User Information
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.first_name || "Unknown"}{" "}
                    {selectedActivity.last_name || ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Username</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.username || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.role || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Session Details
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Workflow</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.workflow ||
                      formatWorkflowName(selectedActivity.workflow_key) ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.client_name || "N/A"}
                  </p>
                </div>
                {/* <div>
                  <p className="text-xs text-slate-500">Project</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.project_name || "N/A"}
                  </p>
                </div> */}
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium text-slate-900">
                    {selectedActivity.created_at
                      ? new Date(selectedActivity.created_at).toLocaleString(
                          "en-US",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Info
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Feedback & Rating
            </h4>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
              <div>
                <p className="text-xs text-amber-700/70 mb-1">Rating</p>
                <Stars rating={selectedActivity.rating} />
              </div>
              <div>
                <p className="text-xs text-amber-700/70 mb-1">
                  Feedback Note
                </p>
                {selectedActivity.feedback ? (
                  <p className="text-sm text-slate-700 italic bg-white p-3 rounded-lg border border-amber-100">
                    "{selectedActivity.feedback}"
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No detailed feedback provided.
                  </p>
                )}
              </div>
            </div>
          </div> */}
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityDetailModal;
