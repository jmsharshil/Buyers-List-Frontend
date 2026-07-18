import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  Search,
  Filter,
  Inbox,
  Calendar,
} from "lucide-react";
import Stars from "./Stars";
import Dropdown from "../ScreeningForm/Dropdown";

export const FeedbackAnalytics = ({ feedbacksList = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState("all");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");

  const ratingMap = useMemo(
    () => ({
      "All Ratings": "all",
      "Positive (4-5 Stars)": "positive",
      "Critical (1-3 Stars)": "negative",
      "5 Stars": "5",
      "4 Stars": "4",
      "3 Stars": "3",
      "2 Stars": "2",
      "1 Star": "1",
    }),
    [],
  );

  const getRatingLabel = (val) => {
    const found = Object.entries(ratingMap).find(
      ([label, value]) => value === val,
    );
    return found ? found[0] : "All Ratings";
  };

  // Map of human-readable UI Service Names to backend keys
  const workflowMap = useMemo(() => ({
    "GPC Screening": "gpc_screening",
    "Ask AI": "ask_ai",
    "Transaction Screening": "transaction_screening",
    "Audit AI": "audit_ai",
    "Article Interpretation AI": "article_interpretation_ai",
    // "Ask Valuation Guide": "ask_valuation_guide",
  }), []);

  const getWorkflowLabel = useCallback((key) => {
    if (!key || key === "all") return "All Workflows";
    const found = Object.entries(workflowMap).find(([label, val]) => val === key);
    return found ? found[0] : key;
  }, [workflowMap]);

  const getWorkflowKey = useCallback((label) => {
    if (!label || label === "All Workflows") return "all";
    return workflowMap[label] || label;
  }, [workflowMap]);

  // Get unique list of workflows for filters (including all defined in Services.jsx)
  const workflows = useMemo(() => {
    const set = new Set(Object.keys(workflowMap));
    feedbacksList.forEach((fb) => {
      const wf = fb.workflow || fb.workflow_key;
      if (wf) {
        const isMapped = Object.values(workflowMap).includes(wf);
        if (!isMapped) {
          set.add(wf);
        }
      }
    });
    return Array.from(set);
  }, [feedbacksList, workflowMap]);

  // Compute KPI stats from the base list
  const stats = useMemo(() => {
    if (!feedbacksList.length) {
      return { avgRating: 0, total: 0, positivePercent: 0 };
    }
    const sum = feedbacksList.reduce(
      (acc, curr) => acc + (curr.rating || 0),
      0,
    );
    const avg = sum / feedbacksList.length;
    const positiveCount = feedbacksList.filter((fb) => fb.rating >= 4).length;
    const percent = Math.round((positiveCount / feedbacksList.length) * 100);

    return {
      avgRating: Number(avg.toFixed(1)),
      total: feedbacksList.length,
      positivePercent: percent,
    };
  }, [feedbacksList]);

  // Filter feedbacks according to search query, workflow, and rating filters
  const filteredFeedbacks = useMemo(() => {
    return feedbacksList.filter((fb) => {
      // 1. Search Query filter (matches name, email, workflow, or feedback text)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const name =
          `${fb.first_name || ""} ${fb.last_name || ""}`.toLowerCase();
        const username = (fb.username || "").toLowerCase();
        const email = (fb.email || "").toLowerCase();
        const wf = (fb.workflow || fb.workflow_key || "").toLowerCase();
        const text = (fb.feedback || "").toLowerCase();

        if (
          !name.includes(q) &&
          !username.includes(q) &&
          !email.includes(q) &&
          !wf.includes(q) &&
          !text.includes(q)
        ) {
          return false;
        }
      }

      // 2. Workflow filter
      if (selectedWorkflow !== "all") {
        const wfKey = (fb.workflow_key || getWorkflowKey(fb.workflow) || "").toLowerCase();
        if (wfKey !== selectedWorkflow.toLowerCase()) return false;
      }

      // 3. Rating filter
      if (selectedRatingFilter !== "all") {
        const r = fb.rating;
        if (selectedRatingFilter === "positive") {
          if (r < 4) return false;
        } else if (selectedRatingFilter === "negative") {
          if (r >= 4) return false;
        } else {
          if (r !== parseInt(selectedRatingFilter, 10)) return false;
        }
      }

      return true;
    });
  }, [feedbacksList, searchQuery, selectedWorkflow, selectedRatingFilter]);

  const getInitials = (firstName, lastName, email, username) => {
    if (firstName) {
      return (firstName[0] + (lastName ? lastName[0] : "")).toUpperCase();
    }
    if (username) return username.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  // Dynamic badge color mapping based on workflow type
  const getWorkflowBadgeClass = (wf) => {
    const lower = (wf || "").toLowerCase();
    if (lower.includes("screening")) {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    }
    if (lower.includes("audit")) {
      return "bg-violet-50 text-violet-700 border border-violet-200/60";
    }
    if (lower.includes("ask")) {
      return "bg-sky-50 text-sky-700 border border-sky-200/60";
    }
    if (lower.includes("article") || lower.includes("interpretation")) {
      return "bg-pink-50 text-pink-700 border border-pink-200/60";
    }
    return "bg-slate-50 text-slate-700 border border-slate-200/60";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col space-y-6"
    >
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500 fill-indigo-100 animate-pulse" />
          User Ratings & Feedbacks Registry
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Dedicated repository and satisfaction log of workflow feedbacks
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Average Rating</p>
            <p className="text-xl font-bold text-slate-900 flex items-baseline gap-1 mt-0.5">
              {stats.avgRating}
              <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">
              Total Feedbacks
            </p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {stats.total}
              <span className="text-xs font-normal text-slate-400 ml-1">
                submissions
              </span>
            </p>
          </div>
        </div>

        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">
              Positive Feedback
            </p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {stats.positivePercent}%
              <span className="text-xs font-normal text-slate-400 ml-1">
                (&ge; 4 stars)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedbacks by user, workflow, comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-700 placeholder-slate-400 bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Workflow Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Workflow:
            </span>
            <div className="w-48 relative [&>div]:my-0">
              <Dropdown
                searchable
                options={["All Workflows", ...workflows]}
                value={getWorkflowLabel(selectedWorkflow)}
                onChange={(val) => setSelectedWorkflow(getWorkflowKey(val))}
                compact={true}
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Rating:
            </span>
            <div className="w-56 relative [&>div]:my-0">
              <Dropdown
                searchable
                options={Object.keys(ratingMap)}
                value={getRatingLabel(selectedRatingFilter)}
                onChange={(val) =>
                  setSelectedRatingFilter(ratingMap[val] || "all")
                }
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabular Registry */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3.5">User details</th>
              <th className="px-6 py-3.5">Workflow</th>
              <th className="px-6 py-3.5">Rating Score</th>
              <th className="px-6 py-3.5 min-w-[250px] max-w-md">
                User Feedback Note
              </th>
              <th className="px-6 py-3.5 text-right">Submitted At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {!filteredFeedbacks.length ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Inbox className="w-8 h-8 text-slate-300" />
                    <span className="text-sm font-medium">
                      No feedbacks match the active search/filters
                    </span>
                    <span className="text-xs text-slate-400">
                      Try adjusting your filters or search terms
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredFeedbacks.map((fb) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={fb.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-600 flex items-center justify-center shrink-0">
                          {getInitials(
                            fb.first_name,
                            fb.last_name,
                            fb.email,
                            fb.username,
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {fb.first_name || fb.username
                              ? `${fb.first_name || ""} ${fb.last_name || ""}`
                              : "Anonymous"}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {fb.email || fb.username || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Workflow */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight shrink-0 uppercase ${getWorkflowBadgeClass(fb.workflow || fb.workflow_key)}`}
                      >
                        {getWorkflowLabel(fb.workflow || fb.workflow_key)}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <Stars rating={fb.rating} />
                        <span className="text-[10px] font-bold text-slate-500 pl-0.5">
                          {fb.rating}{" "}
                          <span className="text-slate-400 font-normal">
                            / 5
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Feedback Note */}
                    <td className="px-6 py-4">
                      {fb.feedback ? (
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 italic inline-block">
                          "{fb.feedback}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-xs italic">
                          No additional note provided
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end gap-0.5 text-slate-600">
                        <span className="font-semibold text-slate-700">
                          {fb.created_at
                            ? new Date(fb.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "-"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {fb.created_at
                            ? new Date(fb.created_at).toLocaleTimeString(
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
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default FeedbackAnalytics;
