import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import UserDeposits from "./interaction/Userdeposits";
import Deposit from "./interaction/Deposit";
import Redeem from "./interaction/Redeem";
import UpdateROI from "./interaction/UpdateROI";
import { useWallet } from "../context/WalletContext";
import TimeLockNFTStakingABI from "../abis/LockNft_abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;

const StakingContent = () => {
  const { account, signer } = useWallet();
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isUpdateROIOpen, setIsUpdateROIOpen] = useState(false);
  const [contract, setContract] = useState(null);
  const [tvl, setTvl] = useState("0");
  const [rewardsClaimed, setRewardsClaimed] = useState("0");
  const [rewardsAssigned, setRewardsAssigned] = useState("0");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const initializeContract = async () => {
      if (!signer) return;

      try {
        const stakingContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          TimeLockNFTStakingABI,
          signer
        );
        setContract(stakingContract);

        // Check if current user is owner
        const owner = await stakingContract.owner();
        setIsOwner(owner.toLowerCase() === account?.toLowerCase());

        // Fetch TVL (Total Value Locked)
        const usdtAddress = await stakingContract.usdt();
        const usdtContract = new ethers.Contract(
          usdtAddress,
          ["function balanceOf(address) view returns (uint256)"],
          signer
        );
        const balance = await usdtContract.balanceOf(CONTRACT_ADDRESS);
        setTvl(ethers.formatEther(balance));

        // Fetch ROI values
        const [roi3m, roi6m, roi12m] = await Promise.all([
          stakingContract.roi3m(),
          stakingContract.roi6m(),
          stakingContract.roi12m(),
        ]);

        // Calculate total rewards assigned based on ROI values
        const totalRewards =
          (Number(roi3m) + Number(roi6m) + Number(roi12m)) / 100;
        setRewardsAssigned(totalRewards.toFixed(2));
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    initializeContract();
  }, [signer, account]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Staking Banner */}
      <div className="bg-gradient-animation bg-[length:400%_400%] animate-gradient rounded-lg p-4 sm:p-[15px_30px] mb-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left space-y-4 sm:space-y-0">
        <h1 className="text-white text-sm sm:text-[13px] font-medium leading-tight">
          Earn USDT by staking $OS
        </h1>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
            TVL
          </h3>
          <div className="text-white text-2xl font-bold">${tvl}</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
            REWARDS CLAIMED
          </h3>
          <div className="text-white text-2xl font-bold">{rewardsClaimed}</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
            REWARDS ASSIGNED TO STAKERS
          </h3>
          <div className="text-white text-2xl font-bold">
            {rewardsAssigned}%
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setIsDepositOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          Deposit
        </button>
        <button
          onClick={() => setIsRedeemOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
        >
          Redeem
        </button>
        {isOwner && (
          <button
            onClick={() => setIsUpdateROIOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Update ROI
          </button>
        )}
      </div>

      {/* User Deposits Section */}
      {account ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Deposits
          </h2>
          <UserDeposits />
        </div>
      ) : (
        <div className="text-center text-gray-400 p-8 bg-black/40 rounded-xl border border-gray-800">
          Connect your wallet to view your deposits.
        </div>
      )}

      {/* Modals */}
      <Deposit isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} />
      <Redeem isOpen={isRedeemOpen} onClose={() => setIsRedeemOpen(false)} />
      {isOwner && (
        <UpdateROI
          isOpen={isUpdateROIOpen}
          onClose={() => setIsUpdateROIOpen(false)}
        />
      )}
    </div>
  );
};

export default StakingContent;
