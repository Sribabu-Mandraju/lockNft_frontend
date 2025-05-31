"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import LockNftAbi from "../../abis/LockNft_abi.json";
import USDCAbi from "../../abis/ierc20.json"; // Make sure to add your USDC ABI

// Contract addresses from environment variables
const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;
const USDC_CONTRACT_ADDRESS = import.meta.env.VITE_USDC;

function Deposit({ isOpen, onClose }) {
  const [amount, setAmount] = useState("");
  const [periodMonths, setPeriodMonths] = useState("3");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [txStatus, setTxStatus] = useState({
    status: "", // 'pending', 'approving', 'approved', 'depositing', 'completed', 'error'
    message: "",
    hash: "",
  });

  // Initialize ethers provider and contracts
  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccount(accounts[0]);

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          const signer = provider.getSigner();
          setSigner(signer);

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts) => {
            setAccount(accounts[0]);
          });

          // Listen for chain changes
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        } catch (error) {
          console.error("Error initializing ethers:", error);
          toast.error("Failed to connect to wallet");
        }
      } else {
        toast.error("Please install MetaMask!");
      }
    };

    initEthers();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // Start the approve and deposit flow
  const handleDepositFlow = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setIsProcessing(true);
      setCurrentStep("approving");
      setTxStatus({
        status: "approving",
        message: "Preparing approval transaction...",
        hash: "",
      });

      // Create contract instances
      const usdcContract = new ethers.Contract(
        USDC_CONTRACT_ADDRESS,
        USDCAbi,
        signer
      );
      const stakingContract = new ethers.Contract(
        STAKING_CONTRACT_ADDRESS,
        LockNftAbi,
        signer
      );

      const amountInWei = ethers.utils.parseUnits(amount, 6); // USDC has 6 decimals
      console.log("Starting approval for amount:", amountInWei.toString());

      // Start approval transaction
      const approveTx = await usdcContract.approve(
        STAKING_CONTRACT_ADDRESS,
        amountInWei
      );

      setTxStatus({
        status: "approving",
        message: "Approval transaction submitted. Waiting for confirmation...",
        hash: approveTx.hash,
      });

      // Show transaction hash in toast
      toast.info(
        <div>
          <p>Approval transaction submitted!</p>
          <a
            href={`https://etherscan.io/tx/${approveTx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            View on Etherscan
          </a>
        </div>
      );

      // Wait for approval confirmation
      const approveReceipt = await approveTx.wait();
      console.log("Approval confirmed! Starting deposit...");

      setTxStatus({
        status: "approved",
        message: "Approval confirmed! Preparing deposit...",
        hash: approveTx.hash,
      });

      toast.success("Approval confirmed! Starting deposit...");

      // Small delay to ensure the approval is fully processed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setTxStatus({
        status: "depositing",
        message: "Starting deposit transaction...",
        hash: "",
      });

      // Start deposit transaction
      const depositTx = await stakingContract.deposit(
        amountInWei,
        Number.parseInt(periodMonths)
      );

      setTxStatus({
        status: "depositing",
        message: "Deposit transaction submitted. Waiting for confirmation...",
        hash: depositTx.hash,
      });

      // Show transaction hash in toast
      toast.info(
        <div>
          <p>Deposit transaction submitted!</p>
          <a
            href={`https://etherscan.io/tx/${depositTx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            View on Etherscan
          </a>
        </div>
      );

      // Wait for deposit confirmation
      const depositReceipt = await depositTx.wait();
      console.log("Deposit confirmed!");

      setTxStatus({
        status: "completed",
        message: "Deposit completed successfully!",
        hash: depositTx.hash,
      });

      toast.success("Deposit successful!");

      // Reset form and close modal after success
      setTimeout(() => {
        resetState();
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Transaction error:", error);

      // Handle specific error cases
      let errorMessage = "Transaction failed";
      if (error.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (error.code === -32603) {
        errorMessage =
          "Transaction failed: Insufficient gas or invalid parameters";
      } else if (error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      }

      setTxStatus({
        status: "error",
        message: errorMessage,
        hash: error.transaction?.hash || "",
      });

      toast.error(errorMessage);
      resetState();
    }
  };

  // Reset all state
  const resetState = () => {
    setIsProcessing(false);
    setCurrentStep(null);
    setSuccessMessage(null);
    setTxStatus({
      status: "",
      message: "",
      hash: "",
    });
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setPeriodMonths("3");
      resetState();
    }
  }, [isOpen]);

  // Get status icon based on transaction status
  const getStatusIcon = () => {
    switch (txStatus.status) {
      case "approving":
      case "depositing":
        return (
          <div className="w-4 h-4 mr-2 animate-spin">
            <img src="spinner.png" alt="Spinner" className="w-full h-full" />
          </div>
        );
      case "approved":
        return (
          <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        );
      case "completed":
        return (
          <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        );
      case "error":
        return (
          <div className="w-4 h-4 mr-2 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Get status color based on transaction status
  const getStatusColor = () => {
    switch (txStatus.status) {
      case "approving":
      case "depositing":
        return "text-yellow-400";
      case "approved":
      case "completed":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-95">
        <h2 className="text-white text-xl font-bold mb-4">Deposit USDC</h2>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 block">
            Amount (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
            disabled={isProcessing}
          />
        </div>

        {/* Period Selection */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 block">
            Lock Period
          </label>
          <select
            value={periodMonths}
            onChange={(e) => setPeriodMonths(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
            disabled={isProcessing}
          >
            <option value="3">3 Months (5% ROI)</option>
            <option value="6">6 Months (10% ROI)</option>
            <option value="12">12 Months (20% ROI)</option>
          </select>
        </div>

        {/* Transaction Status */}
        {txStatus.status && (
          <div className={`mb-4 ${getStatusColor()} text-sm flex items-center`}>
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

        {/* Progress Steps */}
        {isProcessing && (
          <div className="mb-4 bg-gray-900 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>
                {txStatus.status === "approving" && "Step 1/2"}
                {txStatus.status === "approved" && "Step 1/2 Complete"}
                {txStatus.status === "depositing" && "Step 2/2"}
                {txStatus.status === "completed" && "Complete"}
              </span>
            </div>
            <div className="flex space-x-2">
              <div
                className={`flex-1 h-2 rounded ${
                  ["approved", "depositing", "completed"].includes(
                    txStatus.status
                  )
                    ? "bg-green-500"
                    : txStatus.status === "approving"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-gray-700"
                }`}
              ></div>
              <div
                className={`flex-1 h-2 rounded ${
                  txStatus.status === "completed"
                    ? "bg-green-500"
                    : txStatus.status === "depositing"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-gray-700"
                }`}
              ></div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleDepositFlow}
            disabled={isProcessing}
            className={`p-3 text-sm font-medium rounded bg-gradient-to-r from-green-600 to-green-800 text-white hover:from-green-700 hover:to-green-900 transition-colors ${
              isProcessing && "opacity-50 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {txStatus.message || "Processing..."}
              </span>
            ) : (
              "Start Deposit"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`p-3 text-sm font-medium rounded bg-transparent text-gray-400 hover:bg-gray-800 transition-colors ${
              isProcessing && "opacity-50 cursor-not-allowed"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Deposit;
