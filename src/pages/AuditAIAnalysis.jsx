import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import UserProfile from "../components/Layout/UserProfile";
import UploadFileBox from "../components/ui/UploadFileBox";
import {
  generateAuditAiAnalysis,
  resetAuditAIAnalysis,
} from "../store/slice/auditAIAnalysisSlice";
import FeedbackModal from "../components/ui/FeedbackModal";
import {
  Check,
  Loader,
  Sparkles,
  Database,
  FileText,
  CheckCircle2,
  FileSearch,
  Copy,
  Check as CheckIcon,
  Zap,
  Clock,
  ArrowRight,
  Download,
  ChevronDown,
  FileSpreadsheet,
  MessageSquarePlus,
} from "lucide-react";
import {
  downloadAsPDF,
  downloadAsWordDocument,
  downloadAsExcel,
} from "../components/AskAiComponents/downloadUtils";
import { fileToBase64, base64ToFile } from "../utils/helper";

const AuditAIAnalysis = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = localStorage.getItem("auditAiAnalysisForm");
    return saved ? JSON.parse(saved).searchQuery || "" : "";
  });
  const [extraQueries, setExtraQueries] = useState(() => {
    const saved = localStorage.getItem("auditAiAnalysisForm");
    return saved ? JSON.parse(saved).extraQueries || [] : [];
  });
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("auditAiAnalysisForm");
    return saved ? JSON.parse(saved).notes || "" : "";
  });
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem("auditAiAnalysisForm");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.files && Array.isArray(parsed.files)) {
          return parsed.files.map((f) => base64ToFile(f.data, f.name));
        }
      } catch (e) {
        console.error("Error loading files from storage", e);
      }
    }
    return [];
  });

  const dispatch = useDispatch();

  const streamingContent = useSelector(
    (state) => state.auditAiAnalysis?.streamingContent,
  );
  const analysisResult = useSelector(
    (state) => state.auditAiAnalysis?.analysisResult,
  );
  const loading = useSelector((state) => state.auditAiAnalysis?.loading);
  const error = useSelector((state) => state.auditAiAnalysis?.error);
  const statusMessage = useSelector(
    (state) => state.auditAiAnalysis?.statusMessage,
  );

  const scrollRef = useRef(null);
  const contentRef = useRef(null);
  const downloadMenuRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const wasLoading = useRef(false);

  useEffect(() => {
    const saveFormData = async () => {
      try {
        const filesData = await Promise.all(
          files.map(async (file) => {
            // Check if it's already a File object
            if (file instanceof File) {
              const base64 = await fileToBase64(file);
              return { name: file.name, data: base64 };
            }
            return file; // Should not happen with current state logic
          }),
        );

        const dataToSave = {
          searchQuery,
          extraQueries,
          notes,
          files: filesData,
        };

        localStorage.setItem("auditAiAnalysisForm", JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving form to local storage:", error);
        if (error.name === "QuotaExceededError") {
          console.warn("Local storage quota exceeded, files not saved.");
        }
      }
    };

    saveFormData();
  }, [searchQuery, extraQueries, notes, files]);

  useEffect(() => {
    if (loading) {
      wasLoading.current = true;
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }

    if (
      wasLoading.current &&
      !loading &&
      (analysisResult || streamingContent)
    ) {
      const reportElement = document.getElementById("analysis-report");
      if (reportElement) {
        const yOffset = -5;
        const y =
          reportElement.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      wasLoading.current = false;
    }
  }, [loading, streamingContent, analysisResult]);

  // Close download menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(e.target)
      ) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.title = "Audit AI Analysis";
  }, []);

  const handleAddQuery = () => {
    if (extraQueries.length < 5) {
      setExtraQueries((prev) => [...prev, ""]);
    }
  };

  const handleRemoveQuery = (index) => {
    setExtraQueries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtraQueryChange = (index, value) => {
    setExtraQueries((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

  const handleCopy = () => {
    if (!contentRef.current) return;
    const htmlContent = contentRef.current.innerHTML;
    const plainText = contentRef.current.innerText;
    const clipboardItem = new ClipboardItem({
      "text/html": new Blob([htmlContent], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    });
    navigator.clipboard.write([clipboardItem]);
    setCopied(true);
    toast.success("Formatted analysis copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormattedContentForDownload = () => {
    const text = analysisResult?.text || analysisResult || streamingContent;
    if (!text) return "";

    return text
      .trim()
      .replace(/\n{3,}/g, "\n\n")
      .replace(/===== QUERY: ([\s\S]*?) =====/g, (match, queryContent) => {
        return `===== QUERY: ${queryContent.trim().replace(/\r?\n/g, " ")} =====`;
      })
      .replace(
        /\[AI_ANSWER_START\]([\s\S]*?)\[SOURCE_PLACEHOLDER\](.*?)\[\/SOURCE_PLACEHOLDER\]/g,
        "\nSOURCE: $2\n\n$1",
      )
      .replace(/\[AI_ANSWER_START\]/g, "\nSOURCE: AI Generated\n\n")
      .replace(/\[SOURCE_PLACEHOLDER\].*?\[\/SOURCE_PLACEHOLDER\]/g, "")
      .replace(/^>\s?/gm, "") // Strip markdown blockquote `>` prefixes from lines
      .replace(/^===== QUERY: (.*) =====$/gm, "## Q. $1")
      .replace(/^SOURCE: (.*)$/gm, "SOURCE: $1") // Kept as text, as pdf/word export templates ignore header4
      .replace(/^### (.*)$/gm, "## $1"); // PDF export template ignores header3, upgrade to header2
  };

  const formatText = (text) => {
    if (!text) return null;

    const processedText = text
      .trim()
      .replace(/\n{3,}/g, "\n\n")
      // Handle multiline queries by replacing newlines with a placeholder
      .replace(/===== QUERY: ([\s\S]*?) =====/g, (match, queryContent) => {
        return `===== QUERY: ${queryContent.trim().replace(/\r?\n/g, " __NEWLINE__ ")} =====`;
      })
      .replace(
        /\[AI_ANSWER_START\]([\s\S]*?)\[SOURCE_PLACEHOLDER\](.*?)\[\/SOURCE_PLACEHOLDER\]/g,
        "\n#### SOURCE: $2\n\n$1",
      )
      .replace(/\[AI_ANSWER_START\]/g, "\n#### SOURCE: AI Generated\n\n")
      .replace(/\[SOURCE_PLACEHOLDER\].*?\[\/SOURCE_PLACEHOLDER\]/g, "")
      .replace(/^===== QUERY: (.*) =====$/gm, "## QUERY: $1")
      .replace(/^SOURCE: (.*)$/gm, "#### SOURCE: $1")
      .replace(/^### (.*)$/gm, "### $1");

    return (
      <div className="relative">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h4: ({ node, children, ...props }) => {
              const content = React.Children.toArray(children)
                .map((child) => (typeof child === "string" ? child : ""))
                .join("");

              if (content.includes("SOURCE:")) {
                return (
                  <div className="mb-1.5 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[11px] font-bold text-indigo-600 tracking-wide">
                      {content.toLowerCase() === 'source: database' ? <Database className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                      {content}
                    </span>
                  </div>
                );
              }
              return <h4 {...props}>{children}</h4>;
            },
            h2: ({ node, children, ...props }) => {
              const content = React.Children.toArray(children)
                .map((child) => (typeof child === "string" ? child : ""))
                .join("");

              if (content.includes("QUERY:")) {
                const queryText = content
                  .replace("QUERY:", "")
                  .replace(/__NEWLINE__/g, "\n")
                  .trim();
                return (
                  <div className="relative mb-4">
                    <div className="relative bg-white border border-gray-300 rounded-xl p-4 overflow-hidden">
                      <h2 className="text-lg font-bold text-slate-900 leading-tight relative z-10 font-display whitespace-pre-wrap">
                        Q. {queryText}
                      </h2>
                    </div>
                  </div>
                );
              }
              return (
                <h2
                  className="text-xl font-bold text-slate-900 mt-6 mb-3 border-b border-slate-100 pb-2 font-display"
                  {...props}
                >
                  {children}
                </h2>
              );
            },
            h3: ({ node, ...props }) => (
              <div className="flex items-center gap-2 mt-4 mb-2">
                <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                <h3
                  className="text-base font-bold text-slate-800 tracking-tight font-display"
                  {...props}
                />
              </div>
            ),
            p: ({ node, ...props }) => (
              <p
                className="text-slate-600 leading-normal text-[14px] font-normal inline-block mb-1"
                {...props}
              />
            ),
            blockquote: ({ node, ...props }) => (
              <div className="bg-slate-50/80 border-slate-300 px-5 py-3 rounded-xl mb-3 italic text-slate-600 relative overflow-hidden group border border-gray-300">
                <div className="relative z-10 leading-normal font-medium text-slate-700 text-[13px]">
                  {props.children}
                </div>
              </div>
            ),
            ul: ({ node, ...props }) => (
              <ul className="space-y-1 my-3" {...props} />
            ),
            ol: ({ node, children, ...props }) => {
              const validChildren = React.Children.toArray(children).filter(
                (child) => React.isValidElement(child),
              );

              return (
                <ol className="space-y-1 my-3" {...props}>
                  {validChildren.map((child, index) =>
                    React.cloneElement(child, { index }),
                  )}
                </ol>
              );
            },

            // ✅ LIST ITEM with correct numbering
            li: ({ node, children, index, ...props }) => {
              return (
                <li
                  className="group flex gap-2.5 list-none relative px-2.5 py-1.5 rounded-lg border border-gray-200 transition-all duration-300"
                  {...props}
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded-md flex items-center justify-center mt-0.5 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                    {typeof index === "number" ? `${index + 1}.` : "•"} {" "}
                  </div>
                  <div className="text-slate-700 flex-1 flex flex-col justify-center text-[13px]">
                    <div className="max-w-none">{children}</div>
                  </div>
                </li>
              );
            },
            strong: ({ node, ...props }) => (
              <strong
                className="font-bold text-slate-900 px-0.5 rounded"
                {...props}
              />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 shadow-sm bg-white">
                <table
                  className="w-full text-left border-separate border-spacing-0"
                  {...props}
                />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-slate-50 text-slate-900" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th
                className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className="px-4 py-2.5 border-b border-slate-50 text-slate-600 text-[13px]"
                {...props}
              />
            ),
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code
                  className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[13px] border border-slate-200"
                  {...props}
                />
              ) : (
                <div className="bg-[#1e293b] rounded-xl p-5 my-3 overflow-x-auto shadow-lg border border-slate-700 group relative">
                  <div className="absolute top-3 right-3 flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  </div>
                  <code
                    className="text-indigo-200 font-mono text-xs leading-normal block"
                    {...props}
                  />
                </div>
              ),
          }}
        >
          {processedText}
        </ReactMarkdown>
        {loading && (
          <span className="inline-block w-2 h-5 ml-1 bg-indigo-600 animate-pulse align-middle rounded-sm"></span>
        )}
      </div>
    );
  };

  const selectedData = useSelector(
    (state) => state.auditScreening?.selectedRows || [],
  );

  const selectedTypes = selectedData?.length
    ? [...new Set(selectedData.map((row) => row.type))].join(",")
    : "";
  const selectedClassifications = selectedData?.length
    ? [...new Set(selectedData.map((row) => row.classification))].join(",")
    : "";
  const selectedAuditors = selectedData?.length
    ? [...new Set(selectedData.map((row) => row.auditor))].join(",")
    : "";

  const handleAnalyze = () => {
    const allQueries = [searchQuery, ...extraQueries]
      .map((q) => q.trim())
      .filter(Boolean);

    dispatch(
      generateAuditAiAnalysis({
        queries: allQueries,
        notes,
        type: selectedTypes,
        classification: selectedClassifications,
        auditor: selectedAuditors,
        files,
      }),
    );
  };

  const handleOnClear = () => {
    localStorage.removeItem("auditAiAnalysisForm");
    dispatch(resetAuditAIAnalysis());
    setSearchQuery("");
    setExtraQueries([]);
    setNotes("");
    setFiles([]);
  };

  return (
    <div className="min-h-screen relative px-4 pt-6 pb-32 sm:px-12 lg:px-24 bg-[#fcfdfe] overflow-hidden font-sans">
      {/* Refined Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-50/40 filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-slate-100/40 filter blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Right side - UserProfile */}
        <div className="flex justify-center md:justify-end">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">
              <UserProfile />
            </span>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center px-4 py-1.5 bg-white border border-slate-200 rounded-full mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-2" />
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
              Next-Gen Audit Analysis
            </span>
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight text-slate-900 font-display">
            AI Audit{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-800">
              Intelligence
            </span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Harnessing advanced machine learning to synthesize audit selections,
            documentation, and custom queries into actionable insights.
          </p>
          <motion.button
            onClick={handleOnClear}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-3 bg-red-600 w-auto my-5 mx-auto text-white rounded-xl shadow-2xl font-semibold text-lg hover:bg-red-700 transition-colors cursor-pointer"
            transition={{ duration: 0.2 }}
          >
            Clear Form
          </motion.button>
        </div>

        <div className="max-w-5xl mx-auto space-y-10">
          {/* Main Query Block */}
          <div className="bg-white border border-gray-300 rounded-[2.5rem] p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50 relative group">
            <div className="flex justify-between mb-5 items-center">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-indigo-600" />
                What should the AI analyze?
              </label>
              {extraQueries.length < 5 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 cursor-pointer group px-6 py-3 rounded-full transition-all font-bold text-xs uppercase tracking-widest border bg-white border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900"
                    onClick={handleAddQuery}
                  >
                    + Add Query ({extraQueries.length}/5)
                  </button>
                </div>
              )}
            </div>
            <textarea
              className="w-full h-25 p-6 bg-slate-50/50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 focus:bg-white transition-all text-slate-800 text-lg placeholder-slate-300 resize-none font-medium"
              placeholder="E.g., Analyze the variance in Q3 operational expenses and flag potential compliance risks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <AnimatePresence>
              {extraQueries.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <textarea
                      className="w-full h-20 p-4 pr-12 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all text-slate-800 text-base placeholder-indigo-300 resize-none font-medium"
                      placeholder={`Additional query ${idx + 1}...`}
                      value={q}
                      onChange={(e) =>
                        handleExtraQueryChange(idx, e.target.value)
                      }
                    />
                    <button
                      onClick={() => handleRemoveQuery(idx)}
                      className="absolute top-2.5 right-3 w-6 h-6 rounded-full bg-slate-200 hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                      title="Remove query"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Add Notes Section */}
          <div className="bg-white border border-gray-300 rounded-[2.5rem] p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative group">
            <label className="block text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              Add Notes
            </label>
            <textarea
              className="w-full h-48 p-3 bg-slate-50/30 border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-slate-500/5 focus:border-slate-400 focus:bg-white resize-none text-slate-800 placeholder-slate-300 transition-all font-medium"
              placeholder="Include internal references, specific compliance standards, or relevant prior findings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Upload File Section */}
          {/* <div className="bg-white border border-gray-300 rounded-[2.5rem] p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative group">
              <div className="h-full flex flex-col">
                <label className="block text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-400" />
                  Upload Documents
                </label>
                <div className="flex-1 min-h-[192px]">
                  <UploadFileBox files={files} onFileChange={setFiles} />
                </div>
              </div>
            </div> */}

          {/* Analysis Parameters Section */}
          <div className="bg-slate-50/50 border border-gray-300 rounded-3xl p-5 transition-all">
            <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5 flex items-center gap-2">
              <div className="w-4 h-[1px] bg-slate-300"></div>
              Data Sources for Synthesis
              <div className="w-4 h-[1px] bg-slate-300"></div>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  label: "Analyze responses from internal database",
                  icon: (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  ),
                },
                {
                  label: "Questions posted above.",
                  icon: (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  ),
                },
                {
                  label:
                    "Analyzing the Information provided in the notes section.",
                  icon: (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  ),
                },
                // {
                //   label: "Analyze the uploaded document.",
                //   icon: (
                //     <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                //   ),
                // },
              ].map((param, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-white border border-slate-100 px-5 py-3 rounded-2xl text-[13px] font-bold text-slate-600 shadow-sm"
                >
                  <div className="bg-indigo-50 p-1 rounded-md">
                    {param.icon}
                  </div>
                  {param.label}
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={!searchQuery.trim() || loading}
            className="group mx-auto relative overflow-hidden cursor-pointer bg-slate-900 text-white px-10 py-3 rounded-3xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-4 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mt-10"
            onClick={handleAnalyze}
          >
            {loading ? (
              <>
                <Loader className="animate-spin w-6 h-6 text-indigo-400" />
                <span className="tracking-wide uppercase text-sm font-black">
                  Synthesizing Audit Intelligence...
                </span>
              </>
            ) : (
              <>
                <span className="tracking-wide uppercase text-sm font-black">
                  Generate Comprehensive Analysis
                </span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </>
            )}
          </button>

          {/* Unified AI Analysis Report Container */}
          <AnimatePresence>
            {(loading || streamingContent || analysisResult) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative mt-6"
                id="analysis-report"
              >
                <div className="relative bg-white rounded-2xl border border-gray-300 overflow-hidden min-h-[300px] flex flex-col">
                  {/* Header Bar */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-10 w-10 items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
                        {loading ? (
                          <div className="relative">
                            <div className="w-7 h-7 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-indigo-600" />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                        )}
                      </div>
                      <div className="text-center sm:text-left">
                        <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2 justify-center sm:justify-start">
                          AI Audit Analysis
                          {!loading && (
                            <span className="text-[9px] bg-slate-900 text-white px-2 py-1 rounded-md uppercase tracking-[0.2em] font-black">
                              Verified
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5 text-[12px] font-bold text-slate-400">
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-indigo-400" />
                              {statusMessage || "Synthesizing intelligence..."}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-emerald-600/70 uppercase tracking-widest text-[11px]">
                              Report Ready for Review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Download Dropdown */}
                      <div className="relative" ref={downloadMenuRef}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowDownloadMenu((prev) => !prev)}
                          className="px-5 py-2.5 rounded-xl border flex items-center gap-2 text-[10px] font-black transition-all cursor-pointer shadow-sm tracking-widest bg-white border-slate-200 text-slate-900 hover:border-slate-400"
                        >
                          <Download className="w-4 h-4" />
                          DOWNLOAD
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              showDownloadMenu ? "rotate-180" : ""
                            }`}
                          />
                        </motion.button>

                        <AnimatePresence>
                          {showDownloadMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -8, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden z-50"
                            >
                              <div className="p-1.5">
                                <button
                                  onClick={() => {
                                    downloadAsPDF(
                                      getFormattedContentForDownload(),
                                    );
                                    setShowDownloadMenu(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer group"
                                >
                                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                    <FileText className="w-4 h-4 text-red-500" />
                                  </div>
                                  <div className="text-left">
                                    <div className="text-[13px] font-bold">
                                      PDF Document
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      .pdf format
                                    </div>
                                  </div>
                                </button>
                                <button
                                  onClick={() => {
                                    downloadAsWordDocument(
                                      getFormattedContentForDownload(),
                                    );
                                    setShowDownloadMenu(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer group"
                                >
                                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <div className="text-left">
                                    <div className="text-[13px] font-bold">
                                      Word Document
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      .doc format
                                    </div>
                                  </div>
                                </button>
                                <button
                                  onClick={() => {
                                    downloadAsExcel(
                                      getFormattedContentForDownload(),
                                    );
                                    setShowDownloadMenu(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer group"
                                >
                                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                                  </div>
                                  <div className="text-left">
                                    <div className="text-[13px] font-bold">
                                      Excel Spreadsheet
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      .xlsx format
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Copy Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopy}
                        className={`px-5 py-2.5 rounded-xl border flex items-center gap-2 text-[10px] font-black transition-all cursor-pointer shadow-sm tracking-widest ${
                          copied
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-white border-slate-200 text-slate-900 hover:border-slate-400"
                        }`}
                      >
                        {copied ? (
                          <CheckIcon className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? "COPIED" : "COPY"}
                      </motion.button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 px-6 pb-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-100 p-5 rounded-2xl mb-6 flex items-start gap-4 shadow-sm"
                      >
                        <div className="w-12 h-12 bg-white border border-red-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-600">
                          <Zap className="w-6 h-6 fill-red-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-red-900 text-xs uppercase tracking-[0.2em] mb-1">
                            System Error
                          </h4>
                          <p className="text-red-700 font-medium leading-relaxed">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div ref={scrollRef} className="pr-4 mr-4">
                      <div
                        ref={contentRef}
                        className="max-w-none prose-headings:font-display prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-blockquote:border-slate-200 prose-blockquote:bg-slate-50/50 prose-li:text-slate-600"
                      >
                        {formatText(
                          analysisResult?.text ||
                            analysisResult ||
                            streamingContent,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
        title="Audit AI Analysis Feedback"
      />
    </div>
  );
};

export default AuditAIAnalysis;
