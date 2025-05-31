import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useWallet } from "../../context/WalletContext";
import {
  FaLock,
  FaUnlock,
  FaClock,
  FaCoins,
  FaCalendarAlt,
  FaHourglassHalf,
  FaExternalLinkAlt,
} from "react-icons/fa";

const API_URL = "https://lock-nft.onrender.com/market/owned-nfts";

const UserDeposits = () => {
  const { account } = useWallet();
  const [deposits, setDeposits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user deposits from API
  useEffect(() => {
    const fetchDeposits = async () => {
      if (!account) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}?address=${account}`);
        const data = await response.json();

        const formattedDeposits = data.nfts.map((nft) => ({
          tokenId: nft.tokenId,
          amount: ethers.formatUnits(nft.deposit.amount, 6), // USDC has 6 decimals
          startTimestamp: Number(nft.deposit.startTimestamp),
          unlockTimestamp: Number(nft.deposit.unlockTimestamp),
          isLocked: nft.isLocked,
          periodMonths: nft.deposit.periodMonths,
          originalMinter: nft.deposit.originalMinter,
          tokenURI: nft.tokenURI,
          timeRemaining: Number(nft.timeRemaining),
        }));

        setDeposits(formattedDeposits);
      } catch (error) {
        console.error("Error fetching deposits:", error);
        toast.error("Failed to fetch deposits");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, [account]);

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeRemaining = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const decodeTokenURI = (uri) => {
    try {
      if (uri.startsWith("data:application/json;base64,")) {
        const base64 = uri.replace("data:application/json;base64,", "");
        const json = atob(base64);
        return JSON.parse(json);
      }
      return null;
    } catch (error) {
      console.error("Error decoding token URI:", error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div className="text-center text-gray-400 p-8 bg-black/40 rounded-xl border border-gray-800">
        No deposits found.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {deposits.map((deposit) => {
          const tokenData = decodeTokenURI(deposit.tokenURI);
          return (
            <div
              key={deposit.tokenId}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <FaCoins className="text-purple-400 text-lg sm:text-xl" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    #{deposit.tokenId}
                  </span>
                </div>
                <div
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                    deposit.isLocked
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-green-500/10 text-green-400 border border-green-500/20"
                  }`}
                >
                  {deposit.isLocked ? (
                    <div className="flex items-center space-x-2">
                      <FaLock className="text-xs sm:text-sm" />
                      <span>Locked</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FaUnlock className="text-xs sm:text-sm" />
                      <span>Ready to Redeem</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400 flex items-center space-x-2 text-sm">
                    <FaCoins className="text-yellow-500" />
                    <span>Amount</span>
                  </span>
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {deposit.amount} USDC
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400 flex items-center space-x-2 text-sm">
                    <FaHourglassHalf className="text-blue-500" />
                    <span>Period</span>
                  </span>
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {deposit.periodMonths} months
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400 flex items-center space-x-2 text-sm">
                    <FaCalendarAlt className="text-green-500" />
                    <span>Start Date</span>
                  </span>
                  <span className="text-white text-sm sm:text-base">
                    {formatDate(deposit.startTimestamp)}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400 flex items-center space-x-2 text-sm">
                    <FaCalendarAlt className="text-purple-500" />
                    <span>Unlock Date</span>
                  </span>
                  <span className="text-white text-sm sm:text-base">
                    {formatDate(deposit.unlockTimestamp)}
                  </span>
                </div>

                {deposit.isLocked && (
                  <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg mt-2">
                    <span className="text-gray-400 flex items-center space-x-2 text-sm">
                      <FaClock className="text-blue-400" />
                      <span>Time Remaining</span>
                    </span>
                    <div className="flex items-center space-x-2 text-blue-400 font-medium text-sm sm:text-base">
                      <span>{formatTimeRemaining(deposit.timeRemaining)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <div className="text-xs text-gray-500 bg-gray-900/30 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>Original Minter:</span>
                    <span className="text-gray-400">
                      {deposit.originalMinter.slice(0, 6)}...
                      {deposit.originalMinter.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Token URI Link */}
                <a
                  href={deposit.tokenURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 p-2 rounded-lg transition-colors duration-300 text-xs sm:text-sm"
                >
                  <FaExternalLinkAlt className="text-xs sm:text-sm" />
                  <span>View Token Details</span>
                </a>

                {/* Token Description */}
                {tokenData && (
                  <div className="text-xs text-gray-400 bg-gray-900/30 p-2 rounded-lg">
                    <p className="line-clamp-2">{tokenData.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDeposits;
