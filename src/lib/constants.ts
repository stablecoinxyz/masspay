import { Token } from "@uniswap/sdk-core";
import { base, baseSepolia } from "viem/chains";
import { radiusTestnet, radiusMainnet } from "./custom-network";

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

// SBC on Radius networks (same address on both testnet and mainnet)
const SBC_RADIUS_ADDRESS = "0x33ad9e4bd16b69b5bfded37d8b5d9ff9aba014fb";
const SBC_RADIUS_TESTNET = new Token(
  radiusTestnet.id,
  SBC_RADIUS_ADDRESS,
  6,
  "SBC",
  "Stable Coin",
);

const SBC_RADIUS_MAINNET = new Token(
  radiusMainnet.id,
  SBC_RADIUS_ADDRESS,
  6,
  "SBC",
  "Stable Coin",
);

export const SBC = {
  [`${base.id}`]: SBC_BASE,
  [`${baseSepolia.id}`]: SBC_BASE_SEPOLIA,
  [`${radiusTestnet.id}`]: SBC_RADIUS_TESTNET,
  [`${radiusMainnet.id}`]: SBC_RADIUS_MAINNET,
};

export const SBC_CONTRACT = {
  [`${base.id}`]: SBC_CONTRACT_ADDRESS,
  [`${baseSepolia.id}`]: SBC_BASE_SEPOLIA_CONTRACT_ADDRESS,
  [`${radiusTestnet.id}`]: SBC_RADIUS_ADDRESS,
  [`${radiusMainnet.id}`]: SBC_RADIUS_ADDRESS,
};

