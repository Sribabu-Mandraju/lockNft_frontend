"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import TimeLockNFTStakingABI from "../../abis/LockNft_abi.json";
import IERC20ABI from "../../abis/ierc20.json";
import { useWallet } from "../../context/WalletContext";
import { FaSpinner } from "react-icons/fa";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;
const USDT_ADDRESS = import.meta.env.VITE_USDC;

const Deposit = ({ isOpen, onClose }) => {
  const { account, signer } = useWallet();
  const [amount, setAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState({
    status: "",
    message: "",
    hash: "",
  });

  const handleDeposit = async () => {
    if (!account || !signer) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Convert amount to USDC decimals (6 decimals)
      const amountInWei = ethers.parseUnits(amount, 6);

      // Initialize contracts
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TimeLockNFTStakingABI,
        signer
      );
      const usdtContract = new ethers.Contract(USDT_ADDRESS, IERC20ABI, signer);

      // Check USDT balance
      const balance = await usdtContract.balanceOf(account);
      console.log("USDC Balance:", ethers.formatUnits(balance, 6));
      console.log("Amount to deposit:", ethers.formatUnits(amountInWei, 6));

      if (balance < amountInWei) {
        toast.error(
          "Insufficient USDC balance. Please check your balance and try again."
        );
        setIsSubmitting(false);
        return;
      }

      // Check current allowance
      const currentAllowance = await usdtContract.allowance(
        account,
        CONTRACT_ADDRESS
      );
      console.log(
        "Current allowance:",
        ethers.formatUnits(currentAllowance, 6)
      );

      // If current allowance is less than amount, we need to approve
      if (currentAllowance < amountInWei) {
        setTxStatus({
          status: "pending",
          message: "Approving USDC spending...",
          hash: "",
        });

        // First reset allowance to 0 to avoid any issues
        try {
          const resetTx = await usdtContract.approve(CONTRACT_ADDRESS, 0);
          await resetTx.wait();
          console.log("Reset allowance to 0");
        } catch (resetErr) {
          console.log(
            "Reset allowance failed, continuing with new approval:",
            resetErr
          );
        }

        // Then approve the new amount
        const approveTx = await usdtContract.approve(
          CONTRACT_ADDRESS,
          amountInWei
        );
        setTxStatus({
          status: "confirming",
          message:
            "Approval transaction submitted! Waiting for confirmation...",
          hash: approveTx.hash,
        });

        toast.info(
          <div>
            <p>Approval transaction submitted!</p>
            <a
              href={`https://sepolia.basescan.org/tx/${approveTx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              View on BaseScan
            </a>
          </div>
        );

        const approveReceipt = await approveTx.wait();
        console.log("Approval receipt:", approveReceipt);

        // Verify allowance after approval
        const newAllowance = await usdtContract.allowance(
          account,
          CONTRACT_ADDRESS
        );
        console.log("New allowance:", ethers.formatUnits(newAllowance, 6));

        if (newAllowance < amountInWei) {
          throw new Error(
            "Approval failed: New allowance is less than deposit amount"
          );
        }

        toast.success("Approval successful! Proceeding with deposit...");
      }

      // Then deposit
      setTxStatus({
        status: "pending",
        message: "Preparing deposit transaction...",
        hash: "",
      });

      // Verify contract address and USDT address
      console.log("Staking Contract Address:", CONTRACT_ADDRESS);
      console.log("USDT Contract Address:", USDT_ADDRESS);

      // Double check allowance before deposit
      const finalAllowance = await usdtContract.allowance(
        account,
        CONTRACT_ADDRESS
      );
      console.log(
        "Final allowance before deposit:",
        ethers.formatUnits(finalAllowance, 6)
      );

      if (finalAllowance < amountInWei) {
        throw new Error("Insufficient allowance for deposit");
      }

      const depositTx = await stakingContract.deposit(
        amountInWei,
        selectedPeriod
      );
      setTxStatus({
        status: "confirming",
        message: "Deposit transaction submitted! Waiting for confirmation...",
        hash: depositTx.hash,
      });

      toast.info(
        <div>
          <p>Deposit transaction submitted!</p>
          <a
            href={`https://sepolia.basescan.org/tx/${depositTx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            View on BaseScan
          </a>
        </div>
      );

      const depositReceipt = await depositTx.wait();
      console.log("Deposit receipt:", depositReceipt);

      setTxStatus({
        status: "success",
        message: "Deposit successful!",
        hash: depositTx.hash,
      });
      toast.success("Deposit successful!");
      setAmount("");
      onClose();
    } catch (err) {
      console.error("Error in deposit process:", err);
      let errorMessage = "Failed to complete deposit process";

      if (err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err.code === -32603) {
        errorMessage =
          "Transaction failed: Insufficient gas or invalid parameters";
      } else if (err.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (err.message.includes("execution reverted")) {
        errorMessage =
          "Transaction reverted. Please check your USDC balance and allowance.";
      } else if (err.message.includes("Approval failed")) {
        errorMessage = err.message;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Deposit USDT</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to deposit"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="period"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Lock Period
            </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
            </select>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isSubmitting || !amount}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting || !amount
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                {txStatus.message.includes("Approval")
                  ? "Approving..."
                  : "Processing..."}
              </div>
            ) : (
              "Deposit"
            )}
          </button>

          {txStatus.status && (
            <div
              className={`mt-4 ${
                txStatus.status === "error"
                  ? "text-red-500"
                  : txStatus.status === "success"
                  ? "text-green-500"
                  : "text-blue-400"
              } text-sm flex items-center`}
            >
              {txStatus.status === "pending" ||
              txStatus.status === "confirming" ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : txStatus.status === "success" ? (
                <span className="mr-2">✓</span>
              ) : (
                <span className="mr-2">✗</span>
              )}
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
      </div>
    </div>
  );
};

export default Deposit;
