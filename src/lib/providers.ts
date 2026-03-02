import { rpcConfig } from "@/config";
import { Chain, createPublicClient, http, PublicClient } from "viem";
import { baseSepolia, base } from "viem/chains";
import { radiusTestnet, radiusMainnet } from "./custom-network";

export const getPublicClient = (chain: Chain) =>
  createPublicClient({
    chain,
    transport: http(rpcConfig(chain)),
  }) as PublicClient;

export function getScannerUrl(chainId: number, transactionHash: string) {
  switch (chainId) {
    case baseSepolia.id:
      return `https://sepolia.basescan.org/tx/${transactionHash}`;
    case base.id:
      return `https://basescan.org/tx/${transactionHash}`;
    case radiusTestnet.id:
      return `https://testnet.radiustech.xyz/testnet/explorer?view=tx-details&hash=${transactionHash}`;
    case radiusMainnet.id:
      return `https://network.radiustech.xyz/tx/${transactionHash}`;
    default:
      return `getScannerUrl: chainId ${chainId} not supported`;
  }
}

/**
 * @param chain - The chain to get the AA URL for
 * @param env - The environment to get the AA URL for. If not provided, the mainnet AA URL will be returned.
 * @returns The Account Abstraction API URL for the given chain and environment
 */
export function getAaUrl(chain: Chain, env?: string) {
  switch (chain.id) {
    case baseSepolia.id:
      return env === "staging" ? process.env.NEXT_PUBLIC_AA_BASE_SEPOLIA_URL_STAGING! : process.env.NEXT_PUBLIC_AA_BASE_SEPOLIA_URL!;
    case base.id:
      return env === "staging" ? process.env.NEXT_PUBLIC_AA_BASE_URL_STAGING! : process.env.NEXT_PUBLIC_AA_BASE_URL!;
    case radiusTestnet.id:
      return env === "staging" ? process.env.NEXT_PUBLIC_AA_RADIUS_TESTNET_URL_STAGING! : process.env.NEXT_PUBLIC_AA_RADIUS_TESTNET_URL!;
    case radiusMainnet.id:
      return env === "staging" ? process.env.NEXT_PUBLIC_AA_RADIUS_URL_STAGING! : process.env.NEXT_PUBLIC_AA_RADIUS_URL!;
    default:
      return `getAaUrl: chain ${chain.name} not supported`;
  }
}
