import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TimeLockNFTStakingABI from "../abis/LockNft_abi.json";
import { toast } from "react-toastify";
import Deposit from "./interaction/Deposit";
import UpdateROI from "./interaction/UpdateROI";
import Redeem from "./interaction/Redeem";
import UserDeposits from "./interaction/Userdeposits";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;

const StakingContent = () => {
  const [usdtAddress, setUsdtAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [txStatus, setTxStatus] = useState({
    status: "", // 'pending', 'confirming', 'success', 'error'
    message: "",
    hash: "",
  });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isUpdateROIModalOpen, setIsUpdateROIModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  // Initialize ethers provider and contract
  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);

          // Create provider and signer
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          const signer = provider.getSigner();
          setSigner(signer);

          // Create contract instance
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            TimeLockNFTStakingABI,
            signer
          );
          setContract(contract);

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            setAccount(accounts[0]);
          });

          // Listen for chain changes
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });

          const address = await signer.getAddress();
          console.log(address);
          setUserAddress(address);
        } catch (error) {
          console.error("Error initializing ethers:", error);
          toast.error("Failed to connect to wallet");
        }
      } else {
        toast.error("Please install MetaMask!");
      }
    };

    initEthers();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Handle setting USDT address
  const handleSetUSDT = async () => {
    if (!account) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!usdtAddress || !/^(0x)?[0-9a-fA-F]{40}$/.test(usdtAddress)) {
      toast.error("Please enter a valid USDT address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setTxStatus({
        status: "pending",
        message: "Preparing transaction...",
        hash: "",
      });

      // Send transaction
      const tx = await contract.setUSDT(usdtAddress);
      setTxStatus({
        status: "confirming",
        message: "Transaction submitted! Waiting for confirmation...",
        hash: tx.hash,
      });

      // Show transaction hash in toast
      toast.info(
        <div>
          <p>Transaction submitted!</p>
          <a
            href={`https://etherscan.io/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            View on Etherscan
          </a>
        </div>
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setTxStatus({
          status: "success",
          message: "USDT address set successfully!",
          hash: tx.hash,
        });
        toast.success("USDT address set successfully!");
        setUsdtAddress("");
      } else {
        setTxStatus({
          status: "error",
          message: "Transaction failed!",
          hash: tx.hash,
        });
        toast.error("Transaction failed!");
      }
    } catch (err) {
      console.error("Error setting USDT address:", err);

      // Handle specific error cases
      let errorMessage = "Failed to set USDT address";
      if (err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err.code === -32603) {
        errorMessage =
          "Transaction failed: Insufficient gas or invalid parameters";
      } else if (err.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      }

      setTxStatus({
        status: "error",
        message: errorMessage,
        hash: err.transaction?.hash || "",
      });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status icon based on transaction status
  const getStatusIcon = () => {
    switch (txStatus.status) {
      case "pending":
        return (
          <div className="w-4 h-4 mr-2 animate-spin">
            <img src="spinner.png" alt="Spinner" className="w-full h-full" />
          </div>
        );
      case "confirming":
        return (
          <div className="w-4 h-4 mr-2 animate-spin">
            <img src="spinner.png" alt="Spinner" className="w-full h-full" />
          </div>
        );
      case "success":
        return (
          <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        );
      case "error":
        return (
          <div className="w-4 h-4 mr-2 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✗</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Get status color based on transaction status
  const getStatusColor = () => {
    switch (txStatus.status) {
      case "pending":
      case "confirming":
        return "text-blue-400";
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Staking Banner */}
      <div className="bg-gradient-animation bg-[length:400%_400%] animate-gradient rounded-lg p-4 sm:p-[15px_30px] mb-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left space-y-4 sm:space-y-0">
        <h1 className="text-white text-sm sm:text-[13px] font-medium leading-tight">
          Earn USDT by staking $OS
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="p-[10px_20px] text-[12px] hover:bg-purple-700 text-white rounded font-medium transition-colors w-full sm:w-auto"
          >
            DEPOSIT
          </button>
          <button
            onClick={() => setIsUpdateROIModalOpen(true)}
            className="p-[10px_20px] text-[12px] hover:bg-purple-700 text-white rounded font-medium transition-colors w-full sm:w-auto"
          >
            UPDATE ROI
          </button>
          <button
            onClick={() => setIsRedeemModalOpen(true)}
            className="p-[10px_20px] text-[12px] hover:bg-purple-700 text-white rounded font-medium transition-colors w-full sm:w-auto"
          >
            REDEEM
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
            TVL
          </h3>
          <div className="text-white text-2xl font-bold">$0</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
            REWARDS CLAIMED
          </h3>
          <div className="text-white text-2xl font-bold">0.00</div>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
            REWARDS ASSIGNED TO STAKERS
          </h3>
          <div className="text-white text-2xl font-bold">0.00</div>
        </div>
      </div>

      {/* Set USDT Address Section */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">
          SET USDT ADDRESS (Owner Only)
        </h3>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Enter USDT contract address (0x...)"
            value={usdtAddress}
            onChange={(e) => setUsdtAddress(e.target.value)}
            className="bg-gray-950 border border-gray-700 text-white text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
            disabled={isSubmitting || !account}
          />
          <button
            onClick={handleSetUSDT}
            disabled={isSubmitting || !account || !usdtAddress}
            className={`p-[10px_20px] text-[12px] font-medium rounded transition-all ${
              isSubmitting || !account || !usdtAddress
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900"
            }`}
          >
            {isSubmitting ? "Processing..." : "SET USDT ADDRESS"}
          </button>
        </div>
        {/* Transaction Status */}
        {txStatus.status && (
          <div className={`mt-4 ${getStatusColor()} text-sm flex items-center`}>
            {getStatusIcon()}
            <div className="flex flex-col">
              <span>{txStatus.message}</span>
              {txStatus.hash && (
                <a
                  href={`https://etherscan.io/tx/${txStatus.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs mt-1"
                >
                  View on Etherscan
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {/* <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 animate-spin">
          <img
            src="spinner.png"
            alt="Outer Spinner"
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-2 animate-spin-reverse">
          <img
            src="spinner.png"
            alt="Inner Spinner"
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-4 animate-spin">
          <img
            src="spinner.png"
            alt="Inner Spinner"
            className="w-full h-full"
          />
        </div>
      </div> */}

      {/* User Deposits Section */}
      {userAddress ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Deposits
          </h2>
          <UserDeposits address={userAddress} />
        </div>
      ) : (
        <div className="text-center text-gray-400 p-8 bg-black/40 rounded-xl border border-gray-800">
          Connect your wallet to view your deposits.
        </div>
      )}

      {/* Modals */}
      <Deposit
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
      <UpdateROI
        isOpen={isUpdateROIModalOpen}
        onClose={() => setIsUpdateROIModalOpen(false)}
      />
      <Redeem
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
      />
    </div>
  );
};

export default StakingContent;
