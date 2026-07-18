import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowBigLeft, Check, Eye, Plus, X } from "lucide-react";
import AddGuideModal from "./AddGuideModal";

import { SidebarSkeleton } from "../ArticleAiComponents/Skeletons";
import { useNavigate } from "react-router-dom";

const GuideItem = ({
  guide,
  isSel,
  activeConversation,
  updateGuidesLoading,
  toggleGuide,
}) => {
  const spanRef = React.useRef(null);
  const [isTruncated, setIsTruncated] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipCoords, setTooltipCoords] = React.useState({ top: 0, left: 0 });
  const [position, setPosition] = React.useState("bottom");

  const handleMouseEnter = () => {
    if (spanRef.current) {
      const truncated =
        spanRef.current.scrollWidth > spanRef.current.clientWidth;
      setIsTruncated(truncated);
      if (truncated) {
        const rect = spanRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 120) {
          setPosition("top");
          setTooltipCoords({
            top: rect.top - 8,
            left: rect.left + rect.width / 2,
          });
        } else {
          setPosition("bottom");
          setTooltipCoords({
            top: rect.bottom + 8,
            left: rect.left + rect.width / 2,
          });
        }
        setShowTooltip(true);
      }
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      onClick={() => {
        if (updateGuidesLoading) return;
        toggleGuide(guide);
      }}
      className={`flex items-start gap-3 p-3 rounded-xl mb-1 border transition-all ${!updateGuidesLoading ? "cursor-pointer" : "cursor-not-allowed opacity-65"} ${isSel ? "bg-indigo-50 border-indigo-200" : "border-transparent hover:bg-gray-50"}`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${isSel ? "bg-indigo-500 border-indigo-500" : "border-gray-300"}`}
      >
        {isSel && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="relative flex items-center min-w-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span
            ref={spanRef}
            className={`text-sm font-semibold text-gray-800 truncate ${isTruncated ? "cursor-pointer" : ""}`}
          >
            {guide.name}
          </span>
          <button
            className="ml-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              window.open(guide.pdf_file, "_blank");
            }}
          >
            <Eye size={14} />
          </button>

          {isTruncated &&
            showTooltip &&
            createPortal(
              <div
                className="fixed z-[9999] pointer-events-none transition-opacity duration-200"
                style={{
                  top: `${tooltipCoords.top}px`,
                  left: `${tooltipCoords.left}px`,
                  transform:
                    position === "top"
                      ? "translate(-50%, -100%)"
                      : "translateX(-50%)",
                }}
              >
                <div className="hidden md:block w-max max-w-[220px]">
                  {position === "bottom" ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                      <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-b-[6px] border-b-gray-800"></div>
                    </div>
                  ) : (
                    <div className="absolute top-full left-1/2 -translate-x-1/2">
                      <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-t-[6px] border-t-gray-800"></div>
                    </div>
                  )}
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words text-center">
                    {guide.name}
                  </div>
                </div>

                <div className="md:hidden max-w-[200px]">
                  {position === "bottom" ? (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                      <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-b-[6px] border-b-gray-800"></div>
                    </div>
                  ) : (
                    <div className="absolute top-full left-1/2 -translate-x-1/2">
                      <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-t-[6px] border-t-gray-800"></div>
                    </div>
                  )}
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words whitespace-normal text-center">
                    {guide.name}
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
};

const GuideSelectionSidebar = ({
  guidesOpen,
  selectedGuides,
  availableGuides,
  toggleGuide,
  activeConversation,
  loading,
  updateGuidesLoading,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const role = localStorage.getItem("user_role") || "";
  const navigate = useNavigate();

  return (
    <div
      className={`w-[85vw] sm:w-72 md:w-80 bg-white border-r border-gray-200 flex flex-col z-40 shrink-0 fixed md:static inset-y-0 left-0 transform transition-transform duration-300 md:translate-x-0 shadow-xl md:shadow-none ${guidesOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Select Guides</h2>
          {role === "admin" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-2 py-2 border border-indigo-300 cursor-pointer hover:bg-indigo-100 rounded-lg cursor-pointer"
            >
              <Plus size={14} />
              <span className="text-sm font-semibold text-indigo-500">
                Add New Guide
              </span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Choose a guide</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hidden">
        {loading ? (
          <SidebarSkeleton />
        ) : (
          availableGuides.map((guide) => {
            const isSel = selectedGuides.some(
              (g) => String(g.id) === String(guide.id),
            );
            return (
              <GuideItem
                key={guide.id}
                guide={guide}
                isSel={isSel}
                activeConversation={activeConversation}
                updateGuidesLoading={updateGuidesLoading}
                toggleGuide={toggleGuide}
              />
            );
          })
        )}
      </div>
      <button
        onClick={() => {
          navigate("/ask-valuation-guide");
        }}
        className="ml-4 mr-4 my-4 px-4 py-2 cursor-pointer bg-indigo-500 text-white rounded-lg flex justify-center items-center gap-2"
      >
        <ArrowBigLeft />
        Back to Conversations
      </button>

      <AddGuideModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default GuideSelectionSidebar;
