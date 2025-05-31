import React from 'react';

const MetricCard = ({ title, value, hasInfo = false }) => {
  return (
    <div className="bg-[#080808]  rounded-lg p-[30px]">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-gray-400 text-[12px] font-medium uppercase tracking-wider">
          {title}
        </h3>
        {hasInfo && (
          <div className="w-4 h-4 border border-gray-600 rounded-full flex items-center justify-center text-gray-500 text-xs">
            ?
          </div>
        )}
      </div>
      <div className="text-white text-2xl font-bold">
        {value}
      </div>
    </div>
  );
};

export default MetricCard;
