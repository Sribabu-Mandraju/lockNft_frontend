import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const EthersContext = createContext();

export const useEthers = () => {
  const context = useContext(EthersContext);
  if (!context) {
    throw new Error("useEthers must be used within an EthersProvider");
  }
  return context;
};

export const EthersProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Get network info
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));

          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            setSigner(signer);
            setAccount(accounts[0]);
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", async (accounts) => {
            if (accounts.length > 0) {
              const signer = await provider.getSigner();
              setSigner(signer);
              setAccount(accounts[0]);
            } else {
              setSigner(null);
              setAccount(null);
            }
          });

          // Listen for chain changes
          window.ethereum.on("chainChanged", async (chainId) => {
            setChainId(Number(chainId));
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            if (account) {
              const signer = await provider.getSigner();
              setSigner(signer);
            }
          });
        } catch (error) {
          console.error("Error initializing provider:", error);
          toast.error("Failed to initialize wallet connection");
        }
      }
    };

    initProvider();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const connect = async (walletType = "metamask") => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);
    try {
      let provider;
      switch (walletType) {
        case "metamask":
          provider = new ethers.BrowserProvider(window.ethereum);
          break;
        case "coinbase":
          if (window.ethereum.isCoinbaseWallet) {
            provider = new ethers.BrowserProvider(window.ethereum);
          } else {
            throw new Error("Coinbase Wallet not detected");
          }
          break;
        default:
          throw new Error("Unsupported wallet type");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const signer = await provider.getSigner();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);

      // Check if we're on the correct network (Ethereum mainnet)
      const network = await provider.getNetwork();
      if (network.chainId !== 1n) {
        toast.warning("Please switch to Ethereum mainnet");
      }

      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        toast.error("Please connect your wallet to continue");
      } else {
        toast.error(error.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    toast.info("Wallet disconnected");
  };

  const value = {
    provider,
    signer,
    account,
    chainId,
    isConnecting,
    connect,
    disconnect,
  };

  return (
    <EthersContext.Provider value={value}>{children}</EthersContext.Provider>
  );
};
