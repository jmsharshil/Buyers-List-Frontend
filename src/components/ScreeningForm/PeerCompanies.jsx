import React, { useState, useEffect } from "react";
import ScreeningSection from "./ScreeningSection";
import InputField from "./InputField";
import { Plus, X } from "lucide-react";

const PeerCompanies = ({ formData, updateFormData, compareTxt }) => {
  const [peerAnalysis, setPeerAnalysis] = useState(
    formData.peerAnalysis || "Yes"
  );
  const [peerCompanies, setPeerCompanies] = useState(
    formData.peerCompanies && formData.peerCompanies.length
      ? formData.peerCompanies
      : [{ name: "", description: "" }]
  );

  // Sync local state to parent formData
  useEffect(() => {
    updateFormData({ peerCompanies, peerAnalysis });
  }, [peerCompanies, peerAnalysis]);

  const handlePeerAnalysisChange = (e) => {
    const val = e.target.value;
    setPeerAnalysis(val);
    if (val === "No") {
      setPeerCompanies([]);
    } else {
      if (peerCompanies.length === 0) {
        setPeerCompanies([{ name: "", description: "" }]);
      }
    }
  };

  const handle3fields = () => {
    console.log("compare_description" , formData.compare_description);
    console.log(peerCompanies)
  }

  const updatePeerCompany = (index, field, value) => {
    const updated = [...peerCompanies];
    updated[index][field] = value;
    setPeerCompanies(updated);
  };

  const addPeerCompany = () => {
    if (peerCompanies.length < 5) {
      setPeerCompanies([...peerCompanies, { name: "", description: "" }]);
    }
  };

  const removePeerCompany = (index) => {
    setPeerCompanies(peerCompanies.filter((_, idx) => idx !== index));
  };

  return (
    <ScreeningSection>
      <div className="col-span-1 md:col-span-2 relative">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl text-gray-900 font-bold">
              Peer Companies Analysis
            </h2>
            <p className="text-md font-semibold text-gray-700 mt-2">
              Add a few Private or Public Peer Companies Name and Business
              Description
            </p>
          </div>

          <div className="w-44">
            <select
              value={peerAnalysis}
              onChange={handlePeerAnalysisChange}
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {peerCompanies.map((peer, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative"
          >
            <InputField
              label={`Peer Company ${idx + 1} Legal Name`}
              placeholder={`Enter peer company ${idx + 1} name`}
              value={peer.name}
              onChange={(e) => updatePeerCompany(idx, "name", e.target.value)}
              disabled={peerAnalysis === "No"}
            />
            <InputField
              label={`Peer Company ${idx + 1} Business Description`}
              placeholder=""
              multiline
              rows={3}
              value={peer.description}
              onChange={(e) =>
                updatePeerCompany(idx, "description", e.target.value)
              }
              disabled={peerAnalysis === "No"}
            />
            <button onClick={handle3fields}>console</button>
            {peerCompanies.length > 1 && peerAnalysis === "Yes" && (
              <button
                onClick={() => removePeerCompany(idx)}
                className="absolute top-0 right-0 mt-2 mr-2 p-1 hover:bg-red-200 rounded-full"
                title="Remove Peer Company"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}

        {peerAnalysis === "Yes" && (
          <div className="mt-6 flex flex-col items-center">
            <button
              onClick={addPeerCompany}
              disabled={peerCompanies.length >= 5}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg shadow transition ${
                peerCompanies.length >= 5
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add More Peer Company</span>
            </button>
            {peerCompanies.length >= 5 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Maximum of 5 peer companies reached.
              </p>
            )}
          </div>
        )}
      </div>
    </ScreeningSection>
  );
};

export default PeerCompanies;
