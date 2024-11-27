import { BigintIsh, Token } from "@uniswap/sdk-core";

import erc20PermitAbi from "@/lib/abi/erc20Permit.abi";

import { CurrentConfig } from "@/config";
import { SBC } from "@/lib/constants";
import {
  publicClient,
  pimlicoClient,
  pimlicoUrlForChain,
} from "@/lib/providers";
import { fromReadableAmount } from "@/lib/extras";

import {
  createWalletClient,
  custom,
  encodeFunctionData,
  erc20Abi,
  Hex,
  http,
  parseAbi,
  parseSignature,
  WalletClient,
} from "viem";

import { base } from "viem/chains";
import { entryPoint07Address, UserOperation } from "viem/account-abstraction";

import { toSimpleSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";

async function prepareMassPay(txs: { to: string; value: number }[]) {
  const owner = createWalletClient({
    account: CurrentConfig.account!.address as Hex,
    chain: base,
    transport: custom((window as any).ethereum),
  });

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: owner,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  // get the sender (counterfactual) address of the SimpleAccount
  const senderAddress = simpleAccount.address;

  // 30 min deadline
  const deadline = Math.floor(Date.now() / 1000) + 60 * 30;

  // create a pimlico SmartAccountClient
  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain: base,
    bundlerTransport: http(pimlicoUrlForChain(base)),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  // calculate tx values as BigInts using token's decimal places
  const decimalPlaces = SBC.decimals;
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
      from: owner.account.address as Hex,
      to: SBC.address as Hex,
      data: transferData,
    };
  });

  const totalValue = BigInt(txnBigInts.reduce((acc, tx) => acc + tx.value, 0n));

  // prepend the permit data instruction
  const signature = await getPermitSignature(
    owner,
    SBC,
    CurrentConfig.account!.address as Hex,
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
      CurrentConfig.account!.address as Hex,
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
    from: owner.account.address as Hex,
    to: SBC.address as Hex,
    data: permitData,
  });

  return {
    smartAccountClient,
    calls,
  };
}

export async function executeGaslessMassPay(
  txs: { to: string; value: number }[],
): Promise<string> {
  try {
    const { smartAccountClient, calls } = await prepareMassPay(txs);

    if (calls.length === 0) {
      return "Error preparing mass pay";
    }

    // send the batch call transaction to the SimpleAccount,
    // using your gas credits policy ID
    const userOpHash = await smartAccountClient.sendTransaction({
      calls,
      paymasterContext: {
        sponsorshipPolicyId: process.env.NEXT_PUBLIC_SPONSORSHIP_POLICY_ID!,
      },
    });

    return userOpHash;
  } catch (e) {
    return (e as any).message;
  }
}

export async function estimateGasForMassPay(
  txs: { to: string; value: number }[],
): Promise<bigint> {
  try {
    const { smartAccountClient, calls } = await prepareMassPay(txs);

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

    const block = await publicClient.getBlock();

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
      version: getDomainVersion(token.name!, base.id),
      chainId: base.id,
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

    const nonce = await publicClient.readContract({
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
