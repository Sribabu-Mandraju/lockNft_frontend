import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TimeLockNFTStakingABI from "../abis/LockNft_abi.json";
import { useWallet } from "../context/WalletContext";
import { FaSpinner } from "react-icons/fa";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;
const API_URL = "https://lock-nft.onrender.com/market/owned-nfts";

const StakingContent = () => {
  const { account, signer } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    totalDeposits: "0",
    activeDeposits: "0",
    totalRewards: "0",
    roi3m: "0",
    roi6m: "0",
    roi12m: "0",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!account || !signer) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TimeLockNFTStakingABI,
          signer
        );

        // Fetch ROIs from contract
        const [roi3m, roi6m, roi12m] = await Promise.all([
          contract.roi3m(),
          contract.roi6m(),
          contract.roi12m(),
        ]);

        // Fetch deposits from API
        const response = await fetch(`${API_URL}?address=${account}`);
        const data = await response.json();

        let totalDeposits = ethers.parseUnits("0", 6);
        let activeDeposits = ethers.parseUnits("0", 6);
        let totalRewards = ethers.parseUnits("0", 6);

        // Process each deposit from API
        for (const nft of data.nfts) {
          const amount = ethers.parseUnits(nft.deposit.amount, 6);
          totalDeposits = totalDeposits + amount;

          // If deposit is still locked, add to active deposits
          if (nft.isLocked) {
            activeDeposits = activeDeposits + amount;
          }

          // Calculate rewards based on ROI
          const period = nft.deposit.periodMonths;
          let roi;
          if (period === 3) {
            roi = roi3m;
          } else if (period === 6) {
            roi = roi6m;
          } else {
            roi = roi12m;
          }

          const reward = (amount * roi) / 10000; // Convert basis points to percentage
          totalRewards = totalRewards + reward;
        }

        setUserData({
          totalDeposits: ethers.formatUnits(totalDeposits, 6),
          activeDeposits: ethers.formatUnits(activeDeposits, 6),
          totalRewards: ethers.formatUnits(totalRewards, 6),
          roi3m: (Number(roi3m) / 100).toString(),
          roi6m: (Number(roi6m) / 100).toString(),
          roi12m: (Number(roi12m) / 100).toString(),
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [account, signer]);

  if (!account) {
    return (
      <div className="text-center text-gray-400 p-8 bg-black/40 rounded-xl border border-gray-800">
        Please connect your wallet to view your staking information.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FaSpinner className="animate-spin text-2xl text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-gray-400 text-sm mb-2">Total Deposits</h3>
          <p className="text-2xl font-bold text-white">
            {userData.totalDeposits} USDC
          </p>
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-gray-400 text-sm mb-2">Active Deposits</h3>
          <p className="text-2xl font-bold text-white">
            {userData.activeDeposits} USDC
          </p>
        </div>
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
          <h3 className="text-gray-400 text-sm mb-2">Total Rewards</h3>
          <p className="text-2xl font-bold text-white">
            {userData.totalRewards} USDC
          </p>
        </div>
      </div>

      {/* Current ROIs */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-gray-400 text-sm mb-4">Current ROI Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-gray-400 text-sm mb-1">3 Months</h4>
            <p className="text-xl font-bold text-white">{userData.roi3m}%</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-gray-400 text-sm mb-1">6 Months</h4>
            <p className="text-xl font-bold text-white">{userData.roi6m}%</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="text-gray-400 text-sm mb-1">12 Months</h4>
            <p className="text-xl font-bold text-white">{userData.roi12m}%</p>
          </div>
        </div>
      </div>

      {/* Connected Wallet Info */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-gray-400 text-sm mb-2">Connected Wallet</h3>
        <p className="text-white font-mono">
          {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      </div>
    </div>
  );
};

export default StakingContent;
