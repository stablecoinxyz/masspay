import { defineChain } from 'viem'

export const radiusTestnet = defineChain({
  id: 72344,
  name: 'Radius Testnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.radiustech.xyz']
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://testnet.radiustech.xyz/testnet/explorer'
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862b2d0ef4486b2e6',
      blockCreated: 0,
    },
  },
  testnet: true,
});

export const radiusMainnet = defineChain({
  id: 723,
  name: 'Radius',
  network: 'radius',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.radiustech.xyz']
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://network.radiustech.xyz'
    },
  },
});

