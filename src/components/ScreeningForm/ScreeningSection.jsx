import React from "react";

/**
 * Generic container used inside the big outer card.
 * Keeps inner panels with pale background + rounded corners (matches screenshot).
 */
const ScreeningSection = ({ children }) => {
  return (
    <div className="mb-6">
      <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ScreeningSection;
