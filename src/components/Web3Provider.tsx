"use client";

import { WagmiProvider, createConfig, http, fallback } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { rpcConfig } from "@/config";

const config = createConfig(
  getDefaultConfig({
    chains: [base, baseSepolia],
    transports: {
      [base.id]: fallback([http(rpcConfig(base))]),
      [baseSepolia.id]: fallback([http(rpcConfig(baseSepolia))]),
    },

    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    // Required App Info
    appName: "Gasless Masspay | Stable Coin",

    // Optional App Info
    appDescription: "Gasless Masspay with SBC",
    appUrl: "https://masspay.stablecoin.xyz",
    appIcon: "https://masspay.stablecoin.xyz/sbc-logo.svg", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      structuralSharing: true,
      staleTime: 1000 * 1, // 1 second
    },
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider theme="midnight">{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
