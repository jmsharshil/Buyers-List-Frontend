import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import * as XLSX from "xlsx-js-style";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getUpdatedExtractionField,
  updateExtractionField,
  getExtractionAuditHistory,
  pollExtractionStatus,
} from "../store/slice/articleAiSlice";

const LoadingState = () => {
  const [loadingText, setLoadingText] = useState("Initializing extraction...");

  useEffect(() => {
    const texts = [
      "Analyzing document structure...",
      "Identifying key terms...",
      "Extracting cap table details...",
      "Structuring data into format...",
      "Finalizing extraction results..."
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.length;
      setLoadingText(texts[textIndex]);
    }, 3000);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-12 min-h-[50vh]">
      <Motion.div 
        animate={{ scale: [0.98, 1.05, 0.98] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="h-24 w-24 bg-white rounded-2xl shadow-lg border border-indigo-100 flex items-center justify-center relative z-10">
          <svg className="w-12 h-12 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Motion.div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Extracting Article Data</h3>
      <Motion.p 
        key={loadingText}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-500 mb-8 min-h-[1.5rem]"
      >
        {loadingText}
      </Motion.p>

      <div className="w-full max-w-md bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200 relative">
        <Motion.div 
          className="absolute top-0 bottom-0 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          initial={{ left: "-50%", width: "40%" }}
          animate={{ left: "110%", width: "60%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
const ArticleAIExtractResults = () => {
  const location = useLocation();
  const { result, loading, auditHistory, auditHistoryLoading } = useSelector(
    (state) => state.articleAi,
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rawData = location.state?.data;

  const KEY_TO_HEADER_MAP = useMemo(
    () => ({
      company_name: "Company Name",
      document_name: "Document Name",
      security_name: "Security Name",
      security_type: "Security Type",
      authorized_count: "Authorized Count",
      oip_original_issue_price: "OIP / Original Issue Price",
      liquidation_preference: "Liquidation Preference",
      dividend_paying: "Dividend Paying",
      dividend_type: "Dividend Type",
      dividend_rate: "Dividend Rate",
      conversion_ratio: "Conversion Ratio",
      conversion_price: "Conversion Price",
      participation_rights: "Participation Rights",
      participation_cap: "Participation Cap",
      seniority: "Seniority",
      senior_to: "Senior To",
      pari_passu_with: "Pari Passu With",
      junior_to: "Junior To",
      applies_to: "Applies To",
      source_basis: "Source Basis",
      confidence: "Confidence",
      source_section: "Source Section",
      source_text: "Source Text",
      review_flags: "Review Flags",
      series_type: "Series Type",
      series_name: "Series Name",
      issue_strike_price: "Issue / Strike Price",
      liq_pref_per_share: "Liq. Pref. / Share",
      seniority_in_liq_pref: "Seniority in Liq. Pref.",
      participation_cap_per_share: "Participation Cap $ / Share",
      dividend_payable: "Is Dividend Payable?",
      cap_price_includes_dividends: "Cap price Includes Dividends",
    }),
    [],
  );

  const PREFERRED_SECURITIES_KEYS = useMemo(
    () => [
      "company_name",
      "document_name",
      "security_name",
      "security_type",
      "authorized_count",
      "oip_original_issue_price",
      "liquidation_preference",
      "dividend_paying",
      "dividend_type",
      "dividend_rate",
      "conversion_ratio",
      "conversion_price",
      "participation_rights",
      "participation_cap",
      "seniority",
      "senior_to",
      "pari_passu_with",
      "junior_to",
      "applies_to",
      "source_basis",
      "confidence",
      "source_section",
      "source_text",
      "review_flags",
    ],
    [],
  );

  const PREFERRED_CAP_TABLE_KEYS = useMemo(
    () => [
      "series_type",
      "series_name",
      "authorized_count",
      "issue_strike_price",
      "liq_pref_per_share",
      "seniority_in_liq_pref",
      "participation_rights",
      "participation_cap_per_share",
      "conversion_price",
      "conversion_ratio",
      "dividend_payable",
      "dividend_rate",
      "dividend_type",
      "cap_price_includes_dividends",
    ],
    [],
  );

  const formatHeader = useCallback(
    (key) => {
      if (!key) return "";
      if (KEY_TO_HEADER_MAP[key]) return KEY_TO_HEADER_MAP[key];

      let str = key.replace(/[_|-]/g, " ");
      str = str.replace(/([a-z])([A-Z])/g, "$1 $2");
      return str
        .split(/\s+/)
        .map((word) => {
          if (!word) return "";
          if (word.toUpperCase() === word && word.length > 1) return word;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
    },
    [KEY_TO_HEADER_MAP],
  );

  const [securitiesData, setSecuritiesData] = useState([]);
  const [capTableData, setCapTableData] = useState([]);
  const [activeTab, setActiveTab] = useState("cap_table");
  const tableData = activeTab === "securities" ? securitiesData : capTableData;
  const setTableData =
    activeTab === "securities" ? setSecuritiesData : setCapTableData;
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showHistoryModal) {
        setShowHistoryModal(false);
      }
    };
    if (showHistoryModal) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showHistoryModal]);

  const handleViewHistory = () => {
    const extractionId = rawData?.extraction_id;
    if (extractionId) {
      dispatch(getExtractionAuditHistory({ extractionId }));
      setShowHistoryModal(true);
    }
  };

  useEffect(() => {
    let intervalId = null;
    let isActive = true;

    const statusUrl = rawData?.status_url;
    const extractionId = rawData?.extraction_id || rawData?.id;

    if (!statusUrl && !extractionId) {
      return;
    }

    const poll = async () => {
      try {
        let responseData;
        if (extractionId) {
          const actionResult = await dispatch(
            getUpdatedExtractionField({ extractionId }),
          );
          responseData = actionResult.payload;
        }

        if (isActive && responseData) {
          const status = responseData.status?.toLowerCase();
          setPollingStatus(status || "processing");

          if (status === "pending" || status === "processing") {
            setIsPolling(true);
            return true;
          } else {
            setIsPolling(false);
            return false;
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (isActive) {
          setIsPolling(false);
        }
        return false;
      }
      return false;
    };

    const runPolling = async () => {
      setIsPolling(true);
      const shouldContinue = await poll();

      if (shouldContinue && isActive) {
        intervalId = setInterval(async () => {
          const continuePolling = await poll();
          if (!continuePolling && intervalId) {
            clearInterval(intervalId);
          }
        }, 15000);
      }
    };

    runPolling();

    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dispatch, rawData]);

  useEffect(() => {
    const dataToUse =
      result && Object.keys(result).length > 0 ? result : rawData;

    let secArray = [];
    let capArray = [];

    if (dataToUse?.raw_json) {
      if (dataToUse.raw_json.securities)
        secArray = dataToUse.raw_json.securities;
      if (dataToUse.raw_json.cap_table) capArray = dataToUse.raw_json.cap_table;
    } else if (
      typeof dataToUse === "object" &&
      dataToUse !== null &&
      !Array.isArray(dataToUse)
    ) {
      secArray = [dataToUse];
    } else if (Array.isArray(dataToUse)) {
      secArray = dataToUse;
    }

    const companyName =
      dataToUse?.company_name || dataToUse?.raw_json?.company_name || "";
    const documentName =
      dataToUse?.document_name || dataToUse?.raw_json?.document_name || "";

    // Keep original keys for API updates
    setSecuritiesData(
      secArray.map((row) =>
        typeof row === "object" && row !== null
          ? { company_name: companyName, document_name: documentName, ...row }
          : row,
      ),
    );
    setCapTableData(
      capArray.map((row) =>
        typeof row === "object" && row !== null ? { ...row } : row,
      ),
    );
  }, [rawData, result]);

  const handleEditClick = (rowIndex, colIndex, value) => {
    setEditingCell({ rowIndex, colIndex });
    setEditValue(value);
  };

  const handleSaveEdit = async (rowIndex, header) => {
    if (!editingCell) return;

    const previousValue = tableData[rowIndex][header];

    // Optimistic update
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [header]: editValue,
      };
      return newData;
    });

    setEditingCell(null);

    // Make API call
    try {
      const extractionId = result?.id || rawData?.extraction_id || 6;
      await dispatch(
        updateExtractionField({
          extractionId,
          rowIndex,
          header,
          editValue,
          activeTab,
        }),
      ).unwrap();
      toast.success("Updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error);
      // Revert optimistic update
      setTableData((prevData) => {
        const newData = [...prevData];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [header]: previousValue,
        };
        return newData;
      });
    }
  };

  const headers = useMemo(() => {
    if (tableData.length === 0) return [];
    // Extract unique keys from all objects
    const keys = new Set();
    tableData.forEach((row) => {
      if (typeof row === "object" && row !== null) {
        Object.keys(row).forEach((key) => keys.add(key));
      }
    });

    const allKeys = Array.from(keys);
    const sortedKeys = [];

    const preferredList =
      activeTab === "securities"
        ? PREFERRED_SECURITIES_KEYS
        : PREFERRED_CAP_TABLE_KEYS;

    preferredList.forEach((prefKey) => {
      if (allKeys.includes(prefKey)) {
        sortedKeys.push(prefKey);
      }
    });

    allKeys.forEach((k) => {
      if (!sortedKeys.includes(k)) {
        if (
          activeTab === "cap_table" &&
          (k === "company_name" || k === "document_name")
        ) {
          return;
        }
        sortedKeys.push(k);
      }
    });

    return sortedKeys.length > 0 ? sortedKeys : allKeys;
  }, [
    tableData,
    PREFERRED_SECURITIES_KEYS,
    PREFERRED_CAP_TABLE_KEYS,
    activeTab,
  ]);

  const handleDownloadExcel = () => {
    if (securitiesData.length === 0 && capTableData.length === 0) return;

    const workbook = XLSX.utils.book_new();

    const appendSheet = (data, sheetName) => {
      if (data.length === 0) return;

      const keys = new Set();
      data.forEach((row) => {
        if (typeof row === "object" && row !== null) {
          Object.keys(row).forEach((key) => keys.add(key));
        }
      });
      let allKeys = Array.from(keys);
      let sortedKeys = [];
      const preferredList =
        sheetName === "Extracted Terms"
          ? PREFERRED_SECURITIES_KEYS
          : PREFERRED_CAP_TABLE_KEYS;

      preferredList.forEach((prefKey) => {
        if (allKeys.includes(prefKey)) {
          sortedKeys.push(prefKey);
        }
      });
      allKeys.forEach((k) => {
        if (!sortedKeys.includes(k)) {
          if (
            sheetName === "Cap Table Summary" &&
            (k === "company_name" || k === "document_name")
          ) {
            return;
          }
          sortedKeys.push(k);
        }
      });
      const sheetKeys = sortedKeys.length > 0 ? sortedKeys : allKeys;

      const excelData = data.map((row) => {
        const newRow = {};
        sheetKeys.forEach((key) => {
          const val = row[key];
          newRow[formatHeader(key)] =
            typeof val === "object" && val !== null ? JSON.stringify(val) : val;
        });
        return newRow;
      });

      // Move the 1st row after header to the second to last row in Excel (above Common Stock)
      if (excelData.length > 1) {
        const firstRow = excelData.shift();
        excelData.splice(excelData.length - 1, 0, firstRow);
      }

      const displayHeaders = sheetKeys.map(formatHeader);
      const worksheet = XLSX.utils.json_to_sheet(excelData, {
        header: displayHeaders,
      });

      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      worksheet["!autofilter"] = { ref: worksheet["!ref"] };

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];

          if (!cell) continue;

          const isCapTable = sheetName === "Cap Table Summary";
          const textColor = isCapTable ? "0000EE" : "000000";

          let cellStyle = {
            font: { name: "Calibri", sz: 11, color: { rgb: textColor } },
            alignment: { vertical: "top", horizontal: "left", wrapText: true },
            border: {
              top: { style: "thin", color: { rgb: "A6A6A6" } },
              bottom: { style: "thin", color: { rgb: "A6A6A6" } },
              left: { style: "thin", color: { rgb: "A6A6A6" } },
              right: { style: "thin", color: { rgb: "A6A6A6" } },
            },
          };

          if (R === 0) {
            cellStyle = {
              font: {
                name: "Calibri",
                sz: 11,
                bold: true,
                color: { rgb: "000000" },
              },
              fill: { fgColor: { rgb: "D9D9D9" } },
              alignment: {
                vertical: "center",
                horizontal: "center",
                wrapText: true,
              },
              border: {
                top: { style: "thin", color: { rgb: "A6A6A6" } },
                bottom: { style: "thin", color: { rgb: "A6A6A6" } },
                left: { style: "thin", color: { rgb: "A6A6A6" } },
                right: { style: "thin", color: { rgb: "A6A6A6" } },
              },
            };
          }

          cell.s = cellStyle;
        }
      }

      const colWidths = displayHeaders.map((header) => {
        const headerLength = header.length;
        const maxDataLength = Math.max(
          ...excelData.map((row) => {
            const val = row[header];
            return val !== null && val !== undefined ? String(val).length : 0;
          }),
        );
        return { wch: Math.min(Math.max(headerLength, maxDataLength) + 2, 80) };
      });
      worksheet["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    };

    // if (securitiesData.length > 0) appendSheet(securitiesData, "Extracted Terms");
    if (capTableData.length > 0) appendSheet(capTableData, "Cap Table Summary");

    const dataToUse =
      result && Object.keys(result).length > 0 ? result : rawData;
    // Prioritize document_name metadata to ensure clean, predictable filenames, bypassing messy AI extractions like "Not stated (redacted)"
    const originalFileName = dataToUse?.document_name || dataToUse?.company_name || "file";

    // Remove the original file extension (e.g., .pdf, .docx) and trailing dots before appending .xlsx
    let baseName = originalFileName.replace(/\.[^/.]+$/, "").replace(/\.$/, "").trim();
    
    // Remove leading numbering from filenames like "1. ", "2. "
    baseName = baseName.replace(/^\d+\.\s*/, "");
    
    // Extract the primary name (e.g., company name) from full document names
    if (baseName.includes(" - ")) {
      baseName = baseName.split(" - ")[0].trim();
    }
    
    // Clean up any remaining trailing commas or dashes
    baseName = baseName.replace(/[,-\s]+$/, "").trim();

    let downloadFileName = `extracted_terms_${baseName}`;
    if (!downloadFileName.toLowerCase().endsWith(".xlsx")) {
      downloadFileName += ".xlsx";
    }

    XLSX.writeFile(workbook, downloadFileName);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 pb-24 flex flex-col">
      <Motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full mb-8 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Extraction Results
          </h1>
          <p className="text-gray-500 mt-1">
            Review and download your analyzed article data.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleViewHistory}
            className="px-5 py-2.5 rounded-lg cursor-pointer border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            History
          </button>
          <button
            onClick={() => navigate("/article-ai")}
            className="px-5 py-2.5 rounded-lg cursor-pointer border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Upload
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={securitiesData.length === 0 && capTableData.length === 0}
            className={`px-5 py-2.5 rounded-lg cursor-pointer font-medium text-white shadow-md transition-all flex items-center gap-2 ${
              securitiesData.length === 0 && capTableData.length === 0
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Download Excel
          </button>
        </div>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-auto w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex-1 flex flex-col"
      >
        {loading || isPolling ? (
          <LoadingState />
        ) : securitiesData.length === 0 && capTableData.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-12 text-gray-500 min-h-[50vh]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-xl font-medium">No data available to display</p>
            <p className="text-sm mt-2">
              Please go back and upload an article to extract data.
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="flex border-b border-gray-200 bg-gray-50/50">
              {/* <button
                onClick={() => setActiveTab("securities")}
                className={`px-6 py-3 font-medium cursor-pointer text-sm transition-colors border-b-2 ${
                  activeTab === "securities"
                    ? "border-indigo-600 text-indigo-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Extracted Terms
              </button> */}
              {capTableData.length > 0 && (
                <button
                  onClick={() => setActiveTab("cap_table")}
                  className={`px-6 py-3 font-medium cursor-pointer text-sm transition-colors border-b-2 ${
                    activeTab === "cap_table"
                      ? "border-indigo-600 text-indigo-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cap Table Summary
                </button>
              )}
            </div>

            <div className="overflow-x-auto w-full flex-1 max-h-[65vh] border-b border-gray-300 bg-white">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm border-b-2 border-gray-300">
                  <tr>
                    {headers.map((header, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-sm font-bold text-gray-700 border-r border-gray-300 last:border-r-0 whitespace-nowrap bg-gray-100"
                      >
                        {formatHeader(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {(() => {
                    const dataWithIndices = tableData.map((row, index) => ({ row, originalIndex: index }));
                    if (dataWithIndices.length > 1) {
                      const firstItem = dataWithIndices.shift();
                      dataWithIndices.splice(dataWithIndices.length - 1, 0, firstItem);
                    }
                    return dataWithIndices;
                  })().map(({ row, originalIndex: rowIndex }) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-indigo-50 transition-colors duration-150 group border-b border-gray-200 even:bg-gray-50/50"
                    >
                      {headers.map((header, colIndex) => {
                        const val = row[header];
                        let displayVal = val;
                        if (typeof val === "object" && val !== null) {
                          displayVal = JSON.stringify(val);
                        }

                        const isEditing =
                          editingCell?.rowIndex === rowIndex &&
                          editingCell?.colIndex === colIndex;

                        return (
                          <td
                            key={colIndex}
                            className="px-4 py-3 text-sm text-gray-800 border-r border-gray-200 last:border-r-0 whitespace-pre-wrap min-w-[150px] max-w-sm break-words align-top relative group/cell"
                          >
                            {isEditing ? (
                              <textarea
                                autoFocus
                                className="w-full h-full min-h-[60px] p-2 border border-indigo-400 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSaveEdit(rowIndex, header);
                                  } else if (e.key === "Escape") {
                                    setEditingCell(null);
                                  }
                                }}
                                onBlur={() => setEditingCell(null)}
                              />
                            ) : (
                              <div className="flex items-start justify-between gap-2 h-full">
                                <span className="flex-1">
                                  {displayVal === null ||
                                  displayVal === undefined ? (
                                    <span className="text-gray-400 italic text-xs">
                                      N/A
                                    </span>
                                  ) : (
                                    String(displayVal)
                                  )}
                                </span>
                                <button
                                  onClick={() =>
                                    handleEditClick(
                                      rowIndex,
                                      colIndex,
                                      String(
                                        displayVal !== null &&
                                          displayVal !== undefined
                                          ? displayVal
                                          : "",
                                      ),
                                    )
                                  }
                                  className="opacity-0 group-hover/cell:opacity-100 cursor-pointer p-1 text-gray-400 hover:text-indigo-600 transition-opacity bg-white/80 rounded"
                                  title="Edit cell"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Motion.div>

      {/* History Modal */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowHistoryModal(false)}
        >
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Extraction Edit History
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {auditHistoryLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : auditHistory?.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No edit history found for this extraction.
                </div>
              ) : (
                <div className="space-y-4">
                  {auditHistory?.map((audit) => (
                    <div
                      key={audit.id}
                      className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {formatHeader(audit.field_name)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {audit.security_name} (Row{" "}
                            {audit.security_index + 1})
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium text-gray-700">
                            {audit.changed_by}
                          </div>
                          <div className="text-gray-400 mt-1">
                            {new Date(audit.changed_at).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                          <div className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wider">
                            Previous Value
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {audit.old_value || (
                              <span className="italic text-gray-400">
                                Empty
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                          <div className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wider">
                            New Value
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {audit.new_value || (
                              <span className="italic text-gray-400">
                                Empty
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Motion.div>
        </div>
      )}
    </div>
  );
};

export default ArticleAIExtractResults;
