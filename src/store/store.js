// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import databaseOverviewReducer from "./slice/databaseOverviewSlice";
import userProfileReducer from "./slice/userProfileSlice";
import screeningCriteriaReducer from "./slice/screeningCriteriaSlice";
import peerCompanyReducer from "./slice/peerCompanySlice";
import askAiReducer from "./slice/askAiSlice";
import signInReducer from "./slice/signInSlice";
import tsaDashboardReducer from "./slice/tsaDashboard.Slice";
import tsaScreeningCriteriaReducer from "./slice/tsaScreeningCriteriaSlice";
import auditAiDashboardReducer from "./slice/auditAiDashboardSlice";
import auditScreeningReducer from "./slice/auditScreeningSlice";
import auditAiAnalysisReducer from "./slice/auditAIAnalysisSlice";
import articleAiReducer from "./slice/articleAiSlice";
import userAnalyticsReducer from "./slice/userAnalyticsSlice";
import askValuationReducer from "./slice/askValuationGuideSlice";

const store = configureStore({
  reducer: {
    databaseOverview: databaseOverviewReducer,
    userProfile: userProfileReducer,
    screeningCriteria: screeningCriteriaReducer,
    peerCompany: peerCompanyReducer,
    askAi: askAiReducer,
    signIn: signInReducer,
    tsaDashboard: tsaDashboardReducer,
    tsaScreeningCriteria: tsaScreeningCriteriaReducer,
    auditAiDashboard: auditAiDashboardReducer,
    auditScreening: auditScreeningReducer,
    auditAiAnalysis: auditAiAnalysisReducer,
    articleAi: articleAiReducer,
    userAnalytics: userAnalyticsReducer,
    askValuation: askValuationReducer,
  },
});

export default store;
