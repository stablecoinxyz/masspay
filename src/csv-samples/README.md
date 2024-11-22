# How to Generate a sample CSV File

Use [Ethereum Wallet Generator](https://github.com/Planxnx/ethereum-wallet-generator) to generate addresses.

1. Pull the docker image:

```bash
docker pull planxthanee/ethereum-wallet-generator:latest
```

2. Generate 100 addresses and save them to a file:

```bash
docker run <image_id> -n 100 > airdrop.100.csv
```

3. Remove the unnecessary header and footer info. Then delete the seed phrases on each row.

4. Finally, add a header to the CSV file:

```bash
address,amount
<... rest of the CSV file>
```

You should now have a CSV file that has each generated address and the amount of token to send, looking something like this:

```csv
address,amount
0x1234567890abcdef1234567890abcdef12345678,0.001
0x1234567890abcdef1234567890abcdef12345678,0.001
```
