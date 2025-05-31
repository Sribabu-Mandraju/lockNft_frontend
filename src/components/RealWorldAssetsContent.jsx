import React, { useState } from 'react';

const RealWorldAssetsContent = () => {
  const [activeTab, setActiveTab] = useState('POOLS');

  return (
    <div className="p-4 md:p-8 overflow-hidden">
      {/* CANNAVEST Hero Section */}
      <div className="bg-[#414726] rounded-lg p-4 md:p-8 text-center mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center">
            <img src="canlog.png" alt="Cannavest Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">CANNAVEST</h1>
        </div>
        <p className="text-green-200 text-sm sm:text-base font-medium mt-2">
          CANNAVEST REAL WORLD ASSET POOL NOW LIVE
        </p>
      </div>

      {/* Tabs Section */}
      <div className="mb-6">
        <div className="flex justify-start border-b border-gray-700">
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium ${
              activeTab === 'POOLS' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('POOLS')}
          >
            POOLS
          </button>
          <button
            className={`px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium ${
              activeTab === 'OTC' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('OTC')}
          >
            OTC
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex justify-center items-center min-h-[200px]">
        {activeTab === 'POOLS' ? (
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 animate-spin">
              <img src="spinner.png" alt="Outer Spinner" className="w-full h-full" />
            </div>
            <div className="absolute inset-2 animate-spin-reverse">
              <img src="spinner.png" alt="Inner Spinner" className="w-full h-full" />
            </div>
            <div className="absolute inset-4 animate-spin">
              <img src="spinner.png" alt="Inner Spinner" className="w-full h-full" />
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm sm:text-base">OTC content is coming soon...</p>
        )}
      </div>
    </div>
  );
};

export default RealWorldAssetsContent;
