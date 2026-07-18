import React from "react";
import {
  X,
  Building2,
  Globe,
  DollarSign,
  Calculator,
  Target,
  FileText,
  Lightbulb,
  Hash,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const PopOutCard = ({ company, onClose, keywords = [] }) => {
  // Fuzzy keyword highlighting with simple stemming/prefix matching
  const highlightKeywords = (text, keywords) => {
    if (!text || !keywords || keywords.length === 0) return <span>{text}</span>;

    try {
      // no-op: previous regex builder removed in word-based highlighting

      const toWords = (value) =>
        String(value)
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(Boolean);

      const stripCommonSuffix = (word) => {
        // Basic, heuristic suffix stripping to approximate stems
        const rules = [
          /ings?$/i, // running -> run, rings -> r
          /ed$/i, // hauled -> haul
          /ers?$/i, // manager/managers -> manag(e)r -> manag
          /ors?$/i,
          /ments?$/i,
          /tions?$/i,
          /ships?$/i,
          /ness$/i,
          /less$/i,
          /ful$/i,
          /ables?$/i,
          /ibles?$/i,
          /ies$/i, // policies -> polic
          /als?$/i,
          /ly$/i,
          /s$/i, // plurals
        ];
        let base = word;
        for (const rule of rules) {
          if (rule.test(base)) {
            base = base.replace(rule, "");
          }
        }
        // If ends with 'e' and long enough, also keep version without trailing 'e'
        if (base.length > 4 && base.endsWith("e")) {
          return [base, base.slice(0, -1)];
        }
        return [base];
      };

      // Expand user keywords into stems/prefixes
      const stems = new Set();
      for (const kw of keywords) {
        if (!kw || !String(kw).trim()) continue;
        const words = toWords(kw);
        for (const w of words) {
          // Original token
          stems.add(w);
          // Stripped variants
          for (const variant of stripCommonSuffix(w)) {
            if (variant) stems.add(variant);
          }
          // Heuristic short prefixes to catch more variants (e.g., manage -> manag)
          if (w.length >= 5) stems.add(w.slice(0, 5));
          if (w.length >= 4) stems.add(w.slice(0, 4));
        }
      }

      const stemList = Array.from(stems).filter(Boolean);
      if (stemList.length === 0) return <span>{text}</span>;

      // Sort by length to match longer stems first (used for includes checks)
      stemList.sort((a, b) => b.length - a.length);

      const input = String(text);
      const nodes = [];
      const wordRegex = /[A-Za-z0-9]+/g;
      let lastIndex = 0;
      let match;
      while ((match = wordRegex.exec(input)) !== null) {
        const word = match[0];
        const start = match.index;
        const end = start + word.length;

        if (start > lastIndex) {
          nodes.push(
            <React.Fragment key={`t-${lastIndex}`}>
              {input.slice(lastIndex, start)}
            </React.Fragment>,
          );
        }

        const wordLower = word.toLowerCase();
        const shouldHighlight = stemList.some((stem) => {
          if (stem.length <= 3) {
            return wordLower === stem; // exact match only
          }
          return wordLower.includes(stem);
        });

        if (shouldHighlight) {
          nodes.push(
            <span
              key={`h-${start}`}
              className=" rounded-md  bg-yellow-200 text-yellow-800"
              title={`Matches: ${word}`}
            >
              {word}
            </span>,
          );
        } else {
          nodes.push(
            <React.Fragment key={`w-${start}`}>{word}</React.Fragment>,
          );
        }

        lastIndex = end;
      }

      if (lastIndex < input.length) {
        nodes.push(
          <React.Fragment key={`t-${lastIndex}`}>
            {input.slice(lastIndex)}
          </React.Fragment>,
        );
      }

      return <span>{nodes}</span>;
    } catch (error) {
      console.error("Error in highlightKeywords:", error);
      return <span>{text}</span>;
    }
  };
  const location = useLocation();
  const category = location.pathname.includes("tsa") ? "tsa" : "gpc";

  // Animation variants
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
  // Helper function to format numbers with commas and 2 decimal places
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "" || value === "-")
      return "-";

    const num = parseFloat(value);
    if (isNaN(num)) return "-";

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Reusable info field with icon and color
  const InfoField = ({
    label,
    value,
    icon: Icon,
    color = "slate",
    children,
  }) => {
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
        {children ? (
          children
        ) : (
          <p className="text-md font-semibold text-slate-800 leading-relaxed">
            {value || "Not Available"}
          </p>
        )}
      </div>
    );
  };

  // Close on Escape key
  React.useEffect(() => {
    if (!company) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (typeof onClose === "function") onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [company, onClose]);

  return (
    <AnimatePresence>
      {company && (
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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl 
                       max-h-[90vh] overflow-y-auto border border-slate-200 left-10"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-md z-10 
                            px-6 py-4 border-b border-slate-200 
                            flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 rounded-lg">
                  <Building2 size={20} className="text-slate-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {company.name || "Company Details"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 rounded-full cursor-pointer hover:bg-slate-200 
                           hover:text-slate-800 transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-3">
                  <InfoField
                    label={category === "gpc" ? "Ticker" : "Buyers/Investors"}
                    value={
                      category === "gpc"
                        ? company.exchange_ticker
                        : company.buyers_investors
                    }
                    icon={Hash}
                    color="blue"
                  />
                  <InfoField
                    label="Country"
                    value={
                      category === "gpc"
                        ? company.headquarters_country_region
                        : company.geography
                    }
                    icon={Globe}
                    color="blue"
                  />
                  <InfoField
                    label={
                      category === "gpc"
                        ? "Enterprise Value"
                        : "Implied Enterprise Value (USD Million)"
                    }
                    value={
                      category === "gpc"
                        ? company.latest_financial?.enterprise_value &&
                          `$ ${formatNumber(
                            company.latest_financial.enterprise_value,
                          ).toLocaleString()} MM`
                        : company.implied_ev_usd &&
                          `$ ${formatNumber(
                            company.implied_ev_usd,
                          ).toLocaleString()} MM`
                    }
                    icon={DollarSign}
                    color="green"
                  />
                  {category === "tsa" && (
                    <InfoField
                      label="Transaction Value (USD Million)"
                      value={
                        company.total_transaction_value_usd
                          ? `$ ${formatNumber(company.total_transaction_value_usd).toLocaleString()} MM`
                          : "-"
                      }
                      icon={DollarSign}
                      color="green"
                    />
                  )}
                  {category === "tsa" && (
                    <InfoField
                      label="Target/Issuer"
                      value={company.target_issuer}
                      icon={Hash}
                      color="green"
                    />
                  )}
                  <InfoField
                    label="EV/Revenue"
                    value={
                      category === "gpc"
                        ? company.latest_financial?.ev_revenu &&
                          `${formatNumber(company.latest_financial.ev_revenu)}x`
                        : company.ev_revenue &&
                          `${formatNumber(company.ev_revenue)}x`
                    }
                    icon={Calculator}
                    color="green"
                  />
                  <InfoField
                    label="EV/EBITDA"
                    value={
                      category === "gpc"
                        ? company.latest_financial?.ev_ebitda &&
                          `${formatNumber(company.latest_financial.ev_ebitda)}x`
                        : company.ev_ebitda &&
                          `${formatNumber(company.ev_ebitda)}x`
                    }
                    icon={Calculator}
                    color="green"
                  />
                  <InfoField
                    label="Business Model Similarity"
                    value={company.business_model_similarity}
                    icon={Target}
                    color="purple"
                  />

                  <InfoField
                    label="AI Rationale"
                    value={company.ai_rationale}
                    icon={Lightbulb}
                    color="purple"
                  />
                </div>

                {/* Right column */}
                <div className="space-y-3">
                  <div className="py-3 border-b border-slate-100 last:border-none">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={18} className="text-orange-600" />
                      <p className="text-md font-medium uppercase tracking-wide text-slate-500">
                        Business Overview
                      </p>
                    </div>
                    <div className="text-md font-semibold text-slate-800 leading-relaxed p-3 bg-slate-50 rounded-lg border border-slate-200">
                      {company.business_description
                        ? highlightKeywords(
                            company.business_description,
                            keywords,
                          )
                        : "Not Available"}
                    </div>
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

export default PopOutCard;
