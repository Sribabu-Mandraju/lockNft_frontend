import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import LockNftAbi from "../../abis/LockNft_abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_LOCK_NFT;

function Redeem({ isOpen, onClose }) {
  const [tokenId, setTokenId] = useState("");
  const [depositInfo, setDepositInfo] = useState(null);
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

  // Fetch deposit info when tokenId changes
  useEffect(() => {
    const fetchDepositInfo = async () => {
      if (!tokenId || !provider) return;

      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LockNftAbi,
          provider
        );

        const info = await contract.getDeposit(tokenId);
        setDepositInfo({
          amount: ethers.utils.formatUnits(info.amount, 6), // Assuming USDT has 6 decimals
          startTimestamp: new Date(info.startTimestamp.toNumber() * 1000),
          periodMonths: info.periodMonths,
          unlockTimestamp: new Date(info.unlockTimestamp.toNumber() * 1000),
          originalMinter: info.originalMinter,
        });
      } catch (error) {
        console.error("Error fetching deposit info:", error);
        setDepositInfo(null);
      }
    };

    fetchDepositInfo();
  }, [tokenId, provider]);

  const handleRedeem = async () => {
    if (!account) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!tokenId) {
      toast.error("Please enter a valid token ID");
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

      // Send transaction
      const tx = await contract.redeem(tokenId);

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
          message: "Deposit redeemed successfully!",
          hash: tx.hash,
        });
        toast.success("Deposit redeemed successfully!");
        setTokenId("");
        setDepositInfo(null);
      } else {
        setTxStatus({
          status: "error",
          message: "Transaction failed!",
          hash: tx.hash,
        });
        toast.error("Transaction failed!");
      }
    } catch (err) {
      console.error("Error redeeming deposit:", err);

      // Handle specific error cases
      let errorMessage = "Failed to redeem deposit";
      if (err.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (err.code === -32603) {
        errorMessage =
          "Transaction failed: Insufficient gas or invalid parameters";
      } else if (err.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user";
      } else if (err.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for gas";
      } else if (err.message.includes("Not owner")) {
        errorMessage = "You are not the owner of this NFT";
      } else if (err.message.includes("Lockup not over")) {
        errorMessage = "Lockup period is not over yet";
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
        <h2 className="text-white text-xl font-bold mb-4">Redeem Deposit</h2>

        {/* Token ID Input */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2 block">
            Token ID
          </label>
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter NFT token ID"
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
            disabled={isProcessing}
          />
        </div>

        {/* Deposit Info */}
        {depositInfo && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Amount:</span>
              <span className="text-white ml-2">{depositInfo.amount} USDT</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Period:</span>
              <span className="text-white ml-2">
                {depositInfo.periodMonths} months
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Start Date:</span>
              <span className="text-white ml-2">
                {depositInfo.startTimestamp.toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Unlock Date:</span>
              <span className="text-white ml-2">
                {depositInfo.unlockTimestamp.toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Status:</span>
              <span
                className={`ml-2 ${
                  depositInfo.unlockTimestamp > new Date()
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {depositInfo.unlockTimestamp > new Date()
                  ? "Locked"
                  : "Ready to Redeem"}
              </span>
            </div>
          </div>
        )}

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
            onClick={handleRedeem}
            disabled={
              isProcessing ||
              !tokenId ||
              !depositInfo ||
              depositInfo.unlockTimestamp > new Date()
            }
            className={`p-3 text-sm font-medium rounded bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-colors ${
              (isProcessing ||
                !tokenId ||
                !depositInfo ||
                depositInfo.unlockTimestamp > new Date()) &&
              "opacity-50 cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {txStatus.message || "Processing..."}
              </span>
            ) : (
              "Redeem Deposit"
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

export default Redeem;
