import React, { useState } from "react";
import { ethers } from "ethers";
import TimeLockNFTStakingABI from "../../abis/LockNft_abi.json";
import { toast } from "react-toastify";
import { useWallet } from "../../context/WalletContext";
import { FaSpinner } from "react-icons/fa";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;

const UpdateROI = ({ isOpen, onClose }) => {
  const { account, signer } = useWallet();
  const [roi3m, setRoi3m] = useState("");
  const [roi6m, setRoi6m] = useState("");
  const [roi12m, setRoi12m] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState({
    status: "",
    message: "",
    hash: "",
  });

  const handleUpdateROIs = async () => {
    if (!account || !signer) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (
      !roi3m ||
      !roi6m ||
      !roi12m ||
      isNaN(roi3m) ||
      isNaN(roi6m) ||
      isNaN(roi12m)
    ) {
      toast.error("Please enter valid ROI percentages.");
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

      // Convert ROIs to basis points (1% = 100 basis points)
      const roi3mBps = Math.round(parseFloat(roi3m) * 100);
      const roi6mBps = Math.round(parseFloat(roi6m) * 100);
      const roi12mBps = Math.round(parseFloat(roi12m) * 100);

      const tx = await stakingContract.setROIs(roi3mBps, roi6mBps, roi12mBps);
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
        message: "ROIs updated successfully!",
        hash: tx.hash,
      });
      toast.success("ROIs updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating ROIs:", err);
      let errorMessage = "Failed to update ROIs";
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
          <h2 className="text-xl font-semibold text-white">Update ROIs</h2>
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
              htmlFor="roi3m"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              3 Months ROI (%)
            </label>
            <input
              type="number"
              id="roi3m"
              value={roi3m}
              onChange={(e) => setRoi3m(e.target.value)}
              placeholder="Enter ROI percentage"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="roi6m"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              6 Months ROI (%)
            </label>
            <input
              type="number"
              id="roi6m"
              value={roi6m}
              onChange={(e) => setRoi6m(e.target.value)}
              placeholder="Enter ROI percentage"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="roi12m"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              12 Months ROI (%)
            </label>
            <input
              type="number"
              id="roi12m"
              value={roi12m}
              onChange={(e) => setRoi12m(e.target.value)}
              placeholder="Enter ROI percentage"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
          </div>

          <button
            onClick={handleUpdateROIs}
            disabled={isSubmitting || !roi3m || !roi6m || !roi12m}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isSubmitting || !roi3m || !roi6m || !roi12m
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
              "Update ROIs"
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

export default UpdateROI;
