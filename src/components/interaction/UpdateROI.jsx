import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import LockNftAbi from "../../abis/LockNft_abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;

function UpdateROI({ isOpen, onClose }) {
  const [roi3m, setRoi3m] = useState("");
  const [roi6m, setRoi6m] = useState("");
  const [roi12m, setRoi12m] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [txStatus, setTxStatus] = useState({
    status: "", // 'pending', 'confirming', 'success', 'error'
    message: "",
    hash: "",
  });

  // Initialize ethers provider and contract
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

  const handleUpdateROI = async () => {
    if (!account) {
      toast.error("Please connect your wallet first.");
      return;
    }

    // Validate ROI inputs
    const roi3mValue = Number(roi3m);
    const roi6mValue = Number(roi6m);
    const roi12mValue = Number(roi12m);

    if (isNaN(roi3mValue) || isNaN(roi6mValue) || isNaN(roi12mValue)) {
      toast.error("Please enter valid ROI values");
      return;
    }

    if (roi3mValue < 0 || roi6mValue < 0 || roi12mValue < 0) {
      toast.error("ROI values cannot be negative");
      return;
    }

    try {
      setIsProcessing(true);
      setTxStatus({
        status: "pending",
        message: "Preparing transaction...",
        hash: "",
      });

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LockNftAbi,
        signer
      );

      // Convert ROI values to basis points (multiply by 100)
      const roi3mBps = Math.floor(roi3mValue * 100);
      const roi6mBps = Math.floor(roi6mValue * 100);
      const roi12mBps = Math.floor(roi12mValue * 100);

      // Send transaction
      const tx = await contract.setROIs(roi3mBps, roi6mBps, roi12mBps);

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
          message: "ROI values updated successfully!",
          hash: tx.hash,
        });
        toast.success("ROI values updated successfully!");
        setRoi3m("");
        setRoi6m("");
        setRoi12m("");
      } else {
        setTxStatus({
          status: "error",
          message: "Transaction failed!",
          hash: tx.hash,
        });
        toast.error("Transaction failed!");
      }
    } catch (err) {
      console.error("Error updating ROI values:", err);

      // Handle specific error cases
      let errorMessage = "Failed to update ROI values";
      if (err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err.code === -32603) {
        errorMessage =
          "Transaction failed: Insufficient gas or invalid parameters";
      } else if (err.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (err.message.includes("Ownable: caller is not the owner")) {
        errorMessage = "Only contract owner can update ROI values";
      }

      setTxStatus({
        status: "error",
        message: errorMessage,
        hash: err.transaction?.hash || "",
      });
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get status icon based on transaction status
  const getStatusIcon = () => {
    switch (txStatus.status) {
      case "pending":
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
      case "pending":
      case "confirming":
        return "text-yellow-400";
      case "success":
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
        <h2 className="text-white text-xl font-bold mb-4">Update ROI Values</h2>

        {/* ROI Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 block">
              3 Months ROI (%)
            </label>
            <input
              type="number"
              value={roi3m}
              onChange={(e) => setRoi3m(e.target.value)}
              placeholder="Enter ROI percentage"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 block">
              6 Months ROI (%)
            </label>
            <input
              type="number"
              value={roi6m}
              onChange={(e) => setRoi6m(e.target.value)}
              placeholder="Enter ROI percentage"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 block">
              12 Months ROI (%)
            </label>
            <input
              type="number"
              value={roi12m}
              onChange={(e) => setRoi12m(e.target.value)}
              placeholder="Enter ROI percentage"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
              disabled={isProcessing}
            />
          </div>
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

        {/* Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleUpdateROI}
            disabled={isProcessing || !roi3m || !roi6m || !roi12m}
            className={`p-3 text-sm font-medium rounded bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-colors ${
              (isProcessing || !roi3m || !roi6m || !roi12m) &&
              "opacity-50 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {txStatus.message || "Processing..."}
              </span>
            ) : (
              "Update ROI Values"
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

export default UpdateROI;
