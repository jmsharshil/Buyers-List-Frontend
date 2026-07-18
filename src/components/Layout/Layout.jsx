import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import BottomNavBar from "./BottomNavbar";


const workflowMap = {
  "/gpc-dashboard": "GPC Screening",
  "/gpc-screening": "GPC Screening",
  "/gpc-results": "GPC Screening",
  "/tsa-dashboard": "Transaction Screening",
  "/tsa-screening": "Transaction Screening",
  "/tsa-results": "Transaction Screening",
  "/auditai-dashboard": "Audit AI",
  "/auditai-screening": "Audit AI",
  "/auditai-analysis": "Audit AI",
  "/ask-ai": "Ask AI",
  // "/ask-ai-test": "Article Interpretation AI",
  // "/ask-valuation-guide": "Ask Valuation Guide",
  // "/ask-valuation-chats": "Ask Valuation Guide"
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentWorkflow = workflowMap[location.pathname];

  useEffect(() => {
    if (!currentWorkflow) return;
    sessionStorage.setItem("active_workflow", currentWorkflow);
  }, [currentWorkflow]);
  // useEffect(() => {
  //   const token = localStorage.getItem("access_token");
  //   if (!token) {
  //     navigate("/");
  //   }
  // }, [navigate]);

  return (
    <>

      <main>{children}</main>

      {location.pathname !== "/services" &&
        location.pathname !== "/ask-ai" &&
        location.pathname !== "/ask-ai-test" &&
        location.pathname !== "/ask-valuation-guide" &&
        location.pathname !== "/ask-valuation-chats" &&
        location.pathname !== "/article-ai" &&
        location.pathname !== "/article-ai-chats" && (
          <BottomNavBar currentPath={location.pathname} onNavigate={navigate} />
        )}
    </>
  );
};

export default Layout;
