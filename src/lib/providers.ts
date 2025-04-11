import { rpcConfig } from "@/config";
import { Chain, createPublicClient, http, PublicClient } from "viem";
import { baseSepolia, base } from "viem/chains";
import { entryPoint07Address } from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";

export const getPublicClient = (chain: Chain) =>
  createPublicClient({
    chain,
    transport: http(rpcConfig(chain)),
  }) as PublicClient;

export function getScannerUrl(chainId: number, transactionHash: string) {
  switch (chainId) {
    case baseSepolia.id:
      // return `https://sepolia.basescan.org/tx/${transactionHash}`;
      return `https://base-sepolia.blockscout.com/op/${transactionHash}`
    case base.id:
      // return `https://basescan.org/tx/${transactionHash}`;
      return `https://base.blockscout.com/op/${transactionHash}`
    default:
      return `chainId ${chainId} not supported`;
  }
}

export function pimlicoUrlForChain(chain: Chain) {
  try {
    return `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;
  } catch (e) {
    return `chain ${chain.name} not supported`;
  }
}

export function getPimlicoClient(chain: Chain) {
  return createPimlicoClient({
    transport: http(pimlicoUrlForChain(chain)),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });
}

// export function getPaymasterServiceUrl(chain: Chain) {
//   switch (chain.id) {
//     case baseSepolia.id:
//       return process.env.NEXT_PUBLIC_BASE_SEPOLIA_PAYMASTER_SERVICE_URL!;
//     case base.id:
//       return process.env.NEXT_PUBLIC_BASE_PAYMASTER_SERVICE_URL!;
//     default:
//       return `chain ${chain.name} not supported`;
//   }
// }

// export function getBundlerUrl(chain: Chain) {
//   switch (chain.id) {
//     case baseSepolia.id:
//       return process.env.NEXT_PUBLIC_BASE_SEPOLIA_BUNDLER_URL!;
//     case base.id:
//       return process.env.NEXT_PUBLIC_BASE_BUNDLER_URL!;
//     default:
//       return `chain ${chain.name} not supported`;
//   }
// }

export function getAaUrl(chain: Chain) {
  switch (chain.id) {
    case baseSepolia.id:
      return process.env.NEXT_PUBLIC_AA_BASE_SEPOLIA_URL!;
    case base.id:
      return process.env.NEXT_PUBLIC_AA_BASE_URL!;
    default:
      return `chain ${chain.name} not supported`;
  }
}
