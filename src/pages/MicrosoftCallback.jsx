import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const MicrosoftCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const userRole = params.get("user_role");

    if (access && refresh) {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      if (userRole) {
        localStorage.setItem("user_role", userRole);
      }

      navigate("/dashboard");
    }
  }, [params, navigate]);

  const handleSubmit = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (data.access_token && data.refresh_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        if (data.user && data.user.role) {
          localStorage.setItem("user_role", data.user.role);
        }
        navigate("/dashboard");
      } else {
        setError("Invalid JSON: missing access_token or refresh_token");
      }
    } catch {
      setError("Invalid JSON format");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Microsoft Login Callback</h1>
        <p className="text-gray-600 mb-4">
          If you were redirected here from the backend, paste the JSON response below:
        </p>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='Paste the JSON response here, e.g. {"access_token": "...", "refresh_token": "...", "user": {...}}'
          className="w-full p-4 border border-gray-300 rounded-xl mb-4"
          rows={10}
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full py-4 px-6 bg-[#4F46E5] text-white rounded-xl text-xl font-semibold shadow-xl"
        >
          Submit Tokens
        </button>
      </div>
    </div>
  );
};

export default MicrosoftCallback;
