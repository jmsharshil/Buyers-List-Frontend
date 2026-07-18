import { useState, useCallback } from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/helper";

export const useFetchCount = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCount = useCallback(async (paramsObject) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      // Convert object keys to query params
      for (const key in paramsObject) {
        const value = paramsObject[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => v?.trim() && params.append(key, v));
          } else if (typeof value === "string" && value.trim() !== "") {
            params.append(key, value.trim());
          }
        }
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/api/companies/?${params.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setCount(response.data.count || 0);
    } catch (err) {
      console.error("Error fetching count:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { count, loading, error, fetchCount };
};
