import React from 'react';

const SummaryCard = ({ title, subtitle, count, icon, cardBgColor, iconBgColor }) => {
  return (
    <div className={`rounded-2xl shadow-md p-6 ${cardBgColor}`}>
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className={`w-14 h-12 rounded-lg flex items-center justify-center ${iconBgColor}`}>
          {/* Your Icon/Image component goes here. 
            For example: <img src={iconUrl} alt={title} />
            Or an SVG icon component.
          */}
          <img src={icon} alt="" className=' w-auto ' />
        </div>
        
     
        
        {/* Text Content */}
        <div className='flex flex-col gap-1 mt-2'>
          <h1  className="text-xl font-bold">{title}</h1>
          <p className="text-md font-semibold text-gray-700 mb-2">{subtitle}</p>
          <p className="text-4xl font-bold text-gray-800">{count}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;