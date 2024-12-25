import { ChainId, Token } from "@uniswap/sdk-core";
import { Chain } from "viem";
import { base, baseSepolia } from "viem/chains";

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

export const SBC = {
  base: SBC_BASE,
  "base-sepolia": SBC_BASE_SEPOLIA,
};

export const SBC_CONTRACT = {
  base: SBC_CONTRACT_ADDRESS,
  baseSepolia: SBC_BASE_SEPOLIA_CONTRACT_ADDRESS,
};

export const MAX_FEE_PER_GAS = 100000000000;
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000;
