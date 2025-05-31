import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          // Check if already connected
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            const signer = await provider.getSigner();
            setSigner(signer);
            const network = await provider.getNetwork();
            setChainId(network.chainId);

            // Detect wallet type
            if (window.ethereum.isCoinbaseWallet) {
              setWalletType("coinbase");
            } else if (window.ethereum.isMetaMask) {
              setWalletType("metamask");
            }
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", handleAccountsChanged);
          // Listen for chain changes
          window.ethereum.on("chainChanged", handleChainChanged);
        } catch (error) {
          console.error("Error initializing wallet:", error);
        }
      }
    };

    initWallet();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setIsConnected(false);
      setSigner(null);
      setWalletType(null);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      if (provider) {
        const signer = await provider.getSigner();
        setSigner(signer);
      }
    }
  };

  const handleChainChanged = async () => {
    if (provider) {
      const network = await provider.getNetwork();
      setChainId(network.chainId);
    }
  };

  const connectWallet = async (walletType) => {
    try {
      let provider;

      if (walletType === "metamask") {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          toast.error("Please install MetaMask!");
          return;
        }
        provider = new ethers.BrowserProvider(window.ethereum);
        setWalletType("metamask");
      } else if (walletType === "coinbase") {
        if (!window.ethereum || !window.ethereum.isCoinbaseWallet) {
          window.open("https://wallet.coinbase.com/");
          return;
        }
        provider = new ethers.BrowserProvider(window.ethereum);
        setWalletType("coinbase");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setIsConnected(true);
      setProvider(provider);
      const signer = await provider.getSigner();
      setSigner(signer);
      const network = await provider.getNetwork();
      setChainId(network.chainId);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        toast.error("Please connect your wallet to continue");
      } else {
        toast.error("Error connecting wallet: " + error.message);
      }
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setWalletType(null);
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    walletType,
    isConnected,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
