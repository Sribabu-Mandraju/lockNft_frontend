import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Pools from "./pages/Pools";
import RealWorldAssets from "./pages/RealWorldAssets";
import OperatingSystem from "./pages/OperatingSystem";
import Staking from "./pages/Stacking";
// import NotFound from "./pages/NotFound";
import Overview from "./pages/Overview";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ConnectWallet from "./components/ConnectButton";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <BrowserRouter>
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
          <div className="flex-1 flex flex-col">
            <Header toggleSidebar={toggleSidebar} />
            <main className="">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/connect" element={<ConnectWallet />} />
                <Route path="/pools" element={<Pools />} />
                <Route path="/rwa" element={<RealWorldAssets />} />
                <Route path="/staking" element={<Staking />} />
                <Route path="/os" element={<OperatingSystem />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
