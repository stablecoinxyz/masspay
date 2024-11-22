import { ethers } from "ethers";

export function fromReadableAmount(amount: number, decimals: number): BigInt {
  return ethers.parseUnits(amount.toString(), decimals);
}
