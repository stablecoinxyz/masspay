# masspay-example

This repo contains a utility allowing users to airdrop an ERC20 token (e.g. SBC) on the Base blockchain without having to pay for gas fees. It uses the [Pimlico](https://pimlico.io/) Paymaster and Account Abstraction SDK to send user operations and [WalletConnect](https://reown.com/) to connect to the user's wallet.

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

- `NEXT_PUBLIC_PIMLICO_API_KEY` - get your API key from the [Pimlico dashboard](https://dashboard.pimlico.io/)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - create a project and get its ID from the [WalletConnect dashboard](https://cloud.reown.com/)

## Run locally

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

## Author

- [@Ectsang](https://www.github.com/Ectsang)
