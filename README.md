# gasless-swap

This project is a simple web application that allows users to swap tokens on the Base blockchain without having to pay for gas fees. It uses the [Pimlico](https://pimlico.io/) Paymaster and Account Abstraction SDK to execute the swaps and [WalletConnect](https://reown.com/) to connect to the user's wallet.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

- `NEXT_PUBLIC_PIMLICO_API_KEY` - refer to the [Pimlico dashboard](https://dashboard.pimlico.io/)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - refer to the [WalletConnect dashboard](https://cloud.reown.com/)

## Run locally

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Create a production build

```bash
npm run build
```

Preview the production build

```bash
npm run start
```

## Deployment (Vercel)

Making commits or merging pull requests to the `main` branch will automatically deploy to Vercel (production environment at [https://swap.stablecoin.xyz](https://swap.stablecoin.xyz)).

## Author

- [@Ectsang](https://www.github.com/Ectsang)
