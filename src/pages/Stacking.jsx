import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StakingContent from '../components/StackingContent';
const Staking = () => {
  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      
      <div className="flex">
        <main className="flex-1">
          <StakingContent />
        </main>
      </div>
    </div>
  );
};

export default Staking;
