import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LabelList,
} from "recharts";
import { Calendar, Activity, Building, Briefcase } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg">
        <p className="text-sm font-medium text-slate-800">
          {payload[0].name}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Runs:{" "}
          <span className="font-semibold text-slate-700">
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomAxisTick = ({ x, y, payload }) => {
  const value = payload.value || "";
  let line1 = value;
  let line2 = "";

  if (value.length > 10) {
    const mid = Math.floor(value.length / 2);
    let spaceIdx = -1;
    let minDiff = Infinity;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === " ") {
        const diff = Math.abs(i - mid);
        if (diff < minDiff) {
          minDiff = diff;
          spaceIdx = i;
        }
      }
    }

    if (spaceIdx !== -1) {
      line1 = value.slice(0, spaceIdx);
      line2 = value.slice(spaceIdx + 1);
    } else {
      line1 = value.slice(0, mid);
      line2 = value.slice(mid);
    }
  }

  // Truncate if still excessively long
  if (line1.length > 12) line1 = line1.slice(0, 10) + "...";
  if (line2.length > 12) line2 = line2.slice(0, 10) + "...";

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={4}
        textAnchor="middle"
        fill="#64748b"
        fontSize={9}
        fontWeight={500}
      >
        <tspan x={0} dy="6">{line1}</tspan>
        {line2 && <tspan x={0} dy="12">{line2}</tspan>}
      </text>
    </g>
  );
};

export const AnalyticsCharts = ({
  timelineData,
  workflowData,
  clientData,
  projectData,
  statsLoading,
}) => {
  return (
    <div className="space-y-6">
      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
        >
          <h2 className="text-xs font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Activity Timeline
          </h2>
          <div className="h-72 w-full">
            {statsLoading ? (
              <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse"></div>
            ) : timelineData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No timeline data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ color: "#6366f1", fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="runs"
                    name="Total Runs"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Workflow Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
        >
          <h2 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-emerald-500" />
            Workflow Distribution
          </h2>
          <div className="h-72 w-full">
            {statsLoading ? (
              <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse"></div>
            ) : workflowData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No workflow data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workflowData}
                  margin={{ top: 20, right: 10, left: -25, bottom: 15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={renderCustomAxisTick}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    barSize={18}
                  >
                    {workflowData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      fill="#475569"
                      fontSize={10}
                      fontWeight={600}
                      offset={6}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Top Clients Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
        >
          <h2 className="text-xs font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Building className="w-4 h-4 text-amber-500" />
            Clients
          </h2>
          <div className="h-64 w-full">
            {statsLoading ? (
              <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse"></div>
            ) : clientData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No client data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clientData}
                  margin={{ top: 20, right: 10, left: -25, bottom: 15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={renderCustomAxisTick}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar
                    dataKey="Runs"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  >
                    <LabelList
                      dataKey="Runs"
                      position="top"
                      fill="#475569"
                      fontSize={10}
                      fontWeight={600}
                      offset={6}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            </div>
        </motion.div>

        {/* Top Projects Bar Chart */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
        >
          <h2 className="text-xs font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-pink-500" />
            Projects
          </h2>
          <div className="h-64 w-full">
            {statsLoading ? (
              <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse"></div>
            ) : projectData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No project data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectData}
                  margin={{ top: 20, right: 10, left: -25, bottom: 15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={renderCustomAxisTick}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar
                    dataKey="Runs"
                    fill="#ec4899"
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                  >
                    <LabelList
                      dataKey="Runs"
                      position="top"
                      fill="#475569"
                      fontSize={10}
                      fontWeight={600}
                      offset={6}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div> */}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
