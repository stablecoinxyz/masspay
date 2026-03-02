import {
  type Address,
  type Chain,
  type Hex,
  type LocalAccount,
  type OneOf,
  type EIP1193Provider,
  type Transport,
  type WalletClient,
  type Account,
  type JsonRpcAccount,
  type Client,
  decodeFunctionData,
  encodeFunctionData,
} from "viem";

import {
  type SmartAccount,
  type SmartAccountImplementation,
  type UserOperation,
  entryPoint07Abi,
  getUserOperationHash,
  toSmartAccount,
} from "viem/account-abstraction";

import { getChainId, getBytecode, signMessage } from "viem/actions";
import { getAction } from "viem/utils";
import { getAccountNonce, getSenderAddress } from "permissionless/actions";
import { toOwner } from "permissionless/utils";

// Radius Testnet specific addresses
export const RADIUS_TESTNET_ENTRY_POINT_ADDRESS = "0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F" as const;
export const RADIUS_TESTNET_SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x7d8fB3E53d345601a02C3214e314f28668510b03" as const;

// Radius Mainnet specific addresses
export const RADIUS_MAINNET_ENTRY_POINT_ADDRESS = "0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F" as const;
export const RADIUS_MAINNET_SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x7d8fB3E53d345601a02C3214e314f28668510b03" as const;


const getAccountInitCode = async (
  owner: Address,
  index = BigInt(0)
): Promise<Hex> => {
  if (!owner) throw new Error("Owner account not found");

  return encodeFunctionData({
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "salt",
            type: "uint256",
          },
        ],
        name: "createAccount",
        outputs: [
          {
            internalType: "contract SimpleAccount",
            name: "ret",
            type: "address",
          },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "createAccount",
    args: [owner, index],
  });
};

export type ToRadiusSimpleSmartAccountParameters = {
  client: Client<
    Transport,
    Chain | undefined,
    LocalAccount | JsonRpcAccount | undefined
  >;
  owner: OneOf<
    | EIP1193Provider
    | WalletClient<Transport, Chain | undefined, Account>
    | LocalAccount
  >;
  index?: bigint;
  address?: Address;
  nonceKey?: bigint;
};

export type RadiusSimpleSmartAccountImplementation = SmartAccountImplementation<
  typeof entryPoint07Abi,
  "0.7"
> & {
  sign: NonNullable<SmartAccountImplementation["sign"]>;
};

export type ToRadiusSimpleSmartAccountReturnType = SmartAccount<RadiusSimpleSmartAccountImplementation>;

/**
 * @description Creates a Simple Account for Radius (Testnet or Mainnet) with custom EntryPoint and Factory addresses
 *
 * @returns A Simple Smart Account configured for Radius
 */
export async function toRadiusSimpleSmartAccount(
  parameters: ToRadiusSimpleSmartAccountParameters
): Promise<ToRadiusSimpleSmartAccountReturnType> {
  const {
    client,
    owner,
    index = BigInt(0),
    address,
    nonceKey,
  } = parameters;

  const localOwner = await toOwner({ owner });

  // Determine chain ID
  let chainId: number;
  const getMemoizedChainId = async () => {
    if (chainId) return chainId;
    chainId = client.chain
      ? client.chain.id
      : await getAction(client, getChainId, "getChainId")({});
    return chainId;
  };

  // Use correct addresses based on chain
  const isMainnet = (client.chain?.id ?? await getMemoizedChainId()) === 723;
  const entryPointAddress = isMainnet ? RADIUS_MAINNET_ENTRY_POINT_ADDRESS : RADIUS_TESTNET_ENTRY_POINT_ADDRESS;
  const factoryAddress = isMainnet ? RADIUS_MAINNET_SIMPLE_ACCOUNT_FACTORY_ADDRESS : RADIUS_TESTNET_SIMPLE_ACCOUNT_FACTORY_ADDRESS;

  const entryPoint = {
    address: entryPointAddress,
    abi: entryPoint07Abi,
    version: "0.7",
  } as const;

  let accountAddress: Address | undefined = address;

  const getInitCode = async () => {
    return {
      factory: factoryAddress,
      factoryData: await getAccountInitCode(localOwner.address, index),
    };
  };

  const getFactoryArgs = async () => {
    // Check if the account is already deployed — if so, don't send factory data
    const { factory, factoryData } = await getInitCode();
    const accountAddr = accountAddress ?? await getSenderAddress(client, {
      factory,
      factoryData,
      entryPointAddress: entryPointAddress,
    });
    const code = await getBytecode(client, { address: accountAddr });
    if (code && code !== "0x") {
      return {};
    }
    return { factory, factoryData };
  };

  return toSmartAccount({
    client,
    entryPoint,
    getFactoryArgs,
    async getAddress() {
      if (accountAddress) return accountAddress;

      const { factory, factoryData } = await getInitCode();

      // Get the sender address based on the init code
      accountAddress = await getSenderAddress(client, {
        factory,
        factoryData,
        entryPointAddress: entryPoint.address,
      });

      return accountAddress;
    },
    async encodeCalls(calls) {
      if (calls.length > 1) {
        return encodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: "address[]",
                  name: "dest",
                  type: "address[]",
                },
                {
                  internalType: "uint256[]",
                  name: "value",
                  type: "uint256[]",
                },
                {
                  internalType: "bytes[]",
                  name: "func",
                  type: "bytes[]",
                },
              ],
              name: "executeBatch",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "executeBatch",
          args: [
            calls.map((a) => a.to),
            calls.map((a) => a.value ?? 0n),
            calls.map((a) => a.data ?? "0x"),
          ],
        });
      }

      const call = calls.length === 0 ? undefined : calls[0];

      if (!call) {
        throw new Error("No calls to encode");
      }

      return encodeFunctionData({
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "dest",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "value",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "func",
                type: "bytes",
              },
            ],
            name: "execute",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "execute",
        args: [call.to, call.value ?? 0n, call.data ?? "0x"],
      });
    },
    decodeCalls: async (callData) => {
      try {
        const decodedV7: any = decodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: "address[]",
                  name: "dest",
                  type: "address[]",
                },
                {
                  internalType: "uint256[]",
                  name: "value",
                  type: "uint256[]",
                },
                {
                  internalType: "bytes[]",
                  name: "func",
                  type: "bytes[]",
                },
              ],
              name: "executeBatch",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          data: callData,
        });

        const calls: {
          to: Address;
          data: Hex;
          value?: bigint;
        }[] = [];

        for (let i = 0; i < decodedV7.args[0].length; i++) {
          calls.push({
            to: decodedV7.args[0][i],
            value: decodedV7.args[1][i],
            data: decodedV7.args[2][i],
          });
        }

        return calls;
      } catch (_) {
        const decodedSingle: any = decodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "dest",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "func",
                  type: "bytes",
                },
              ],
              name: "execute",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          data: callData,
        });
        return [
          {
            to: decodedSingle.args[0],
            value: decodedSingle.args[1],
            data: decodedSingle.args[2],
          },
        ];
      }
    },
    async getNonce(_args) {
      return getAccountNonce(client, {
        address: await this.getAddress(),
        entryPointAddress: entryPoint.address,
        key: nonceKey ?? 0n,
      });
    },
    async getStubSignature() {
      return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c" as Hex;
    },
    async sign({ hash }: { hash: Hex }) {
      return this.signMessage({ message: hash });
    },
    signMessage: async (_parameters: unknown) => {
      throw new Error("Simple account isn't 1271 compliant");
    },
    signTypedData: async (_parameters: unknown) => {
      throw new Error("Simple account isn't 1271 compliant");
    },
    async signUserOperation(parameters) {
      const { chainId = await getMemoizedChainId(), ...userOperation } =
        parameters;
      return signMessage(client, {
        account: localOwner,
        message: {
          raw: getUserOperationHash({
            userOperation: {
              ...userOperation,
              sender: userOperation.sender ?? (await this.getAddress()),
              signature: "0x",
            } as UserOperation<"0.7">,
            entryPointAddress: entryPoint.address,
            entryPointVersion: entryPoint.version,
            chainId: chainId,
          }),
        },
      });
    },
  }) as Promise<ToRadiusSimpleSmartAccountReturnType>;
}
