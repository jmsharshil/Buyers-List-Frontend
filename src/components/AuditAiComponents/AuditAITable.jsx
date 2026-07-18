import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import AuditAIPopOutCard from "./AuditAIPopOutCard";

const TooltipCell = ({ children, fullText }) => {
  const cellRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

  const handleMouseEnter = useCallback(() => {
    if (cellRef.current && fullText) {
      const rect = cellRef.current.getBoundingClientRect();
      setTooltipCoords({
        top: rect.bottom,
        left: rect.left + rect.width / 2,
      });
      setShowTooltip(true);
    }
  }, [fullText]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <div
      ref={cellRef}
      className="line-clamp-2 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showTooltip &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none transition-opacity duration-200"
            style={{
              top: `${tooltipCoords.top + 8}px`,
              left: `${tooltipCoords.left}px`,
              transform: "translateX(-50%)",
            }}
          >
            {/* Desktop tooltip */}
            <div className="hidden md:block w-max max-w-[400px]">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-b-[6px] border-b-gray-800"></div>
              </div>
              <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words text-left">
                {fullText}
              </div>
            </div>

            {/* Mobile tooltip */}
            <div className="md:hidden max-w-[280px]">
              <div className="absolute bottom-full left-1/2 -translate-x-1/2">
                <div className="border-l-[#00000000] border-r-[#00000000] border-l-[6px] border-r-[6px] border-b-[6px] border-b-gray-800"></div>
              </div>
              <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed break-words whitespace-normal text-left">
                {fullText}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const TOOLTIP_COLUMNS = new Set(["question", "response"]);

const ROW_HEIGHT = 72; // estimated row height in px

const AuditAITable = ({ table, loading, searchTerm }) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const tableContainerRef = useRef(null);

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mt-6">
      <div
        ref={tableContainerRef}
        className="overflow-auto shadow-inner max-h-[100vh]"
      >
        <table className="min-w-full" style={{ borderCollapse: "collapse" }}>
          <thead className="bg-gradient-to-r from-slate-50 via-white to-slate-50 sticky top-0 z-10 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 cursor-pointer text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[200px]"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="px-6 py-12 text-center text-gray-500 text-base"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p>Loading screening results...</p>
                  </div>
                </td>
              </tr>
            ) : rows.length > 0 ? (
              <>
                {/* Top spacer to push visible rows into correct scroll position */}
                {rowVirtualizer.getVirtualItems().length > 0 && (
                  <tr>
                    <td
                      style={{
                        height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px`,
                        padding: 0,
                        border: "none",
                      }}
                      colSpan={table.getAllColumns().length}
                    />
                  </tr>
                )}

                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  const isActive = selectedRow === row.original;
                  const isEven = virtualRow.index % 2 === 0;

                  return (
                    <tr
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={`transition-colors cursor-pointer hover:bg-indigo-50 ${
                        isActive
                          ? "bg-indigo-100 border-l-4 border-indigo-500"
                          : isEven
                            ? "bg-white"
                            : "bg-slate-50"
                      }`}
                      onClick={() => setSelectedRow(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const columnId = cell.column.id;
                        const useTooltip = TOOLTIP_COLUMNS.has(columnId);
                        const rawValue = useTooltip
                          ? cell.row.original[columnId]
                          : null;

                        return (
                          <td
                            key={cell.id}
                            className="px-6 py-4 text-sm text-gray-700 cursor-pointer"
                          >
                            {useTooltip ? (
                              <TooltipCell fullText={rawValue}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </TooltipCell>
                            ) : (
                              <div className="line-clamp-2">
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Bottom spacer */}
                {rowVirtualizer.getVirtualItems().length > 0 && (
                  <tr>
                    <td
                      style={{
                        height: `${
                          rowVirtualizer.getTotalSize() -
                          (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)
                        }px`,
                        padding: 0,
                        border: "none",
                      }}
                      colSpan={table.getAllColumns().length}
                    />
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="px-6 py-12 text-center text-gray-500 text-base"
                >
                  No matching results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AuditAIPopOutCard
        data={selectedRow}
        onClose={() => setSelectedRow(null)}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default AuditAITable;
