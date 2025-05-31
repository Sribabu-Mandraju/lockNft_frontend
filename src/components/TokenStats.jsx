import React from 'react';

const TokenStats = () => {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium">TOKEN</span>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">0X45E</span>
          <button className="w-4 h-4 border border-gray-600 rounded text-gray-500 text-xs flex items-center justify-center">
            📋
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium">FTCD</span>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">E7CD</span>
          <button className="w-4 h-4 border border-gray-600 rounded text-gray-500 text-xs flex items-center justify-center">
            📋
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">PAIR</span>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">0X14B</span>
          <button className="w-4 h-4 border border-gray-600 rounded text-gray-500 text-xs flex items-center justify-center">
            📋
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenStats;