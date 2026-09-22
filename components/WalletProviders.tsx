"use client";

import { appConfig } from "@/lib/config";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { useWallet, ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { useWalletModal, WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useMemo, useRef, type ReactNode } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProviders({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => {
    if (appConfig.rpcUrl) return appConfig.rpcUrl;
    return clusterApiUrl(
      appConfig.mainnet ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet,
    );
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* autoConnect stays off so a stored wallet does not pop up on load.
          ConnectAfterSelect calls connect() once the user picks a wallet. */}
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <ConnectAfterSelect>{children}</ConnectAfterSelect>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function ConnectAfterSelect({ children }: { children: ReactNode }) {
  const { wallet, connect, connected, connecting } = useWallet();
  const { visible } = useWalletModal();
  const modalWasOpen = useRef(false);

  useEffect(() => {
    if (visible) {
      modalWasOpen.current = true;
      return;
    }
    if (!modalWasOpen.current) return;
    modalWasOpen.current = false;
    if (!wallet || connected || connecting) return;
    // Selecting a wallet only stores the choice when autoConnect is off.
    // Connect on the next turn so the provider has attached wallet listeners.
    const id = window.setTimeout(() => {
      connect().catch(() => {});
    }, 0);
    return () => window.clearTimeout(id);
  }, [visible, wallet, connected, connecting, connect]);

  return children;
}
