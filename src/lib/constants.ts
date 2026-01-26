import { Token } from "@uniswap/sdk-core";
import { base, baseSepolia } from "viem/chains";
import { radiusTestnet } from "./custom-network";

// Currencies and Tokens
const SBC_CONTRACT_ADDRESS = "0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798";
const SBC_BASE_SEPOLIA_CONTRACT_ADDRESS =
  "0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16";

const SBC_BASE = new Token(
  base.id,
  SBC_CONTRACT_ADDRESS,
  18,
  "SBC",
  "Stable Coin",
);

const SBC_BASE_SEPOLIA = new Token(
  baseSepolia.id,
  SBC_BASE_SEPOLIA_CONTRACT_ADDRESS,
  6,
  "SBC",
  "Stable Coin",
);

// Radius Testnet (using TestSBCPermit with EIP-2612 support)
const TestSBC_CONTRACT_ADDRESS = "0xbc14568925d9359a203b5c5c6de838c8baeebf5a";
const TestSBC_RADIUS_TESTNET = new Token(
  radiusTestnet.id,
  TestSBC_CONTRACT_ADDRESS,
  6,
  "Test SBC",
  "Test SBC",
);

export const SBC = {
  [`${base.id}`]: SBC_BASE,
  [`${baseSepolia.id}`]: SBC_BASE_SEPOLIA,
  [`${radiusTestnet.id}`]: TestSBC_RADIUS_TESTNET,
};

export const SBC_CONTRACT = {
  [`${base.id}`]: SBC_CONTRACT_ADDRESS,
  [`${baseSepolia.id}`]: SBC_BASE_SEPOLIA_CONTRACT_ADDRESS,
  [`${radiusTestnet.id}`]: TestSBC_CONTRACT_ADDRESS,
};

export const MAX_FEE_PER_GAS = 100000000000;
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000;

// Radius Testnet Account Abstraction Addresses
export const RADIUS_TESTNET_ENTRY_POINT = "0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F";
export const RADIUS_TESTNET_SIMPLE_ACCOUNT_FACTORY = "0x7d8fB3E53d345601a02C3214e314f28668510b03";


