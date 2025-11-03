import { rpcConfig } from "@/config";
import { Chain, createPublicClient, http, PublicClient } from "viem";
import { baseSepolia, base } from "viem/chains";
import { radiusTestnet } from "./custom-network";

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
      return `https://testnet.radiustech.xyz/testnet/explorer?view=tx-details&hash=${transactionHash}`
    default:
      return `getScannerUrl: chainId ${chainId} not supported`;
  }
}

// export function pimlicoUrlForChain(chain: Chain) {
//   try {
//     return `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;
//   } catch (e) {
//     return `chain ${chain.name} not supported`;
//   }
// }

// export function getPimlicoClient(chain: Chain) {
//   return createPimlicoClient({
//     transport: http(pimlicoUrlForChain(chain)),
//     entryPoint: {
//       address: entryPoint07Address,
//       version: "0.7",
//     },
//   });
// }

export function getPaymasterServiceUrl(chain: Chain) {
  switch (chain.id) {
    case baseSepolia.id:
      return process.env.NEXT_PUBLIC_BASE_SEPOLIA_PAYMASTER_SERVICE_URL!;
    case base.id:
      return process.env.NEXT_PUBLIC_BASE_PAYMASTER_SERVICE_URL!;
    case radiusTestnet.id:
      return process.env.NEXT_PUBLIC_RADIUS_TESTNET_PAYMASTER_SERVICE_URL!;
    default:
      return `getPaymasterServiceUrl: chain ${chain.name} not supported`;
  }
}

export function getBundlerUrl(chain: Chain) {
  switch (chain.id) {
    case baseSepolia.id:
      return process.env.NEXT_PUBLIC_BASE_SEPOLIA_BUNDLER_URL!;
    case base.id:
      return process.env.NEXT_PUBLIC_BASE_BUNDLER_URL!;
    case radiusTestnet.id:
      return process.env.NEXT_PUBLIC_RADIUS_TESTNET_BUNDLER_URL!;
    default:
      return `getBundlerUrl: chain ${chain.name} not supported`;
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
      console.log("env =====>", env);
      return env === "staging" ? process.env.NEXT_PUBLIC_AA_BASE_SEPOLIA_URL_STAGING! : process.env.NEXT_PUBLIC_AA_BASE_SEPOLIA_URL!;
    case base.id:
      return env === "staging" ? process.env.NEXT_PUBLIC_AA_BASE_URL_STAGING! : process.env.NEXT_PUBLIC_AA_BASE_URL!;
    case radiusTestnet.id:
      return env === "staging" ? process.env.NEXT_PUBLIC_AA_RADIUS_TESTNET_URL_STAGING! : process.env.NEXT_PUBLIC_AA_RADIUS_TESTNET_URL!;
    default:
      return `getAaUrl: chain ${chain.name} not supported`;
  }
}
