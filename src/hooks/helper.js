import { useNavigate } from "react-router-dom";

function useBack() {
  const navigate = useNavigate();
  return () => navigate(-1); // go back 1 step
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/signin"; // Redirect to login page
}

export { useBack, handleLogout };
