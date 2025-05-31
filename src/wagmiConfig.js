// src/wagmiConfig.js
import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const config = createConfig({
  chains: [mainnet, sepolia], // Add desired chains (e.g., Ethereum mainnet, Sepolia testnet)
  connectors: [
    injected(), // For browser-based wallets like MetaMask
    walletConnect({
      projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
    }),
    coinbaseWallet({
      appName: 'Your App Name', // Replace with your app's name
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export default config;