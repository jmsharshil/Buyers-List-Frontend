import React from "react";
import { motion } from "framer-motion";
import { Activity, Users, Building, Layers } from "lucide-react";

export const MetricCardsGrid = ({ summary, statsLoading }) => {
  const metricCards = [
    {
      label: "Total Workflow Runs",
      value: summary?.total_runs || 0,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Users",
      value: summary?.total_users || 0,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Clients",
      value: summary?.total_clients || 0,
      icon: Building,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    // {
    //   label: "Active Projects",
    //   value: summary?.total_projects || 0,
    //   icon: Layers,
    //   color: "text-amber-600",
    //   bg: "bg-amber-50",
    // },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {metricCards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className={`p-4 rounded-xl ${card.bg}`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              {card.label}
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {statsLoading ? (
                <span className="inline-block w-12 h-6 bg-slate-200 animate-pulse rounded"></span>
              ) : (
                card.value
              )}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MetricCardsGrid;
