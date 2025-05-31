import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import OperatingSystemContent from '../components/OperatingSystemContent';

const OperatingSystem = () => {
  return (
    <div className="relative min-h-screen bg-black text-white font-montserrat"> 
   
      <div className="flex">
        <main className="flex-1">
          <OperatingSystemContent />
        </main>
      </div>
    </div>
  );
};

export default OperatingSystem;