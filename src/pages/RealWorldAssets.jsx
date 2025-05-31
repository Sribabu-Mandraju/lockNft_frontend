import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RealWorldAssetsContent from '../components/RealWorldAssetsContent';

const RealWorldAssets = () => {
  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
       
      <div className="flex">
        <main className="flex-1">
          <RealWorldAssetsContent />
        </main>
      </div>
    </div>
  );
};

export default RealWorldAssets;