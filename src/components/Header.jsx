// src/components/Header.jsx
import React, { useState, useRef } from "react";
import { IoMdMenu } from "react-icons/io";
import { useWallet } from "../context/WalletContext";

const Header = ({ toggleSidebar }) => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet();

  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to track if user has scrolled to the end of terms
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  // State to track if user has agreed to terms (after clicking "AGREE")
  const [hasAgreed, setHasAgreed] = useState(false);
  // Ref to the scrollable terms container
  const termsRef = useRef(null);

  // Function to truncate address (e.g., 0x1234...5678)
  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}....${addr.slice(-4)}`;
  };

  // Function to handle scroll event and check if user reached the end
  const handleScroll = () => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 5) {
        setIsScrolledToEnd(true);
      }
    }
  };

  // Function to handle "AGREE" button click
  const handleAgree = () => {
    if (isScrolledToEnd) {
      setHasAgreed(true);
    }
  };

  return (
    <div>
      {/* Header Component */}
      <header className="flex items-center justify-between p-6 bg-black font-montserrat">
        <div className="flex items-center md:px-[40px]">
          <div className="text-white text-xl font-bold tracking-wider">
            <img src="logo.png" alt="" className="h-[22px] w-[87px] hidden" />
            <button
              className="md:hidden text-white mr-2"
              onClick={toggleSidebar}
            >
              <span className="text-2xl">
                <IoMdMenu />
              </span>
            </button>
          </div>
        </div>
        {isConnected ? (
          <button
            className="px-[40px] py-2 bg-transparent text-white text-[12px] font-medium rounded hover:border-gray-500 transition-colors"
            onClick={disconnectWallet}
          >
            {truncateAddress(account)}
          </button>
        ) : (
          <button
            className="px-[40px] py-2 bg-transparent text-white text-[12px] font-medium rounded hover:border-gray-500 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            CONNECT
          </button>
        )}
      </header>

      {/* Modal for Terms and Conditions */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div
            className={`bg-gradient-to-br from-gray-900 to-black text-white p-[20px] rounded-sm max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl ${
              hasAgreed ? "" : "border border-gray-700"
            }`}
          >
            {/* Terms and Conditions (Hidden after agreeing) */}
            {!hasAgreed && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-100">
                  By using this website and the use of our website, nothing in
                  this disclaimer will:
                </h2>
                <div
                  ref={termsRef}
                  onScroll={handleScroll}
                  className="overflow-y-auto max-h-72 text-sm mb-4 border border-gray-800 p-4 rounded-lg bg-gray-950 shadow-inner"
                >
                  <p className="text-gray-300">
                    - limit or exclude the Service Provider's liability for
                    misrepresentation of the information presented on the
                    website;
                  </p>
                  <p className="text-gray-300">
                    - limit any of the Service Provider's liabilities in any way
                    that is not permitted under the applicable law;
                  </p>
                  <p className="text-gray-300">
                    Crypto Services carry a high level of knowledge and risk,
                    and can result in losses. The high level of risk means our
                    Crypto Services is not suitable for everyone. If you are in
                    any doubt, you should seek independent advice.
                  </p>
                  <p className="text-gray-300">
                    By submitting an application to request information or to
                    initiate a commercial relationship with us, you confirm:
                  </p>
                  <p className="text-gray-300">
                    - That you have read the Disclaimer and all the documents
                    supplied to you in connection with our Services and that you
                    fully agree to them;
                  </p>
                  <p className="text-gray-300">
                    - That you understand and agree that our relationship may be
                    amended from time to time, in which case you automatically
                    agree to such modifications;
                  </p>
                  <h3 className="font-bold mt-4 text-gray-100">
                    General provisions
                  </h3>
                  <p className="text-gray-300">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </p>
                </div>
              </div>
            )}

            {/* Wallet Selection (Visible only after agreeing) */}
            {hasAgreed && (
              <div className="grid grid-cols-3 gap-6 mb-4">
                <button
                  onClick={() => {
                    connectWallet("metamask");
                    setIsModalOpen(false);
                  }}
                  className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-2xl">🦊</span>
                  </div>
                  <span className="mt-3 text-sm font-medium text-gray-200">
                    METAMASK
                  </span>
                </button>
                <button
                  onClick={() => {
                    connectWallet("coinbase");
                    setIsModalOpen(false);
                  }}
                  className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-2xl">🔵</span>
                  </div>
                  <span className="mt-3 text-sm font-medium text-gray-200">
                    COINBASE
                  </span>
                </button>
                <button
                  onClick={() => {
                    // Implement WalletConnect logic here
                    alert("WalletConnect integration coming soon!");
                  }}
                  className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-2xl">🌐</span>
                  </div>
                  <span className="mt-3 text-sm font-medium text-gray-200">
                    WALLET CONNECT
                  </span>
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-transparent text-gray-400 text-sm font-medium rounded hover:bg-gray-800 transition-all"
              >
                CANCEL
              </button>
              {!hasAgreed && (
                <button
                  onClick={handleAgree}
                  className={`px-4 py-2 text-sm font-medium rounded transition-all ${
                    isScrolledToEnd
                      ? "bg-gradient-to-r from-green-600 to-green-800 text-white hover:from-green-700 hover:to-green-900"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isScrolledToEnd}
                >
                  AGREE
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
