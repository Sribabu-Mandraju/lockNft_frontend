import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import {
  FaLock,
  FaUnlock,
  FaClock,
  FaCoins,
  FaCalendarAlt,
  FaHourglassHalf,
  FaExternalLinkAlt,
} from "react-icons/fa";

const UserDeposits = ({ address }) => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://locknft.onrender.com/market/owned-nfts?address=${address}`
        );
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setDeposits(data.nfts);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch deposits");
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchDeposits();
    }
  }, [address]);

  const formatAmount = (amount) => {
    return ethers.utils.formatUnits(amount, 18);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px] bg-black/40 rounded-xl">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  //

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 sm:p-6 text-center">
        <div className="text-red-400 text-base sm:text-lg mb-2">Error</div>
        <div className="text-red-300 text-sm sm:text-base">{error}</div>
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div className="bg-black/40 border border-gray-800 rounded-xl p-6 sm:p-8 text-center">
        <div className="text-gray-400 text-base sm:text-lg mb-2">
          No Deposits Found
        </div>
        <div className="text-gray-500 text-sm">
          Start staking to see your deposits here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {deposits.map((nft) => {
          const tokenData = decodeTokenURI(nft.tokenURI);
          return (
            <div
              key={nft.tokenId}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <FaCoins className="text-purple-400 text-lg sm:text-xl" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    #{nft.tokenId}
                  </span>
                </div>
                <div
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                    nft.isLocked
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-green-500/10 text-green-400 border border-green-500/20"
                  }`}
                >
                  {nft.isLocked ? (
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
                    {formatAmount(nft.deposit.amount)} USDT
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400 flex items-center space-x-2 text-sm">
                    <FaHourglassHalf className="text-blue-500" />
                    <span>Period</span>
                  </span>
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {nft.deposit.periodMonths} months
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400 flex items-center space-x-2 text-sm">
                    <FaCalendarAlt className="text-green-500" />
                    <span>Start Date</span>
                  </span>
                  <span className="text-white text-sm sm:text-base">
                    {formatDate(nft.deposit.startTimestamp)}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg">
                  <span className="text-gray-400 flex items-center space-x-2 text-sm">
                    <FaCalendarAlt className="text-purple-500" />
                    <span>Unlock Date</span>
                  </span>
                  <span className="text-white text-sm sm:text-base">
                    {formatDate(nft.deposit.unlockTimestamp)}
                  </span>
                </div>

                {nft.isLocked && (
                  <div className="flex justify-between items-center bg-gray-900/50 p-2 sm:p-3 rounded-lg mt-2">
                    <span className="text-gray-400 flex items-center space-x-2 text-sm">
                      <FaClock className="text-blue-400" />
                      <span>Time Remaining</span>
                    </span>
                    <div className="flex items-center space-x-2 text-blue-400 font-medium text-sm sm:text-base">
                      <span>{formatTimeRemaining(nft.timeRemaining)}</span>
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
                      {nft.deposit.originalMinter.slice(0, 6)}...
                      {nft.deposit.originalMinter.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Token URI Link */}
                <a
                  href={nft.tokenURI}
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
