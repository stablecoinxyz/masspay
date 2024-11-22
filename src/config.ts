import { PublicClient, WalletClient } from "viem";
import { UseAccountReturnType } from "wagmi";

export interface TradeConfig {
  rpc: {
    local: string;
    base: string;
    baseSepolia: string;
  };
  provider: PublicClient | null;
  wallet: WalletClient | null;
  account: UseAccountReturnType | null;
}

export const CurrentConfig: TradeConfig = {
  rpc: {
    local: "http://localhost:8545",
    base: "https://base-rpc.publicnode.com",
    baseSepolia: "https://base-sepolia-rpc.publicnode.com",
  },
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
