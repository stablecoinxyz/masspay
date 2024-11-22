import { CurrentConfig } from "@/config";
import { Chain, createPublicClient, http, PublicClient } from "viem";
import { polygon, base } from "viem/chains";
import { entryPoint07Address } from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";

export const publicClient = createPublicClient({
  chain: base,
  transport: http(CurrentConfig.rpc.base),
}) as PublicClient;

export function getScannerUrl(chainId: number, transactionHash: string) {
  switch (chainId) {
    case polygon.id:
      return `https://polygonscan.com/tx/${transactionHash}`;
    case base.id:
      return `https://basescan.org/tx/${transactionHash}`;
    default:
      return `chainId ${chainId} not supported`;
  }
}

export function pimlicoUrlForChain(chain: Chain) {
  try {
    return `https://api.pimlico.io/v2/${chain.name.toLowerCase()}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;
  } catch (e) {
    return `chain ${chain.name} not supported`;
  }
}

export const pimlicoClient = createPimlicoClient({
  transport: http(pimlicoUrlForChain(base)),
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  },
});
