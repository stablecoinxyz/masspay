import { Token } from "@uniswap/sdk-core";

import erc20PermitAbi from "@/lib/abi/erc20Permit.abi";

import { CurrentConfig } from "@/config";
import { SBC } from "@/lib/constants";
import {
  getPublicClient,
  getPimlicoClient,
  getAaUrl,
} from "@/lib/providers";
import { fromReadableAmount } from "@/lib/extras";
import { getSmartAccount, ACCOUNT_TYPE } from "@/lib/account-utils";

import {
  createWalletClient,
  custom,
  encodeFunctionData,
  erc20Abi,
  Hex,
  http,
  Chain,
  parseSignature,
  WalletClient,
} from "viem";

import { UserOperation, createPaymasterClient } from "viem/account-abstraction";

import { createSmartAccountClient } from "permissionless";

// const PAYMASTER_SERVICE_URL = process.env.NEXT_PUBLIC_PAYMASTER_SERVICE_URL!;
// const BUNDLER_SERVER_URL = process.env.NEXT_PUBLIC_BUNDLER_URL!;

async function prepareMassPay(
  accountType: string = ACCOUNT_TYPE,
  txs: { to: string; value: number }[],
  chain: Chain,
) {
  const owner = createWalletClient({
    account: CurrentConfig.account!.address as Hex,
    chain,
    transport: custom((window as any).ethereum),
  });

  console.log("owner address", owner.account.address);

  const smartAccount = await getSmartAccount(accountType, chain, owner);

  const paymaster = createPaymasterClient({
    transport: http(getAaUrl(chain, "staging")),
    // transport: http(PAYMASTER_SERVICE_URL),
  });

  const smartAccountClient = createSmartAccountClient({
    account: smartAccount,
    chain,
    bundlerTransport: http(getAaUrl(chain, "staging")),
    // bundlerTransport: http(BUNDLER_SERVER_URL),
    paymaster,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await getPimlicoClient(chain).getUserOperationGasPrice()).fast;
      },
    },
  });

  const decimalPlaces = SBC[chain.id].decimals;
  const txnBigInts: { to: string; value: bigint }[] = txs.map((tx) => {
    return {
      to: tx.to,
      value: BigInt(fromReadableAmount(tx.value, decimalPlaces).toString()),
    };
  });

  console.debug(owner.account.address, txs, txnBigInts);

  const calls = txnBigInts.map((tx) => {
    const transferData = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transferFrom",
      args: [owner.account.address as Hex, tx.to as Hex, tx.value],
    });
    return {
      to: SBC[chain.id].address as Hex,
      data: transferData,
    };
  });

  const totalValue = BigInt(txnBigInts.reduce((acc, tx) => acc + tx.value, 0n));

  // 30 min deadline
  const deadline = Math.floor(Date.now() / 1000) + 60 * 30;

  // get the sender (counterfactual) address of the SmartAccount
  const senderAddress = smartAccount.address;

  console.log(`Getting permit signature for: ${senderAddress}, with parameters 
    chain: ${chain.id}
    owner: ${owner.account.address}
    token: ${SBC[chain.id].address}
    senderAddress: ${senderAddress}
    totalValue: ${totalValue}
    deadline: ${deadline}
    `);

  // prepend the permit data instruction
  const signature = await getPermitSignature(
    chain,
    owner,
    SBC[chain.id],
    owner.account.address as Hex,
    senderAddress,
    totalValue,
    deadline,
  );

  if (signature === "0xError") {
    console.debug("Error signing permit transaction");
    return {
      smartAccountClient,
      calls: [],
    };
  }

  const { r, s, v } = parseSignature(signature);

  // encode the permit transaction calldata
  const permitData = encodeFunctionData({
    abi: erc20PermitAbi,
    functionName: "permit",
    args: [
      owner.account.address as Hex,
      senderAddress,
      totalValue,
      deadline,
      v,
      r,
      s,
    ],
  });

  // prepend to the calls array
  calls.unshift({
    to: SBC[chain.id].address as Hex,
    data: permitData,
  });

  return {
    smartAccountClient,
    calls,
  };
}

export async function executeGaslessMassPay(
  txs: { to: string; value: number }[],
  chain: Chain,
  accountType: string = ACCOUNT_TYPE,
): Promise<string> {
  console.log("executeGaslessMassPay TESTNET", txs, chain);
  try {
    const { smartAccountClient, calls } = await prepareMassPay(accountType, txs, chain);

    if (calls.length === 0) {
      return "Error preparing mass pay";
    }

    // send the batch call transaction to the SmartAccount,
    // using your gas credits policy ID
    const userOpHash = await smartAccountClient.sendUserOperation({
      calls,
    });

    const receipt = await smartAccountClient.waitForUserOperationReceipt({
      hash: userOpHash,
      pollingInterval: 1000,
      timeout: 100000,
      retryCount: 10,
    });

    return receipt.userOpHash;
  } catch (e) {
    return (e as any).message;
  }
}

export async function estimateGasForMassPay(
  txs: { to: string; value: number }[],
  chain: Chain,
  accountType: string = ACCOUNT_TYPE,
): Promise<bigint> {
  try {
    const { smartAccountClient, calls } = await prepareMassPay(accountType, txs, chain);

    if (calls.length === 0) {
      return 0n;
    }

    const userOperation = (await smartAccountClient.prepareUserOperation({
      calls,
      // `paymasterContext` is an optional field that can be used to
      // specify a Pimlico paymaster policy
      // paymasterContext: {
      //   sponsorshipPolicyId: "",
      // },
    })) as UserOperation<"0.7">;

    const block = await getPublicClient(chain).getBlock();

    const gasPrice = min(
      userOperation.maxFeePerGas,
      userOperation.maxPriorityFeePerGas + (block.baseFeePerGas ?? 0n),
    );

    const expectedGasUsed =
      userOperation.preVerificationGas +
      userOperation.callGasLimit +
      userOperation.verificationGasLimit +
      (userOperation.paymasterPostOpGasLimit ?? 0n) +
      (userOperation.paymasterVerificationGasLimit ?? 0n);

    const pimlicoFee = 10n;
    const gasCost = (expectedGasUsed * gasPrice * (100n + pimlicoFee)) / 100n;

    return gasCost;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function min(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

async function getPermitSignature(
  chain: Chain,
  wallet: WalletClient,
  token: Token,
  owner: string,
  spender: string,
  value: BigInt,
  deadline: number,
): Promise<Hex> {
  try {
    const domain = {
      name: token.name!,
      version: getDomainVersion(token.name!, chain.id),
      chainId: chain.id,
      verifyingContract: token.address as Hex,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const nonce = await getPublicClient(chain).readContract({
      address: token.address as Hex,
      abi: erc20PermitAbi,
      functionName: "nonces",
      args: [owner as Hex],
    });

    const message = {
      owner,
      spender,
      value,
      nonce,
      deadline,
    };

    const signature = await wallet.signTypedData({
      account: owner as Hex,
      domain,
      types,
      primaryType: "Permit",
      message,
    });

    return signature as Hex;
  } catch (e) {
    return "0xError";
  }
}

function getDomainVersion(tokenName: string, chainId: number): string {
  // USDC uses version 2 while most other tokens use version 1
  return tokenName === "USD Coin" ? "2" : "1";
}
