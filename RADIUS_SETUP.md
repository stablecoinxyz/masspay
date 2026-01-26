# Radius Testnet MassPay Setup

This guide explains how to set up and use MassPay on Radius Testnet.

## Overview

Radius Testnet uses custom ERC-4337 infrastructure with specific EntryPoint and SimpleAccountFactory addresses. This implementation includes:

- **Custom EntryPoint**: `0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F`
- **Custom SimpleAccountFactory**: `0x7d8fB3E53d345601a02C3214e314f28668510b03`
- **TestSBCPermit Token**: `0xbc14568925d9359a203b5c5c6de838c8baeebf5a` (with EIP-2612 permit support)

## Prerequisites

1. **Running Services** (from `account-abstraction/radius-demo`):
   - Paymaster service on port 3000
   - Alto bundler on port 4337

2. **TestSBC Token**:
   - Deployed at `0xbc14568925d9359a203b5c5c6de838c8baeebf5a`
   - Must have TSBC balance in your wallet

## Environment Setup

Add the following to your `.env` file:

```bash
# Required: Radius Testnet Account Abstraction URL
NEXT_PUBLIC_AA_RADIUS_TESTNET_URL=http://localhost:4337

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Account type (defaults to "simple")
NEXT_PUBLIC_ACCOUNT_TYPE=simple
```

## Start the Required Services

### Terminal 1: Paymaster Service
```bash
cd ../account-abstraction/paymaster-service
npm run start
```

### Terminal 2: Alto Bundler
```bash
cd ../account-abstraction/alto
./alto \
  --entrypoints "0xfA15FF1e8e3a66737fb161e4f9Fa8935daD7B04F" \
  --executor-private-keys "YOUR_EXECUTOR_PRIVATE_KEY" \
  --rpc-url "https://rpc.testnet.radiustech.xyz" \
  --network-name "radiusTestnet" \
  --port 4337
```

### Terminal 3: MassPay App
```bash
cd masspay
npm run dev
```

## How It Works

### 1. Custom Smart Account Implementation

The app uses a custom `toRadiusSimpleSmartAccount` function that:
- Uses the Radius-specific EntryPoint address
- Uses the Radius-specific SimpleAccountFactory address
- Maintains compatibility with the standard SimpleAccount interface

See `src/lib/radius-simple-account.ts` for implementation details.

### 2. Account Selection Logic

In `src/lib/account-utils.ts`, the `getSmartAccount` function detects Radius Testnet:

```typescript
// Special handling for Radius Testnet - use custom EntryPoint and Factory
if (chain.id === radiusTestnet.id && accountType.toLowerCase() === "simple") {
  return await toRadiusSimpleSmartAccount({
    client: publicClient,
    owner,
  });
}
```

### 3. Permit-Based Transfers

The masspay flow uses EIP-2612 permit signatures:
1. User signs a permit message (off-chain, gasless)
2. Smart account calls `permit()` to approve the transfer
3. Smart account calls `transferFrom()` to execute the transfers
4. Paymaster sponsors the gas fees

## Testing

1. **Connect Wallet**: Connect to Radius Testnet in your wallet
2. **Check Balance**: Ensure you have TSBC tokens
3. **Enter Recipients**: Add addresses and amounts
4. **Send**: Confirm the transaction

The transaction will:
- Create a UserOperation with permit + transferFrom calls
- Submit to the bundler via `http://localhost:4337`
- Get sponsored by the paymaster
- Execute on-chain

## Troubleshooting

### "Execution reverted" Error
- Ensure bundler and paymaster services are running
- Check that `NEXT_PUBLIC_AA_RADIUS_TESTNET_URL` is set correctly
- Verify you have TSBC balance

### "getSenderAddress failed" Error
- This was fixed by using custom EntryPoint/Factory addresses
- Ensure you're using the latest code with `toRadiusSimpleSmartAccount`

### "Invalid signature" Error
- Check that the permit signature is for the correct chain ID (72344)
- Verify the token contract supports EIP-2612 permit

## Architecture

```
User Wallet (EOA)
    ↓ (signs permit + UserOp)
Smart Account (SimpleAccount)
    ↓ (executes batch: permit + transfers)
TestSBCPermit Token
    ↓ (transfers tokens)
Recipients

Bundler (Alto) ← sponsors gas via Paymaster
    ↓
EntryPoint Contract
    ↓ (executes UserOperation)
Smart Account
```

## Key Files

- `src/lib/radius-simple-account.ts` - Custom SimpleAccount for Radius
- `src/lib/account-utils.ts` - Account factory with Radius detection
- `src/lib/masspay-testnet.ts` - MassPay execution logic
- `src/lib/constants.ts` - Token addresses and chain configs
- `account-abstraction/radius-demo/contracts/TestSBCPermit.sol` - Token contract

## References

- [ERC-4337 Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337)
- [EIP-2612 Permit](https://eips.ethereum.org/EIPS/eip-2612)
- [Permissionless.js](https://docs.pimlico.io/permissionless)
- [Viem Account Abstraction](https://viem.sh/account-abstraction)
