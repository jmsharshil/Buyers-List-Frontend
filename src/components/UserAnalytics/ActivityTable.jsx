import React from "react";
import { motion } from "framer-motion";
import { Search, Building, Briefcase, MessageSquare } from "lucide-react";
import Dropdown from "../ScreeningForm/Dropdown";
import Stars from "./Stars";
import { formatWorkflowName } from "./utils";

export const ActivityTable = ({
  flattenedAnalyticsList,
  loading,
  searchQuery,
  setSearchQuery,
  selectedWorkflowLabel,
  setSelectedWorkflowLabel,
  workflowLabels,
  currentPage,
  setCurrentPage,
  pageSize,
  listTotalCount,
  selectedPeriod,
  handleRowClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
    >
      <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            User Activity & Feedback Details
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Detailed view of recent workflow sessions and user feedback
          </p>
        </div>
      </div>

      <div className="px-6 py-2 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-96 my-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-shadow"
            placeholder="Search activity, users..."
          />
        </div>
        <div className="w-full sm:w-96">
          <Dropdown
            options={workflowLabels}
            value={selectedWorkflowLabel}
            onChange={(val) => setSelectedWorkflowLabel(val || "All Workflows")}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 whitespace-nowrap">User Details</th>
              <th className="px-6 py-4 whitespace-nowrap">Workflow Activity</th>
              <th className="px-6 py-4 whitespace-nowrap">Clients</th>
              {/* <th className="px-6 py-4 whitespace-nowrap">Rating</th>
              <th className="px-6 py-4">Feedback Note</th> */}
              <th className="px-6 py-4 whitespace-nowrap text-right">
                Date Recorded
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-medium">Fetching history...</span>
                  </div>
                </td>
              </tr>
            ) : flattenedAnalyticsList?.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                    <MessageSquare className="w-10 h-10 text-slate-300" />
                    <span className="text-base font-medium text-slate-600">
                      No activity records found
                    </span>
                    <p className="text-sm text-slate-400">
                      User workflows will appear here once initiated.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              flattenedAnalyticsList?.map((item) => (
                <tr
                  key={item.display_id}
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase shrink-0">
                        {item.first_name?.[0] || "U"}
                        {item.last_name?.[0] || ""}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          {item.first_name || "Unknown"}{" "}
                          {item.last_name || ""}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      {item.workflow ||
                        formatWorkflowName(item.workflow_key) ||
                        "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {item.client_name || "-"}
                      </div>
                      {/* <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {item.project_name || "-"}
                      </div> */}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <Stars rating={item.rating} />
                  </td>
                  <td className="px-6 py-4 min-w-[250px] max-w-[350px]">
                    {item.feedback ? (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 transition-colors">
                        <p className="text-slate-700 text-sm italic line-clamp-2">
                          "{item.feedback}"
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm flex items-center gap-1.5">
                        <div className="w-4 border-t border-slate-300"></div>
                        No feedback
                      </span>
                    )}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex flex-col items-end gap-1 text-sm text-slate-600">
                      <span className="font-medium">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {flattenedAnalyticsList?.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <span className="text-sm text-slate-500">
            Showing{" "}
            {selectedPeriod === "custom"
              ? 1
              : (currentPage - 1) * pageSize + 1}{" "}
            to{" "}
            {selectedPeriod === "custom"
              ? flattenedAnalyticsList.length
              : (currentPage - 1) * pageSize + flattenedAnalyticsList.length}{" "}
            of{" "}
            {selectedPeriod === "custom"
              ? flattenedAnalyticsList.length
              : listTotalCount}{" "}
            entries
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={selectedPeriod === "custom" ? true : currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>

            <button
              disabled={
                selectedPeriod === "custom"
                  ? true
                  : currentPage * pageSize >= listTotalCount
              }
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityTable;
