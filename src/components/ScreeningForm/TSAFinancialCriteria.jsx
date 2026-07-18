import React from "react";
import InputField from "./InputField";
import Dropdown from "./Dropdown";

const TSAFinancialCriteria = ({
  maClosedDateMin,
  setMaClosedDateMin,
  maClosedDateMax,
  setMaClosedDateMax,
  impliedEnterpriseValueUsdMin,
  setImpliedEnterpriseValueUsdMin,
  impliedEnterpriseValueUsdMax,
  setImpliedEnterpriseValueUsdMax,
  totalTransactionValueUsdMin,
  setTotalTransactionValueUsdMin,
  totalTransactionValueUsdMax,
  setTotalTransactionValueUsdMax,
  percentSoughtMin,
  setPercentSoughtMin,
  percentSoughtMax,
  setPercentSoughtMax,
  impliedEvRevenueMin,
  setImpliedEvRevenueMin,
  impliedEvRevenueMax,
  setImpliedEvRevenueMax,
  impliedEvEbitdaMin,
  setImpliedEvEbitdaMin,
  impliedEvEbitdaMax,
  setImpliedEvEbitdaMax,
  accountingMethod,
  setAccountingMethod,
}) => {
  return (
    <div className="mt-4">
      <div className="bg-green-50 rounded-xl p-6 border-2 border-green-600">
        <h3 className="text-2xl text-gray-900 font-bold mb-2">
          Financial Criteria
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Set financial parameters for transaction screening
        </p>

        {/* M&A Closed Date */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            M&A Closed Date
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="From :"
              type="date"
              value={maClosedDateMin}
              onChange={(e) => setMaClosedDateMin(e.target.value)}
            />
            <InputField
              label="To :"
              type="date"
              value={maClosedDateMax}
              onChange={(e) => setMaClosedDateMax(e.target.value)}
            />
          </div>
        </div>

        {/* Implied Enterprise Value ($USDmm, Historical rate) */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Implied Enterprise Value ($USDmm, Historical rate)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min :"
              placeholder="0"
              value={impliedEnterpriseValueUsdMin}
              onChange={(e) =>
                setImpliedEnterpriseValueUsdMin(e.target.value)
              }
            />
            <InputField
              label="Max :"
              placeholder="50000"
              value={impliedEnterpriseValueUsdMax}
              onChange={(e) =>
                setImpliedEnterpriseValueUsdMax(e.target.value)
              }
            />
          </div>
        </div>

        {/* Total Transaction Value ($USDmm, Historical rate) */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Total Transaction Value ($USDmm, Historical rate)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min :"
              placeholder="0"
              value={totalTransactionValueUsdMin}
              onChange={(e) =>
                setTotalTransactionValueUsdMin(e.target.value)
              }
            />
            <InputField
              label="Max :"
              placeholder="50000"
              value={totalTransactionValueUsdMax}
              onChange={(e) =>
                setTotalTransactionValueUsdMax(e.target.value)
              }
            />
          </div>
        </div>

        {/* Percent Sought (%) */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Percent Sought (%)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min :"
              placeholder="0"
              value={percentSoughtMin}
              onChange={(e) => setPercentSoughtMin(e.target.value)}
            />
            <InputField
              label="Max :"
              placeholder="100"
              value={percentSoughtMax}
              onChange={(e) => setPercentSoughtMax(e.target.value)}
            />
          </div>
        </div>

        {/* Implied Enterprise Value/Revenues (x) */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Implied Enterprise Value/Revenues (x)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min (Multiple) :"
              placeholder="0.1x"
              value={impliedEvRevenueMin}
              onChange={(e) => setImpliedEvRevenueMin(e.target.value)}
            />
            <InputField
              label="Max (Multiple) :"
              placeholder="25x"
              value={impliedEvRevenueMax}
              onChange={(e) => setImpliedEvRevenueMax(e.target.value)}
            />
          </div>
        </div>

        {/* Implied Enterprise Value/EBITDA (x) */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Implied Enterprise Value/EBITDA (x)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Min (Multiple) :"
              placeholder="0.5x"
              value={impliedEvEbitdaMin}
              onChange={(e) => setImpliedEvEbitdaMin(e.target.value)}
            />
            <InputField
              label="Max (Multiple) :"
              placeholder="50x"
              value={impliedEvEbitdaMax}
              onChange={(e) => setImpliedEvEbitdaMax(e.target.value)}
            />
          </div>
        </div>

        {/* Accounting Method */}
        <div className="mb-4">
          <div className="relative">
            <Dropdown 
              label="Accounting Method"
              value={accountingMethod}
              onChange={(val) => setAccountingMethod(val)}
              options={[
                "Select Accounting Method",
                "Acquisition",
                "Purchase",
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TSAFinancialCriteria;
