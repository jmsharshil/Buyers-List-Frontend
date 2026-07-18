import React from "react";
import Dropdown from "../ScreeningForm/Dropdown";
import InfoTooltip from "../Layout/InfoTooltip";

const AuditAIFilters = ({
  category,
  categoryOptions,
  setCategory,
  subCategory,
  subCategoryOptions,
  setSubCategory,
  auditor,
  auditorOptions,
  setAuditor,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col gap-2 w-[30%]">
        <Dropdown
          label="Select Category"
          placeholder="Select Category"
          options={categoryOptions}
          value={category}
          onChange={(val) => {
            setCategory(val);
            setSubCategory([]); // Clear sub-category when category changes
          }}
          searchable
        />
      </div>
      <div className="flex flex-col gap-2 w-[30%]">
        <Dropdown
          label={
            <div className="flex items-center gap-2">
              Select Sub-Category
              <InfoTooltip message="You can select multiple sub-categories." />
            </div>
          }
          placeholder="Select Sub-Category"
          options={subCategoryOptions}
          value={subCategory}
          onChange={(val) => {
            setSubCategory(val);
          }}
          searchable
          multiselect
        />
      </div>
      <div className="flex flex-col gap-2 w-[30%]">
        <Dropdown
          label={
            <div className="flex items-center gap-2">
              Select Auditor
              <InfoTooltip message="You can select multiple auditors." />
            </div>
          }
          placeholder="Select Auditor"
          options={auditorOptions}
          value={auditor}
          onChange={(val) => {
            setAuditor(val);
          }}
          searchable
          multiselect
        />
      </div>
    </div>
  );
};

export default AuditAIFilters;
