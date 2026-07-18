import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { extractArticle } from "../store/slice/articleAiSlice";

const ArticleAIExtract = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      const data = await dispatch(extractArticle(file)).unwrap();
      toast.success("Article extracted successfully!");
      navigate("/article-ai-chats", { state: { data } });
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 pb-20">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/40"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">
            Article AI Extractor
          </h1>
          <p className="text-gray-500 text-lg">
            Upload your article document to instantly extract and analyze its contents.
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-gray-300 bg-gray-50/30 hover:border-indigo-400 hover:bg-indigo-50/20"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <Motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-600 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            {file ? (
              <div className="text-center">
                <p className="text-xl font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-gray-500 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-xl font-medium text-gray-700">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-500">PDF, DOC, DOCX, TXT (Max 10MB)</p>
              </div>
            )}
          </Motion.div>
        </div>

        <div className="mt-10 flex justify-center">
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className={`px-10 py-4 rounded-xl text-lg font-semibold text-white shadow-lg flex items-center gap-3 transition-all ${
              !file || isLoading
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Extracting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Analyze Article
              </>
            )}
          </Motion.button>
        </div>
      </Motion.div>
    </div>
  );
};

export default ArticleAIExtract;
