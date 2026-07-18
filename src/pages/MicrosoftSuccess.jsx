import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const MicrosoftSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const role = params.get("role");

    if (access && refresh) {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      if (role) {
        localStorage.setItem("user_role", role);
      }

      navigate("/client-session");
    } else {
      // Handle error, redirect to signin
      navigate("/");
    }
  }, [params, navigate]);

  return <p>Signing you in...</p>;
};

export default MicrosoftSuccess;
