import { Chain, defineChain } from 'viem'

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
  testnet: true,
}) as unknown as Chain;

