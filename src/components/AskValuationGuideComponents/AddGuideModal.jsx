import React, { useState, useEffect, useRef } from "react";
import { X, Upload, FileText, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import { uploadFileGuide } from "../../store/slice/askValuationGuideSlice";
import { toast } from "react-toastify";

const AddGuideModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Reset form on open
      setName("");
      setYear("");
      setPdfFile(null);
      setIsActive(true);
      setIsUploading(false);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }
      setPdfFile(file);
      // Auto-fill guide name from file name (without extension) if empty
      if (!name) {
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setName(baseName);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file only.");
        return;
      }
      setPdfFile(file);
      if (!name) {
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setName(baseName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a guide name.");
      return;
    }
    if (!year.trim()) {
      toast.error("Please enter a year.");
      return;
    }
    if (!pdfFile) {
      toast.error("Please upload a PDF file.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("year", year.trim());
    formData.append("pdf_file", pdfFile);
    formData.append("is_active", true);

    try {
      const resultAction = await dispatch(uploadFileGuide(formData));
      if (uploadFileGuide.fulfilled.match(resultAction)) {
        toast.success("Guide added successfully!");
        onClose();
      } else {
        const errorMsg = resultAction.payload || "Failed to add guide.";
        toast.error(typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg);
      }
    } catch (err) {
      console.error("Failed to add guide:", err);
      toast.error("Failed to add guide. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && !isUploading && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Add New Guide</h3>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Guide Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Guide Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ABC Valuation Standard"
                disabled={isUploading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2022"
                disabled={isUploading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* PDF File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                PDF File <span className="text-red-500">*</span>
              </label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all duration-200 cursor-pointer ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/50"
                    : pdfFile
                    ? "border-emerald-500 bg-emerald-50/10"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50"
                } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />

                {pdfFile ? (
                  <div className="flex flex-col items-center space-y-2 text-center w-full">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                      <FileText size={28} />
                    </div>
                    <div className="space-y-1 w-full px-4">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                      }}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline pt-1"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Only PDF documents are supported
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !name.trim() || !year.trim() || !pdfFile}
              className={`px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
                isUploading || !name.trim() || !year.trim() || !pdfFile
                  ? "cursor-not-allowed opacity-45"
                  : "cursor-pointer"
              }`}
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Add Guide</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGuideModal;
