import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import Dropdown from "./Dropdown";
import { fetchIndustries, fetchSectors } from "../../store/slice/databaseOverviewSlice";

const PrimarySelection = ({
  primarySectors,
  setPrimarySectors,
  primaryIndustries,
  setPrimaryIndustries,
  category='gpc',
}) => {
  const dispatch = useDispatch();
  const { sectors, industries, loading, error } = useSelector(
    (state) => state.databaseOverview
  );

  const { tsaSummary } = useSelector(
    (state) => state.tsaDashboard
  );

  const tsaIndustries = tsaSummary?.industries?.map((item) => item.name) || [];


  useEffect(() => {
    // Only fetch if not already initialized
    if (!sectors?.sectors?.length && category === 'gpc') {
      dispatch(fetchSectors());
    }
    if (!industries?.industries?.length && category === 'gpc') {
      dispatch(fetchIndustries());
    }
  }, [dispatch, sectors?.sectors?.length, industries?.industries?.length]);

  const sectorOptions = sectors?.sectors?.length
    ? ["Select Primary Sector", ...sectors.sectors.map((s) => s.name)]
    : ["Loading sectors..."];
  const industryOptions = industries?.industries?.length
    ? ["Select Primary Industry", ...industries.industries.map((i) => i.name)]
    : ["Loading industries..."];

  if (loading) return <div>Loading sectors & industries...</div>;
  if (error) return <div>Error: {error}</div>;

  const addSector = () => {
    if (primarySectors.length < 5) {
      setPrimarySectors([...primarySectors, ""]);
    }
  };

  const removeSector = (index) => {
    if (primarySectors.length > 1) {
      const updated = primarySectors.filter((_, i) => i !== index);
      setPrimarySectors(updated);
    }
  };

  const updateSector = (index, value) => {
    const updated = [...primarySectors];
    updated[index] = value;
    setPrimarySectors(updated);
  };

  const addIndustry = () => {
    if (primaryIndustries.length < 5) {
      setPrimaryIndustries([...primaryIndustries, ""]);
    }
  };

  const removeIndustry = (index) => {
    if (primaryIndustries.length > 1) {
      const updated = primaryIndustries.filter((_, i) => i !== index);
      setPrimaryIndustries(updated);
    }
  };

  const updateIndustry = (index, value) => {
    const updated = [...primaryIndustries];
    updated[index] = value;
    setPrimaryIndustries(updated);
  };

  return (
    <div className="col-span-1 md:col-span-2">
      <h3 className="text-2xl text-gray-900 font-bold mb-4">Primary Selection</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {category === 'gpc' &&  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-600">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Primary Sectors</h4>
            {primarySectors.map((sector, index) => (
              <div key={index} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector {index + 1}
                </label>
                <Dropdown
                  options={sectorOptions}
                  value={sector || sectorOptions[0]}
                  onChange={(value) => updateSector(index, value)}
                  compact={false}
                />
                {primarySectors.length > 1 && (
                  <button
                    onClick={() => removeSector(index)}
                    className="absolute top-0 right-0 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove sector"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <div className="mt-4">
              <button
                onClick={addSector}
                disabled={primarySectors.length >= 5}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg shadow transition ${
                  primarySectors.length >= 5
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add More Sector
              </button>
              {primarySectors.length >= 5 && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Maximum 5 sectors allowed
                </p>
              )}
            </div>
          </div>
        </div>}

        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-600">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Primary Industries</h4>
            {primaryIndustries.map((industry, index) => (
              <div key={index} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry {index + 1}
                </label>
                <Dropdown
                  options={category === "tsa" ? tsaIndustries : industryOptions}
                  value={industry || (category === "tsa" ? "Select Primary Industry" : industryOptions[0])}
                  onChange={(value) => updateIndustry(index, value)}
                  searchable
                />
                {primaryIndustries.length > 1 && (
                  <button
                    onClick={() => removeIndustry(index)}
                    className="absolute top-0 right-0 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove industry"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <div className="mt-4">
              <button
                onClick={addIndustry}
                disabled={primaryIndustries.length >= 5}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg shadow transition ${
                  primaryIndustries.length >= 5
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                <Plus className="w-4 h-4" />
                Add More Industry
              </button>
              {primaryIndustries.length >= 5 && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Maximum 5 industries allowed
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimarySelection;
