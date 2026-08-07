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

function aaChainKey(chainId: number): string | null {
  switch (chainId) {
    case baseSepolia.id:
      return "baseSepolia";
    case base.id:
      return "base";
    case radiusTestnet.id:
      return "radiusTestnet";
    case radiusMainnet.id:
      return "radius";
    default:
      return null;
  }
}

/**
 * @param chain - The chain to get the AA URL for
 * @param env - The environment. When "staging", the proxy forwards to the staging bundler.
 * @returns A same-origin URL for the Account Abstraction proxy route.
 *
 * The bundler API key is no longer exposed to the browser. This returns a URL
 * to our own /api/aa/{chain} route, which forwards to the real bundler with a
 * server-only key. See src/app/api/aa/[chain]/route.ts.
 */
export function getAaUrl(chain: Chain, env?: string) {
  const key = aaChainKey(chain.id);
  if (!key) {
    return `getAaUrl: chain ${chain.name} not supported`;
  }
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const staging = env === "staging" ? "?staging" : "";
  return `${origin}/api/aa/${key}${staging}`;
}
