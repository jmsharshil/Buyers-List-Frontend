// router.jsx
import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import CustomLoader from "../components/ui/CustomLoader";

import AskAIInterface from "../pages/AskAIInterface";
import ArticleInterface from "../pages/ArticleInterface";
import AskValuationGuide from "../pages/AskValuationGuide";
import NewValuationChat from "../pages/NewValuationChat";
import UserAnalytics from "../pages/UserAnalytics";
import ErrorPage from "../pages/ErrorPage";

// Lazy load all pages
const SignIn = lazy(() => import("../pages/SignIn"));
const DatabaseOverview = lazy(() => import("../pages/DatabaseOverview"));
const ScreeningCriteria = lazy(() => import("../pages/ScreeningCriteria"));
const ScreeningResults = lazy(() => import("../pages/ScreeningResults"));
const UserList = lazy(() => import("../pages/UserList"));
const AddUser = lazy(() => import("../components/users/AddUser"));
const MicrosoftCallback = lazy(() => import("../pages/MicrosoftCallback"));
const MicrosoftSuccess = lazy(() => import("../pages/MicrosoftSuccess"));
const ClientSession = lazy(() => import("../pages/ClientSession"));
const ServicesPage = lazy(() => import("../pages/Services"));
const TSADashboardPage = lazy(() => import("../pages/TSADashboard"));
const AuditAiDashboardPage = lazy(() => import("../pages/AuditAiDashboard"));
const TSAScreeningPage = lazy(() => import("../pages/TSAScreening"));
const TSAResultsPage = lazy(() => import("../pages/TSAResults"));
const AuditAiScreeningPage = lazy(() => import("../pages/AuditAiScreening"));
const AuditAIAnalysisPage = lazy(() => import("../pages/AuditAIAnalysis"));
const ArticleAIExtract = lazy(() => import("../pages/ArticleAIExtract"));
const ArticleAIExtractResults = lazy(() => import("../pages/ArticleAIExtractResults"));
// const ErrorPage = lazy(() => import("../pages/ErrorPage"));

// Wrap all route elements in Suspense
const withSuspense = (element) => (
  <Suspense fallback={<CustomLoader />}>{element}</Suspense>
);

// GPC Automation
// Ask AI
// Transactions Screening Automation
// Audit AI

// Create the router
const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<SignIn />),
  },
  {
    path: "/services",
    element: withSuspense(
      <Layout>
        <ServicesPage />
      </Layout>,
    ),
  },
  {
    path: "/client-session",
    element: withSuspense(<ClientSession />),
  },
  {
    path: "/buyerslist-dashboard",
    element: withSuspense(
      <Layout>
        <DatabaseOverview />
      </Layout>,
    ),
  },
  {
    path: "/tsa-dashboard",
    element: withSuspense(
      <Layout>
        <TSADashboardPage />
      </Layout>,
    ),
  },
  {
    path: "/tsa-screening",
    element: withSuspense(
      <Layout>
        <TSAScreeningPage />
      </Layout>,
    ),
  },
  {
    path: "/tsa-results",
    element: withSuspense(
      <Layout>
        <TSAResultsPage />
      </Layout>,
    ),
  },
  {
    path: "/auditai-dashboard",
    element: withSuspense(
      <Layout>
        <AuditAiDashboardPage />
      </Layout>,
    ),
  },
  {
    path: "/auditai-screening",
    element: withSuspense(
      <Layout>
        <AuditAiScreeningPage />
      </Layout>,
    ),
  },
  {
    path: "/auditai-analysis",
    element: withSuspense(
      <Layout>
        <AuditAIAnalysisPage />
      </Layout>,
    ),
  },
  {
    path: "/buyerslist-screening",
    element: withSuspense(
      <Layout>
        <ScreeningCriteria />
      </Layout>,
    ),
  },
  {
    path: "/buyerslist-results",
    element: withSuspense(
      <Layout>
        <ScreeningResults />
      </Layout>,
    ),
  },
  {
    path: "/users",
    element: withSuspense(
      <Layout>
        <UserList />
      </Layout>,
    ),
  },
  {
    path: "/add-user",
    element: withSuspense(
      <Layout>
        <AddUser />
      </Layout>,
    ),
  },
  {
    path: "/ask-ai",
    element: withSuspense(
      <Layout>
        <AskAIInterface />
      </Layout>,
    ),
  },
  {
    path: "/ask-ai-test",
    element: withSuspense(
      <Layout>
        <ArticleInterface />
      </Layout>,
    ),
  },
  {
    path: "/ask-valuation-chats",
    element: withSuspense(
      <Layout>
        <AskValuationGuide />
      </Layout>,
    ),
  },
  {
    path: "/article-ai",
    element: withSuspense(
      <Layout>
        <ArticleAIExtract />
      </Layout>,
    ),
  },
  {
    path: "/article-ai-chats",
    element: withSuspense(
      <Layout>
        <ArticleAIExtractResults />
      </Layout>,
    ),
  },
  {
    path: "/ask-valuation-guide",
    element: withSuspense(
      <Layout>
        <NewValuationChat />
      </Layout>,
    ),
  },
  {
    path: "/user-analytics",
    element: withSuspense(<UserAnalytics />),
  },
  {
    path: "/auth/microsoft/success",
    element: withSuspense(<MicrosoftSuccess />),
  },
  {
    path: "*",
    element: withSuspense(<ErrorPage />),
  },
]);

export default router;
