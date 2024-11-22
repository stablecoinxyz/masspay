import { ChainId, Token } from "@uniswap/sdk-core";

// Currencies and Tokens
export const SBC_CONTRACT_ADDRESS =
  "0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798";

export const SBC = new Token(
  ChainId.BASE,
  SBC_CONTRACT_ADDRESS,
  18,
  "SBC",
  "Stable Coin",
);

export const MAX_FEE_PER_GAS = 100000000000;
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000;
