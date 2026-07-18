import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFormData } from "../../store/slice/screeningCriteriaSlice";
import { updateTsaFormData } from "../../store/slice/tsaScreeningCriteriaSlice";
import debounce from "lodash/debounce";

const KeywordsCondition = ({ onUpdate, sectionKey = "keywords", category = "gpc" }) => {
  const dispatch = useDispatch();
  const { keywords = [], keyword_condition = [] } = useSelector(
    (state) =>
      category === "gpc"
        ? state.screeningCriteria.formData
        : state.tsaScreeningCriteria.formData
  );

  const [andKeywords, setAndKeywords] = useState("");
  const [orKeywords, setOrKeywords] = useState("");

  // ✅ Hydrate from Redux when coming back
  useEffect(() => {
    if (keywords.length && keyword_condition.length) {
      const andIndex = keyword_condition.findIndex((c) => c === "and");
      const orIndex = keyword_condition.findIndex((c) => c === "or");

      setAndKeywords(andIndex !== -1 ? keywords[andIndex] : "");
      setOrKeywords(orIndex !== -1 ? keywords[orIndex] : "");
    }
  }, [keywords, keyword_condition]);

  // ✅ Clear local state when Redux resets
  useEffect(() => {
    if (keywords.length === 0 && keyword_condition.length === 0) {
      setAndKeywords("");
      setOrKeywords("");
    }
  }, [keywords, keyword_condition]);

  const debouncedUpdate = useCallback(
    debounce((andKeywords, orKeywords) => {
      const newKeywords = [];
      const newConditions = [];

      if (andKeywords.trim()) {
        newKeywords.push(andKeywords.trim());
        newConditions.push("and");
      }
      if (orKeywords.trim()) {
        newKeywords.push(orKeywords.trim());
        newConditions.push("or");
      }

      // Update Redux
      dispatch(
        category === "gpc"
          ? updateFormData({ keywords: newKeywords, keyword_condition: newConditions })
          : updateTsaFormData({ keywords: newKeywords, keyword_condition: newConditions })
      );

      // Trigger parent update (counts)
      if (onUpdate) onUpdate(newKeywords, newConditions, sectionKey);
    }, 1000),
    [dispatch, category, onUpdate, sectionKey],
  );

  useEffect(() => {
    debouncedUpdate(andKeywords, orKeywords);
  }, [andKeywords, orKeywords, debouncedUpdate]);

  return (
    <div className="bg-blue-50 rounded-xl w-full p-6 border-2 border-blue-600">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Keywords Condition
      </h2>

      {/* AND Keywords */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AND Keywords (all must match, comma-separated)
        </label>
        <input
          type="text"
          value={andKeywords}
          onChange={(e) => setAndKeywords(e.target.value)}
          placeholder="e.g. water,2014"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        />
      </div>

      {/* OR Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OR Keywords (any may match, comma-separated)
        </label>
        <input
          type="text"
          value={orKeywords}
          onChange={(e) => setOrKeywords(e.target.value)}
          placeholder="e.g. pipe,motor"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
        />
      </div>
      <p className="text-sm mt-5 text-blue-600 mb-3 font-medium">
        💡 Tip : Press Enter to update form and see Counts.
      </p>

      {/* Preview */}
      {(andKeywords || orKeywords) && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
            🔍 Search Preview
          </h4>

          {/* <p className="text-sm text-blue-600 mb-3 font-medium">
            💡 Tip: Press{" "}
            <span className="font-semibold text-blue-700">Enter</span> to update
            and see results.
          </p> */}

          <div className="text-sm text-gray-700 space-y-1 font-mono bg-gray-50 p-3 rounded-md border border-gray-100">
            {andKeywords && (
              <div>
                keywords = {andKeywords} &nbsp;&nbsp; keyword_condition = and
              </div>
            )}
            {orKeywords && (
              <div>
                keywords = {orKeywords} &nbsp;&nbsp; keyword_condition = or
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordsCondition;
