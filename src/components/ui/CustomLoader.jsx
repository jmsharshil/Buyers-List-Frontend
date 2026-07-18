// CustomLoader.jsx
import React from "react";
import "./CustomLoader.css";

const CustomLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="textWrapper relative">
        <p className="text">Analyzing Your data...</p>
        <div className="invertbox"></div>
      </div>
    </div>
  );
};

export default CustomLoader;
