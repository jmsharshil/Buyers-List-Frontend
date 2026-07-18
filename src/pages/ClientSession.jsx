import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { createClientSession, fetchClientNames } from "../store/slice/userAnalyticsSLice";
import Dropdown from "../components/ScreeningForm/Dropdown";

const ClientSession = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const { clientNames } = useSelector((state) => state.userAnalytics);
  const clientsList = clientNames?.clients || [];
  const clientNameOptions = clientsList.map((client) => client.name);

  useEffect(() => {
    // If they already have a session, redirect to services
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      navigate("/services");
    } else {
      dispatch(fetchClientNames());
    }
  }, [navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !projectName) return;
    setLoading(true);
    try {
      const payload = { client_name: clientName, project_name: projectName };
      const res = await dispatch(createClientSession(payload));
      if (createClientSession.fulfilled.match(res)) {
        if (res.payload.session_id) localStorage.setItem("session_id", res.payload.session_id);
        if (res.payload.client_name) localStorage.setItem("clientName", res.payload.client_name);
        if (res.payload.project_name) localStorage.setItem("projectName", res.payload.project_name);
        navigate("/services");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      <Motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Client Session</h2>
          <p className="text-gray-500 mb-6 text-sm">Please enter the client and project details to start a new session.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Dropdown
              label={<span className="block text-sm font-semibold text-gray-700 mb-1.5">Client Name</span>}
              options={["Select a Client...", ...clientNameOptions]}
              value={clientName}
              onChange={setClientName}
              searchable={true}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-900 placeholder:text-gray-400 font-medium"
                placeholder="e.g. Q1 Audit"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !clientName || !projectName}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Start Session"
              )}
            </button>
          </form>
        </div>
      </Motion.div>
    </div>
  );
};

export default ClientSession;
