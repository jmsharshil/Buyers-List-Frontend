import React from "react";
import { useBack } from "../../hooks/helper";
import { IoMdArrowRoundBack } from "react-icons/io";
import UserProfile from "../Layout/UserProfile";

const ResultsHeader = ({ category = 'gpc'}) => {
  const goBack = useBack();
  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center cursor-pointer text-gray-700 hover:text-purple-600 transition-colors focus:outline-none"
        >
          <IoMdArrowRoundBack className="w-6 h-6 mr-2" />
          <span className="text-lg font-medium">Back</span>
        </button>
        <div className="flex items-center justify-between   py-4">
          {/* Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Live Data
            </span>
          </div>

          {/* User Profile */}
           <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">
              <UserProfile />
            </span>
          </div>
        </div>
      </div>
      <div className="text-center mb-8">
        <div className="inline-block px-5 py-2 mb-4 bg-indigo-600 text-white text-md font-semibold rounded-full">
          <span>Screening Complete</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {category === 'gpc' ? 'Company' : 'Transaction'} Screening Results{" "}
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Comprehensive analysis of companies matching your screening criteria
          with AI-powered insights and recommendations
        </p>
      </div>
    </div>
  );
};

export default ResultsHeader;
