import React from 'react';
import { FiCopy } from "react-icons/fi";

const BuySection = () => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between mb-8 gap-3">
      <button className="w-[80px] px-4 py-2 border border-gray-600 text-white text-sm font-medium tracking-wider  hover:border-gray-500 transition-colors">
        BUY
      </button>
      <div className='tokens'>
{/* Right Section: TOKEN and PAIR */}
          <div className="flex flex-col md:flex-row gap-3 md:space-x-4">
            <div className="flex items-center space-x-2 text-[12px]">
              <span>TOKEN • 0X4AE...F7CD</span>
              <button className="text-gray-400 hover:text-white">
               <FiCopy />

              </button>
            </div>
            <div className="flex items-center space-x-2 text-[12px]">
              <span>PAIR • 0X148B...CD61</span>
              <button className="text-gray-400 hover:text-white">
                <FiCopy />

              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default BuySection;