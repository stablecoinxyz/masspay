import { PublicClient, WalletClient, Chain } from "viem";
import { localhost, base, baseSepolia } from "viem/chains";
import { UseAccountReturnType } from "wagmi";
import { radiusTestnet, radiusMainnet } from "@/lib/custom-network";

export function rpcConfig(chain: Chain) {
  if (!chain) {
    return "";
  }

  // Check for custom RPC URLs from environment variables first
  switch (chain.id) {
    case localhost.id:
      return process.env.NEXT_PUBLIC_LOCALHOST_RPC_URL || "http://localhost:8545";
    case base.id:
      return process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://base-rpc.publicnode.com";
    case baseSepolia.id:
      return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://base-sepolia-rpc.publicnode.com";
    case radiusTestnet.id:
      return process.env.NEXT_PUBLIC_RADIUS_TESTNET_RPC_URL || "https://rpc.testnet.radiustech.xyz";
    case radiusMainnet.id:
      return process.env.NEXT_PUBLIC_RADIUS_MAINNET_RPC_URL || "https://rpc.radiustech.xyz/";
    default:
      return "";
  }
}

export interface TradeConfig {
  provider: PublicClient | null;
  wallet: WalletClient | null;
  account: UseAccountReturnType | null;
}

export const CurrentConfig: TradeConfig = {
  provider: null,
  wallet: null,
  account: null,
};

// CSV Data configs
export type DataConfig = {
  address: string;
  amount: string;
}[];

export const dataConfig = [];
