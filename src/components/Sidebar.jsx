import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'OVERVIEW', path: '/', active: location.pathname === '/' },
    { label: 'POOLS', path: '/pools', active: location.pathname === '/pools' },
    { label: 'REAL WORLD ASSETS', path: '/rwa', active: location.pathname === '/rwa' },
    { label: 'STAKING', path: '/staking', active: location.pathname === '/staking' },
    { label: 'OPERATING SYSTEM', path: '/os', active: location.pathname === '/os' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar(); // close after navigation on mobile
  };

  return (
    <aside className={`fixed top-0 left-0 min-h-screen my-16 lg:my-0 w-[300px] bg-black font-montserrat transform transition-transform duration-300 z-50 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block`}>
       
      <nav className="space-y-2 ">
         <div className='h-[70px] w-[87px] flex items-center justify-center mx-[40px]'>
          <img src="logo.png" alt="" className="h-[22px] w-[87px] " />
          </div>
        {menuItems.map((item) => (
          <div
            key={item.label}
            className={`flex justify-start px-8 items-center text-[12px] font-medium cursor-pointer transition-colors h-[60px] ${
              item.active
                ? 'bg-white text-black'
                : 'text-white hover:text-white hover:bg-gray-800/50 rounded'
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
