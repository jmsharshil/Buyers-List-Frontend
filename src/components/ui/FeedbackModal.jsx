import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { userFeedback } from "../../store/slice/userAnalyticsSlice";

const FeedbackModal = ({ isOpen, onClose, title = "Share Your Feedback", workflow }) => {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getWorkflow = () => {
    if (workflow) return workflow;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("audit")) return "audit_ai";
    if (lowerTitle.includes("transaction") || lowerTitle.includes("tsa")) return "transaction_screening";
    if (lowerTitle.includes("gpc") || lowerTitle.includes("screening")) return "gpc_screening";
    if (lowerTitle.includes("article")) return "article_interpretation_ai";
    if (lowerTitle.includes("ask")) return "ask_ai";

    const path = window.location.pathname.toLowerCase();
    if (path.includes("audit")) return "audit_ai";
    if (path.includes("tsa")) return "transaction_screening";
    if (path.includes("screening") || path.includes("results")) return "gpc_screening";
    if (path.includes("article")) return "article_interpretation_ai";
    if (path.includes("ask")) return "ask_ai";
    return "";
  };

  const resolvedWorkflow = getWorkflow();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      workflow: resolvedWorkflow,
      rating: rating,
      feedback: feedback,
    };
    
    try {
      const resultAction = await dispatch(userFeedback(payload));
      if (userFeedback.fulfilled.match(resultAction)) {
        toast.success("Thank you for your feedback!");
        // Reset form
        setRating(0);
        setFeedback("");
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const resetForm = () => {
    setRating(0);
    setFeedback("");
    setHoverRating(0);
  };

  const handleStarClick = (index, isHalf) => {
    setRating(index + (isHalf ? 0.5 : 1));
    setHoverRating(0);
  };

  const handleStarMouseMove = (e, index) => {
    if (rating > 0) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const isHalf = x <= width * 0.5;
    setHoverRating(index + (isHalf ? 0.5 : 1));
  };

  const handleStarMouseLeave = () => {
    if (rating > 0) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating !== 0 ? hoverRating : rating;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
        resetForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose();
              setRating(0);
              setFeedback("");
            }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-center relative">
              <button
                onClick={() => {
                  onClose();
                  setRating(0);
                  setFeedback("");
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-white font-display tracking-tight">
                {title}
              </h2>
              <p className="text-indigo-100 mt-2 text-sm">
                Your input helps us improve our analysis quality
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-3">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                    How would you rate the results?
                  </label>
                  <div
                    className="flex items-center gap-2"
                    onMouseLeave={handleStarMouseLeave}
                  >
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const isFull = displayRating >= starValue;
                      const isHalf = displayRating === starValue - 0.5;

                      return (
                        <div
                          key={i}
                          className="cursor-pointer p-1"
                          onClick={(e) => {
                            const { left, width } =
                              e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - left;
                            handleStarClick(i, x < width / 2);
                          }}
                          onMouseMove={(e) => handleStarMouseMove(e, i)}
                        >
                          {isFull ? (
                            <FaStar className="w-9 h-9 text-amber-400 drop-shadow-sm transition-transform hover:scale-110" />
                          ) : isHalf ? (
                            <FaStarHalfAlt className="w-9 h-9 text-amber-400 drop-shadow-sm transition-transform hover:scale-110" />
                          ) : (
                            <FaRegStar className="w-9 h-9 text-slate-300 transition-transform hover:scale-110" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 font-display">
                    {displayRating.toFixed(1)}{" "}
                    <span className="text-sm text-slate-400 font-normal">
                      / 5.0
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Additional Comments
                  </label>
                  <textarea
                    id="feedback"
                    rows="4"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you liked or how we can improve..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white transition-all text-slate-700 resize-none font-medium text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full py-3.5 bg-slate-900 text-white cursor-pointer rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:translate-y-0 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:bg-slate-900"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
