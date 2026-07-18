import React, { useEffect } from "react";
import {
  X,
  Tag,
  FolderOpen,
  User,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const AuditAIPopOutCard = ({ data, onClose, searchTerm }) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 260, damping: 25 },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.97,
      transition: { duration: 0.25 },
    },
  };

  const highlightText = (text, query) => {
    if (!query || !text || typeof text !== "string") return text;

    const terms = query
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (terms.length === 0) return text;

    const escapedTerms = terms
      .sort((a, b) => b.length - a.length)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    const pattern = escapedTerms.map((t) => `\\b${t}\\b`).join("|");
    const regex = new RegExp(`(${pattern})`, "gi");

    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-yellow-200 text-orange-900 px-0.5 rounded-sm font-bold"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  useEffect(() => {
    if (!data) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (typeof onClose === "function") onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [data, onClose]);

  const InfoField = ({ label, value, icon: Icon, color = "slate" }) => {
    const colorClasses = {
      slate: "text-slate-600",
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
    };

    return (
      <div className="py-3 border-b border-slate-100 last:border-none">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon size={18} className={colorClasses[color]} />}
          <p className="text-md font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
        </div>
        <p className="text-md font-semibold text-slate-800 leading-relaxed">
          {value || "Not Available"}
        </p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {data && (
        <Motion.div
          className="fixed inset-0 z-50 flex items-center justify-center 
                     bg-black/40 backdrop-blur-md p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          onClick={onClose}
        >
          <Motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl 
                       max-h-[90vh] overflow-y-auto border border-slate-200"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 bg-gradient-to-r from-indigo-50 to-slate-100 backdrop-blur-md z-10 
                            px-6 py-4 border-b border-slate-200 
                            flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FolderOpen size={20} className="text-indigo-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 truncate max-w-lg">
                  {data.project || "Project Details"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 rounded-full hover:bg-slate-200 
                           hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="space-y-3">
                <InfoField
                  label="Type"
                  value={data.type}
                  icon={Tag}
                  color="blue"
                />
                <InfoField
                  label="Classification"
                  value={data.classification}
                  icon={FolderOpen}
                  color="green"
                />
                <InfoField
                  label="Auditor"
                  value={data.auditor}
                  icon={User}
                  color="purple"
                />
                <InfoField
                  label="Question"
                  value={highlightText(data.question, searchTerm)}
                  icon={HelpCircle}
                  color="orange"
                />
                <div className="py-3 border-b border-slate-100 last:border-none">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare size={18} className="text-orange-600" />
                    <p className="text-md font-medium uppercase tracking-wide text-slate-500">
                      Response
                    </p>
                  </div>
                  <div className="text-md font-semibold text-slate-800 leading-relaxed p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {data.response
                      ? highlightText(data.response, searchTerm)
                      : "Not Available"}
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuditAIPopOutCard;
