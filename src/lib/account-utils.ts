import {
  WalletClient,
  Transport,
  Chain,
  Account,
} from "viem";

import {
  entryPoint07Address,
  SmartAccount,
  toCoinbaseSmartAccount
} from "viem/account-abstraction";

import {
  toSimpleSmartAccount, // Simple
  toKernelSmartAccount, // ZeroDev
  toLightSmartAccount, // Alchemy
  toNexusSmartAccount, // Biconomy
  toSafeSmartAccount, // Safe
  toThirdwebSmartAccount, // Thirdweb
} from "permissionless/accounts";

import { getPublicClient } from "@/lib/providers";
import { radiusTestnet } from "@/lib/custom-network";
import { toRadiusSimpleSmartAccount } from "@/lib/radius-simple-account";

// Get account type from environment or default to "simple"
export const ACCOUNT_TYPE = process.env.NEXT_PUBLIC_ACCOUNT_TYPE || "simple";

/**
 * Returns a smart account instance based on the specified type
 * @param accountType Type of smart account to create
 * @param chain Chain to create account on
 * @param owner Wallet client instance 
 * @returns Smart account instance
 */
export async function getSmartAccount(
  accountType: string = ACCOUNT_TYPE,
  chain: Chain,
  owner: WalletClient<Transport, Chain, Account>
): Promise<SmartAccount> {
  const publicClient = getPublicClient(chain);

  // Special handling for Radius Testnet - use custom EntryPoint and Factory
  if (chain.id === radiusTestnet.id && accountType.toLowerCase() === "simple") {
    return await toRadiusSimpleSmartAccount({
      client: publicClient,
      owner,
    });
  }

  switch (accountType.toLowerCase()) {
    case "coinbase":
      return await toCoinbaseSmartAccount({
        client: publicClient,
        owners: [owner.account.address],
      });
    case "zerodev":
      return await toKernelSmartAccount({
        client: publicClient,
        owners: [owner],
        entryPoint: {
          address: entryPoint07Address as `0x${string}`,
          version: "0.7",
        },
      });
    case "alchemy":
      return await toLightSmartAccount({
        client: publicClient,
        owner,
        entryPoint: {
          address: entryPoint07Address as `0x${string}`,
          version: "0.7",
        },
        version: "2.0.0",
      });
    case "biconomy":
      return await toNexusSmartAccount({
        client: publicClient,
        owners: [owner],
        version: "1.0.0",
      });
    case "safe":
      return await toSafeSmartAccount({
        client: publicClient,
        owners: [owner],
        entryPoint: {
          address: entryPoint07Address as `0x${string}`,
          version: "0.7",
        },
        version: "1.4.1",
      });
    case "thirdweb":
      return await toThirdwebSmartAccount({
        client: publicClient,
        owner,
        entryPoint: {
          address: entryPoint07Address as `0x${string}`,
          version: "0.7",
        },
      });
    case "simple":
    default:
      return await toSimpleSmartAccount({
        client: publicClient,
        owner,
        entryPoint: {
          address: entryPoint07Address as `0x${string}`,
          version: "0.7",
        },
      });
  }
} 