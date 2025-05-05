# Account Setup

This document explains how to set up the environment variables for different account types.

## Account Types

The gasless-masspay system now supports multiple account types through a shared account utility. You can configure which account type to use via environment variables.

## Environment Variable Configuration

Add the following to your `.env` file:

```env
# Account type to use for smart account generation
# Options: simple, zerodev, alchemy, biconomy, safe, thirdweb, coinbase
NEXT_PUBLIC_ACCOUNT_TYPE=zerodev
```

## Available Account Types

- `simple`: Simple Smart Account (Default)
- `zerodev`: ZeroDev Kernel Smart Account
- `alchemy`: Alchemy Light Smart Account
- `biconomy`: Biconomy Nexus Smart Account
- `safe`: Safe Smart Account
- `thirdweb`: Thirdweb Smart Account
- `coinbase`: Coinbase Smart Account

## Usage in Code

If you want to directly specify the account type in your code, you can pass it as a parameter:

```typescript
// Use the default account type from environment variable
const result = await executeGaslessMassPay(transactions, chain);

// Or specify a specific account type
const result = await executeGaslessMassPay(transactions, chain, "zerodev");
```
