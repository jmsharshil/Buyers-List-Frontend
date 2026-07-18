import React, { useState } from "react";
import ScreeningSection from "./ScreeningSection";
import InputField from "./InputField";
import { useSelector } from "react-redux";

const FinancialCriteria = ({
  evRevenueMin,
  setEvRevenueMin,
  evRevenueMax,
  setEvRevenueMax,
  evEbitdaMin,
  setEvEbitdaMin,
  evEbitdaMax,
  setEvEbitdaMax,
  revenueMin,
  setRevenueMin,
  revenueMax,
  setRevenueMax,
  evMin,
  setEvMin,
  evMax,
  setEvMax,
  pricingDateMin,
  setPricingDateMin,
  pricingDateMax,
  setPricingDateMax,
}) => {
  const totalCount = useSelector(
    (state) => state.screeningCriteria.results?.count
  );

  return (
    <div className="mt-4">
      <div className="bg-green-50 rounded-xl p-6 border-2 border-green-600">
        <h3 className="text-2xl text-gray-900 font-bold mb-2">
          Financial Criteria
        </h3>
        {/* {totalCount !== undefined && (
          <p className="text-gray-700 text-sm mb-4">
            Total matched companies: {totalCount}
          </p>
        )} */}
         {/*ev revenuce*/}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            EV/Revenue [LTM] 
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min (Multiple) :"
              placeholder="0.1x"
              value={evRevenueMin}
              onChange={(e) => setEvRevenueMin(e.target.value)}
            />
            <InputField
              label="Max (Multiple) :"
              placeholder="25x"
              value={evRevenueMax}
              onChange={(e) => setEvRevenueMax(e.target.value)}
            />
          </div>
        </div>
        {/* EV/EBITDA*/}
                <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
             EV/EBITDA [LTM] 
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min:"
              placeholder="10"
              value={evEbitdaMin}
              onChange={(e) => setEvEbitdaMin(e.target.value)}
            />
            <InputField
              label="Max:"
              placeholder="500"
              value={evEbitdaMax}
              onChange={(e) => setEvEbitdaMax(e.target.value)}
            />
          </div>
        </div>
         {/*revenue*/}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">[LTM] Revenue ($USDmm)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min :"
              placeholder="50"
              value={revenueMin}
              onChange={(e) => setRevenueMin(e.target.value)}
            />
            <InputField
              label="Max :"
              placeholder="5000"
              value={revenueMax}
              onChange={(e) => setRevenueMax(e.target.value)}
            />
          </div>
        </div>
         {/*enterprise value*/}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Enterprise Value ($USDmm)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min :"
              placeholder="200"
              value={evMin}
              onChange={(e) => setEvMin(e.target.value)}
            />
            <InputField
              label="Max :"
              placeholder="15000"
              value={evMax}
              onChange={(e) => setEvMax(e.target.value)}
            />
          </div>
        </div>
        {/*Pricing Date*/ }
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Pricing Date</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="From :"
              type="date"
              value={pricingDateMin}
              onChange={(e) => {
                setPricingDateMin(e.target.value);
              }}
            />
            <InputField
              label="To :"
              type="date"
              value={pricingDateMax}
              onChange={(e) => {
                setPricingDateMax(e.target.value);
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinancialCriteria;
