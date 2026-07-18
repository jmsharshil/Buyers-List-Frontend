import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import UserProfile from "../components/Layout/UserProfile";
import { motion } from "framer-motion";
import * as XLXS from "xlsx";
import Input from "../components/ScreeningForm/InputField.jsx";
import { fetchAuditAiSummary } from "../store/slice/auditAiDashboardSlice";
import {
  fetchAuditScreeningResults,
  resetAuditScreening,
} from "../store/slice/auditScreeningSlice";
import { Loader, WholeWord } from "lucide-react";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import AuditAIFilters from "../components/AuditAiComponents/AuditAIFilters";
import AuditAITable from "../components/AuditAiComponents/AuditAITable";
import AuditAIQuery from "../components/AuditAiComponents/AuditAIQueryProceed.jsx";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";

const columnHelper = createColumnHelper();
const fallbackData = [];

const AuditAiScreening = () => {
  const [category, setCategory] = useState(null);
  const [subCategory, setSubCategory] = useState([]);
  const [auditor, setAuditor] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  // const [pagination, setPagination] = useState({
  //   pageIndex: 0,
  //   pageSize: 200,
  // });
  const [rowSelection, setRowSelection] = useState({});
  const [searchValue, setSearchValue] = useState("");

  const data = useSelector((state) => state.auditAiDashboard.auditAiSummary);
  const auditData = useSelector((state) => state.auditScreening);
  const totalResults = auditData.auditScreeningResults?.total_count;
  const loading = auditData.loading;

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleOnClear = () => {
    setCategory(null);
    setSubCategory([]);
    setAuditor([]);
    setRowSelection({});
    setGlobalFilter("");
    setSearchValue("");
    dispatch(resetAuditScreening());
    if (
      category ||
      subCategory.length > 0 ||
      auditor.length > 0 ||
      searchValue
    ) {
      toast.info("Form cleared successfully.");
    }
  };

  const customGlobalFilter = (row, columnId, filterValue) => {
    if (!filterValue) return true;

    const searchTerms = filterValue
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean);

    if (searchTerms.length === 0) return true;

    const combinedText = `${row.getValue("question") || ""} ${
      row.getValue("response") || ""
    }`.toLowerCase();

    return searchTerms.every((term) => {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedTerm}\\b`, "i");
      return regex.test(combinedText);
    });
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

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "serial",
        header: "#",
        cell: ({ row }) => row.index + 1,
      }),

      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            // ref={(input) => {
            //   if (input) {
            //     input.indeterminate = table.getIsSomeRowsSelected();
            //   }
            // }}
            className="cursor-pointer"
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        ),
      }),

      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("classification", {
        header: "Classification",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("project", {
        header: "Project",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("auditor", {
        header: "Auditor",
        cell: (info) => (
          <div className="max-w-[62px] line-clamp-2">{info.getValue()}</div>
        ),
      }),

      columnHelper.accessor("question", {
        header: "Questions",
        cell: (info) => (
          <div className="flex items-center gap-2 w-[200px]">
            <span className="text-ellipsis overflow-hidden line-clamp-4 whitespace-normal w-full">
              {highlightText(info.getValue(), globalFilter)}
            </span>
          </div>
        ),
      }),

      columnHelper.accessor("response", {
        header: "Responses",
        cell: (info) => (
          <div className="flex items-center gap-2 w-[200px]">
            <span className="text-ellipsis overflow-hidden line-clamp-4 whitespace-normal w-full">
              {highlightText(info.getValue(), globalFilter)}
            </span>
          </div>
        ),
      }),
    ],
    [globalFilter],
  );

  const table = useReactTable({
    data: auditData.auditScreeningResults?.results || fallbackData,
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    globalFilterFn: customGlobalFilter,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
  });

  const debouncedGlobalFilter = useMemo(
    () => debounce((value) => setGlobalFilter(value), 1000),
    [],
  );

  useEffect(() => {
    debouncedGlobalFilter(searchValue);
  }, [searchValue, debouncedGlobalFilter]);

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedData = selectedRows.map((row) => row.original);

  const isDownloadDisabled = selectedRows.length === 0;

  const categories = data?.type_breakdown?.map((item) => item.type) || [];
  const subCategories = data?.category_breakdown;
  const auditors = data?.auditor_breakdown.map((item) => item.auditor) || [];

  const categoryOptions = ["Select Category", ...categories];
  const subCategoryOptions = [
    "Select Sub-Category",
    ...(category
      ? subCategories
          .filter((item) => item.types?.some((t) => t.type === category))
          .map((item) => item.classification)
      : []),
  ];
  const auditorOptions = ["Select Auditor", ...auditors];

  const handleDownload = () => {
    const headers = [
      "#",
      "Type",
      "Classification",
      "Project",
      "Auditor",
      "Questions",
      "Responses",
    ];
    const formattedData = selectedData.map((item, index) => ({
      "#": index + 1,
      Type: item.type,
      Classification: item.classification,
      Project: item.project,
      Auditor: item.auditor,
      Questions: item.question,
      Responses: item.response,
    }));
    const worksheet = XLXS.utils.json_to_sheet(formattedData, {
      header: headers,
    });

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 60 },
      { wch: 60 },
    ];

    const workbook = XLXS.utils.book_new();

    XLXS.utils.book_append_sheet(workbook, worksheet, "Selected Data");
    XLXS.writeFile(workbook, "selected_audit_screening_data.xlsx");
    toast.success("Report downloaded successfully!");
  };

  useEffect(() => {
    dispatch(fetchAuditAiSummary());
    dispatch(fetchAuditScreeningResults({ category, subCategory, auditor }));
    document.title = "Audit AI Screening";
  }, [dispatch]);

  useEffect(() => {
    const isCategoryEmpty = !category;
    const isSubCategoryEmpty =
      !subCategory || (Array.isArray(subCategory) && subCategory.length === 0);
    const isAuditorEmpty =
      !auditor || (Array.isArray(auditor) && auditor.length === 0);

    if (isCategoryEmpty && isSubCategoryEmpty && isAuditorEmpty) {
      dispatch(resetAuditScreening());
      return;
    }

    dispatch(
      fetchAuditScreeningResults({
        category,
        subCategory,
        auditor,
      }),
    );
  }, [category, subCategory, auditor, dispatch]);

  return (
    <div className="bg-gray-100 min-h-screen px-4 pt-6 pb-24  sm:px-32 lg:px-34">
      {/* Header */}
      <div className="flex items-center justify-end mb-8">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <UserProfile />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Screening Criteria
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Evaluate and confirm the audit entities for AI deep-dive analysis.
        </p>

        {/* Clear Form Button (Top) */}
        <div className="w-full flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-3 bg-red-600 w-auto my-5 mx-auto text-white rounded-xl shadow-2xl font-semibold text-lg hover:bg-red-700 transition-colors cursor-pointer"
            onClick={handleOnClear}
          >
            Clear Form
          </motion.button>
        </div>
      </div>

      {/* Screening Form */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8 border border-gray-200">
        <AuditAIFilters
          category={category}
          categoryOptions={categoryOptions}
          setCategory={setCategory}
          subCategory={subCategory}
          subCategoryOptions={subCategoryOptions}
          setSubCategory={setSubCategory}
          auditor={auditor}
          auditorOptions={auditorOptions}
          setAuditor={setAuditor}
        />
        <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-600 rounded-full">
          <WholeWord className="w-5 h-5 text-blue-700" />
          {loading ? (
            <>
              <span className="text-sm font-semibold text-indigo-900 animate-pulse">
                <Loader />
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-indigo-900">
                {totalResults ?? 0}{" "}
                {totalResults === 1 ? "Response" : "Responses"} Found
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-4 w-full">
          <div className="w-[60%]">
            <Input
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              type="text"
              placeholder="Search by question, or response..."
              value={searchValue ?? ""}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 mb-4">
            {globalFilter && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-sm"
              >
                {table.getFilteredRowModel().rows.length}{" "}
                {table.getFilteredRowModel().rows.length === 1
                  ? "result"
                  : "results"}
              </motion.span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => {
              navigate("/auditai-analysis");
              window.scrollTo(0, 0);
            }}
            className="px-5 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition text-sm font-semibold whitespace-nowrap border border-gray-300 text-white bg-indigo-600 "
          >
            Run AI Analysis
          </button>
          <button
            onClick={table.getToggleAllRowsSelectedHandler()}
            disabled={table.getFilteredRowModel().rows.length === 0 || loading}
            className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border border-gray-300 text-white bg-indigo-600 transition ${
              table.getFilteredRowModel().rows.length === 0 || loading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-indigo-700"
            }`}
          >
            {table.getIsAllRowsSelected() ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloadDisabled}
            className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap border border-gray-300 text-white bg-blue-600 transition ${isDownloadDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-blue-700"}`}
          >
            Download Selected {selectedRows.length}{" "}
            {selectedRows.length === 1 ? "Entry" : "Entries"}
          </button>
        </div>
      </div>
      <div className="inline-flex items-center text-sm font-medium text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-200 leading-snug">
        <span>
          You can search for multiple values for a question or response,
          separated by commas.
        </span>
      </div>
      {/* Results Table */}
      <AuditAITable table={table} loading={loading} searchTerm={globalFilter} />
      <div className="mt-4 rounded-xl bg-white/80 border border-gray-200 shadow-sm p-4 lg:p-5">
        <div className="flex flex-col justify-center items-center lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="text-sm text-gray-700">
            <span className="font-semibold text-indigo-700">Showing</span>{" "}
            {table.getRowModel().rows.length} of {table.getRowCount()} results
          </div>
          {/* <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 rounded-lg text-sm font-medium border bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div> */}
        </div>
      </div>
      <AuditAIQuery
        isDownloadDisabled={isDownloadDisabled}
        onCancel={handleDownload}
        selectedData={table
          .getSelectedRowModel()
          .rows.map((row) => row.original)}
      />
    </div>
  );
};

export default AuditAiScreening;
