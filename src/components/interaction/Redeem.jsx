import React, { useState } from "react";
import { ethers } from "ethers";
import TimeLockNFTStakingABI from "../../abis/LockNft_abi.json";
import { toast } from "react-toastify";
import { useWallet } from "../../context/WalletContext";
import { FaSpinner } from "react-icons/fa";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;

const Redeem = ({ isOpen, onClose }) => {
  const { account, signer } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [txStatus, setTxStatus] = useState({
    status: "",
    message: "",
    hash: "",
  });

  const handleRedeem = async () => {
    if (!account || !signer) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!tokenId) {
      toast.error("Please enter a token ID.");
      return;
    }

    try {
      setIsSubmitting(true);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TimeLockNFTStakingABI,
        signer
      );

      setTxStatus({
        status: "pending",
        message: "Preparing transaction...",
        hash: "",
      });

      const tx = await stakingContract.redeem(tokenId);
      setTxStatus({
        status: "confirming",
        message: "Transaction submitted! Waiting for confirmation...",
        hash: tx.hash,
      });

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

      await tx.wait();
      setTxStatus({
        status: "success",
        message: "Redeem successful!",
        hash: tx.hash,
      });
      toast.success("Redeem successful!");
      setTokenId("");
      onClose();
    } catch (err) {
      console.error("Error redeeming:", err);
      let errorMessage = "Failed to redeem";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Redeem Staked Tokens
          </h2>
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
              htmlFor="tokenId"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Token ID
            </label>
            <input
              type="number"
              id="tokenId"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter token ID to redeem"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <button
            onClick={handleRedeem}
            disabled={isSubmitting || !tokenId}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting || !tokenId
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              "Redeem"
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

export default Redeem;
