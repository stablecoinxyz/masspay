import { parseUnits } from "viem";

export function fromReadableAmount(amount: number, decimals: number): BigInt {
  return parseUnits(amount.toString(), decimals);
}
