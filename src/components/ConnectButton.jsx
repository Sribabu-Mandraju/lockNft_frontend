// src/components/ConnectWallet.jsx
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          <button
            onClick={() =>
              connect({ connector: injected() })
            }
          >
            Connect with MetaMask
          </button>
          <button
            onClick={() =>
              connect({ connector: walletConnect({ projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID' }) })
            }
          >
            Connect with WalletConnect
          </button>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;