import { PublicClient, WalletClient, Chain } from "viem";
import { localhost, base, baseSepolia } from "viem/chains";
import { UseAccountReturnType } from "wagmi";

export const chain = baseSepolia;

export const rpcConfig = (chain: Chain) => {
  switch (chain.id) {
    case localhost.id:
      return "http://localhost:8545";
    case base.id:
      return "https://base-rpc.publicnode.com";
    case baseSepolia.id:
      return "https://base-sepolia-rpc.publicnode.com";
    default:
      return "";
  }
};

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
