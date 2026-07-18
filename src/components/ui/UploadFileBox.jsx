import { useState } from "react";
import { X } from "lucide-react";

const UploadBox = ({ files, onFileChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    onFileChange((prev) => [...prev, ...fileArray]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files?.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col w-full min-h-50 border-2 border-dashed rounded-xl cursor-pointer transition p-4
        ${
          dragActive
            ? "border-gray-500 bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Empty State */}
        {files?.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <p className="text-gray-600 font-medium">Drag & drop files here</p>
            <p className="text-sm text-gray-400">or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">PDF, DOC, CSV</p>
          </div>
        )}

        {/* Files Inside Box */}
        {files?.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm shadow-sm"
              >
                <span className="truncate">{file.name}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onFileChange((prev) => prev.filter((_, index) => index !== i));
                  }}
                  className="text-red-500 cursor-pointer hover:text-red-700"
                >
                    <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </label>
    </>
  );
};

export default UploadBox;
