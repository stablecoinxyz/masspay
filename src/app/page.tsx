"use client";
import Image from "next/image";
import { Fragment, useState } from "react";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { Hex, isAddress, formatUnits } from "viem";
import { ConnectWallet } from "@/components/ConnectWallet";
import { getScannerUrl } from "@/lib/providers";
import { SBC } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { btnClasses } from "./constants";

import { CsvImporter } from "@/components/CsvImporter";
import { estimateGasForMassPay, executeGaslessMassPay } from "@/lib/masspay";
import { chain, CurrentConfig, dataConfig, type DataConfig } from "@/config";

export default function MassPayPage() {
  const account = useAccount();
  const { address, isConnected } = account;
  const { data: wallet, isFetched } = useWalletClient();
  if (isFetched && isConnected) {
    CurrentConfig.wallet = wallet!;
    CurrentConfig.account = account!;
  }

  const [csvMode, setCsvMode] = useState<boolean>(false);
  const [addrAmt, setAddrAmt] = useState<string>("");
  const [csvData, setCsvData] = useState<DataConfig>(dataConfig);
  const [txCompleted, setTxCompleted] = useState<boolean>(true);

  const { toast } = useToast();

  const {
    data: sbcBalance,
    isLoading: isSbcLoading,
    isError: isSbcError,
  } = useBalance({
    address,
    token: SBC[chain.network].address as Hex,
  });

  const placeholder = `e.g.
0xB5f6fECd59dAd3d5bA4Dfe8FcCA6617CE71B99f9, 0.01
0x589c0e47DE10e0946e2365580B700790AAAbe9f7, 0.001
...
`;

  return (
    <main className="px-4 pb-10 min-h-[100vh] min-w-[600] flex items-top justify-center container max-w-screen-lg mx-auto">
      <div className="w-3/5 min-w-[540px]">
        <Header />

        <div className="mx-auto min-w-[360px]">
          <WalletCard />
          <MassPayCard />
          <Disclaimer />
        </div>
      </div>
    </main>
  );

  /**
   *
   * @param addrAmt input string of addresses and amounts
   * @returns true if the input only contains valid addresses, false otherwise
   */
  function isValid(addrAmt: string): boolean {
    const lines = addrAmt.split("\n");
    if (lines.length === 0) {
      return false;
    }

    for (const line of lines) {
      const [addr, amt] = line.split(",");
      if (!addr || !amt || isNaN(parseFloat(amt))) {
        return false;
      }
      if (parseFloat(amt) <= 0) {
        return false;
      }
      // check for valid ethereum address
      if (!isAddress(addr.trim())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get the total amount to send
   * @param addrAmt input string of addresses and amounts
   * @returns {string} total amount to send
   */
  function getTotalAmtToSend(addrAmt: string): string {
    const totalAmtToSend = addrAmt
      .split("\n")
      .map((line) => line.split(",")[1])
      .reduce((acc, val) => acc + parseFloat(val), 0)
      .toFixed(6);
    return totalAmtToSend;
  }

  /**
   *
   * @param txs - array of transactions
   * @returns {Promise<bigint>} - gas cost for the mass pay transaction
   */
  async function estimateGas(txs: any): Promise<bigint> {
    try {
      const gasCost = await estimateGasForMassPay(txs);
      return gasCost;
    } catch (error) {
      toast({
        title: "Gas Estimation Failed",
        description: `There was an error sending your transaction. Please try again later.`,
        duration: 3000,
      });
      return BigInt(0);
    }
  }

  /**
   * Handles the form submission event.
   *
   * @param {React.FormEvent<HTMLElement>} evt - The form submission event.
   * @returns {Promise<void>} A promise that resolves when the form submission handling is complete.
   */
  async function handleSubmit(
    evt: React.FormEvent<HTMLElement>,
  ): Promise<void> {
    evt.preventDefault();
    toast({
      title: "Preparing MassPay",
      description: `Please wait while we process your transaction...`,
      duration: 8000,
    });

    try {
      const txs = addrAmt.split("\n").map((line) => {
        const [addr, amt] = line.split(",");
        return {
          to: addr.trim(),
          value: parseFloat(amt.trim()),
        };
      });

      const txHash = await executeGaslessMassPay(txs);

      if (txHash.startsWith("Error")) {
        toast({
          title: "Something went wrong",
          description: `There was an error sending your transaction. ${txHash}.`,
          duration: 7000,
        });

        return; // exit early
      }

      console.debug(getScannerUrl(chain.id, txHash));

      toast({
        title: "Transaction Sent",
        action: (
          <ToastAction altText="View on BaseScan">View Status</ToastAction>
        ),
        description: `🎉 Check your transaction status 👉🏻`,
        duration: 10000,
        onClick: () => {
          window.open(getScannerUrl(chain.id, txHash));
        },
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Transaction Failed",
        description: `There was an error sending your transaction. Please try again later.`,
        duration: 8000,
      });
    }

    resetData();
  }

  function Header() {
    return (
      <header className="flex flex-col items-center my-20 mb-6">
        <Image src="/globus.svg" width={42} height={42} alt="Globe" />
        <h1 className="my-4 text-3xl font-semibold tracking-tighter">
          MassPay
        </h1>
        <div className="flex flex-col items-center mt-2 text-center">
          Send payments to multiple recipients with zero gas fees, powered by
          Stablecoin.xyz. We support up to 200 recipients per transaction.
        </div>
      </header>
    );
  }

  function Disclaimer() {
    return (
      <div className="text-center mt-4 text-xs text-gray-500">
        <div>
          <strong>Disclaimer:</strong> This tool is provided &quot;as-is&quot;
          without warranty. Double-check all recipient addresses and payment
          amounts before proceeding to ensure accuracy.
        </div>
      </div>
    );
  }

  function WalletCard() {
    return (
      <div className=" bg-card rounded w-auto">
        <div className="flex flex-col relative items-start p-6">
          <h2 className="text-xl font-medium">Your wallet</h2>

          {isConnected && isFetched ? (
            <p className="text-sm text-mutedForeground">
              Wallet is now linked and ready for transactions
            </p>
          ) : (
            <p className="text-xs text-mutedForeground">
              Link your wallet on the Base network to start sending payments
            </p>
          )}

          {wallet && sbcBalance && <BalanceTable />}

          <div className="ml-auto absolute top-[3.8rem] right-6">
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  function BalanceTable() {
    return (
      <div className="flex flex-col items-center mt-4 w-full">
        <table className="text-base text-mutedForeground bg-mutedBackground border rounded-lg border-border">
          <thead>
            <tr className="text-mutedForeground">
              <th className="px-4 pt-4 w-5/6 text-left">Currency</th>
              <th className="px-4 pt-4 text-center">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-mutedForeground">
              <td className="px-4 pb-4 w-5/6 text-lg text-foreground flex items-start space-x-2">
                <Image
                  className="mt-1"
                  src="/sbclogo.svg"
                  width={24}
                  height={24}
                  alt="SBC"
                />
                <span className="ml-2 mt-1">SBC</span>
              </td>
              <td className="px-4 pb-4 text-lg text-foreground text-center">
                {sbcBalance && Number(sbcBalance.formatted).toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  function MassPayCard() {
    return (
      <div className=" bg-card rounded w-auto">
        <div className="flex justify-center space-x-4 mt-4">
          <div
            className={`p-4 ${!csvMode ? "border-b-2 border-violet-600" : ""}`}
          >
            <button
              className={`text-lg ${!csvMode ? "text-cardForeground" : ""}`}
              onClick={() => setCsvMode(false)}
            >
              Manual
            </button>
          </div>
          <div
            className={`p-4 ${csvMode ? "border-b-2 border-violet-600" : ""}`}
          >
            <button
              className={`text-lg ${csvMode ? "text-cardForeground" : ""}`}
              onClick={() => setCsvMode(true)}
            >
              Upload CSV
            </button>
          </div>
        </div>
        <MassPayCardValues />
      </div>
    );
  }

  function MassPayCardValues() {
    return (
      <div className="flex flex-col items-center p-6">
        {isFetched && isConnected ? (
          csvMode ? (
            <CsvMode />
          ) : (
            <CopyPasteMode />
          )
        ) : (
          <>
            <Image alt="wallet" src="walletIcon.svg" width={36} height={36} />
            <div className="text-2xl my-4">Connect your wallet</div>
            <div className="text-mutedForeground">
              Start by connecting your wallet
            </div>
          </>
        )}
      </div>
    );
  }

  function resetData() {
    setAddrAmt("");
    setCsvData(dataConfig);
  }

  function PreviewDialog() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className={btnClasses} disabled={!isValid(addrAmt)}>
            Proceed to Payment
          </button>
        </DialogTrigger>
        {addrAmt && (
          <button
            className="text-mutedForeground hover:font-semibold w-full mt-2 py-3"
            onClick={() => resetData()}
          >
            Start Over
          </button>
        )}
        <DialogContent className="sm:max-w-[600px] bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Confirm Recipients And Amounts</DialogTitle>
            <DialogDescription className="my-2 py-2">
              <Fragment>
                Please verify the details below before sending your SBC.
                Double-check recipient addresses and amounts to ensure
                everything is accurate.
              </Fragment>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-6 items-center text-sm text-mutedForeground pt-2">
            <div className="col-span-5 text-sm font-extrabold p-2">Address</div>
            <div className="col-span-1 text-sm font-extrabold text-right p-2">
              Amount
            </div>

            {addrAmt.split("\n").map((line, idx) => {
              const [addr, amt] = line.split(",");
              if (idx < 3 || idx > addrAmt.split("\n").length - 4) {
                return (
                  <Fragment key={idx}>
                    <div className="col-span-5 text-sm text-foreground p-2 border border-border relative">
                      {addr}
                    </div>
                    <div className="col-span-1 border border-border p-2 text-foreground text-right">
                      {amt}
                    </div>
                  </Fragment>
                );
              } else if (idx === 3) {
                return (
                  <div key={idx} className="col-span-6">
                    <div className="text-sm text-center p-2">...</div>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>

          <div className="grid grid-cols-2 text-sm text-mutedForeground mt-4">
            <div className="">Beginning balance:</div>
            <div className="text-right">
              {sbcBalance && Number(sbcBalance.formatted).toFixed(6)}
            </div>
            <div className="">Recipients:</div>
            <div className="text-right">
              {addrAmt.split("\n").length} addresses
            </div>
            <div className="">Total amount to send:</div>
            <div className="text-right">
              {sbcBalance && getTotalAmtToSend(addrAmt)}
            </div>
            <div className="">Ending balance:</div>
            <div className="text-right">
              {sbcBalance &&
                (
                  Number(sbcBalance.formatted) -
                  Number(getTotalAmtToSend(addrAmt))
                ).toFixed(6)}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              className={btnClasses}
              onClick={async (e) => await handleSubmit(e)}
              disabled={!isValid(addrAmt)}
            >
              Send
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function CopyPasteMode() {
    return (
      <>
        <div className="text-2xl my-4 text-left w-full">
          Enter payment details
        </div>
        <div className="text-mutedForeground text-sm">
          Provide recipient addresses and payment amounts separated by commas.
          You can also upload a CSV file for bulk payments.
        </div>

        <textarea
          id="addressesAmounts"
          key="addressesAmounts"
          value={addrAmt}
          className="w-full h-48 mt-4 p-2 bg-background border border-border rounded-lg text-sm"
          placeholder={placeholder}
          onChange={(e) => setAddrAmt(e.target.value.trim())}
        />
        <div className="my-6 w-full">
          <PreviewDialog />
        </div>
      </>
    );
  }

  function CsvMode() {
    return (
      <>
        <div className="text-gray-500 my-4">
          <div className="flex flex-col gap-4 pt-8">
            {!addrAmt && (
              <>
                <CsvImporter
                  fields={[
                    { label: "Address", value: "address", required: true },
                    { label: "Amount", value: "amount", required: true },
                  ]}
                  onImport={(parsedData) => {
                    const formattedData: DataConfig = parsedData.map(
                      (item) => ({
                        address: String(item.address ?? ""),
                        amount: String(item.amount ?? ""),
                      }),
                    );

                    setCsvData((prev) => [...prev, ...formattedData]);

                    const addrAmtData = formattedData
                      .map((item) => `${item.address},${item.amount}`)
                      .join("\n");

                    setAddrAmt(addrAmtData);
                  }}
                  className="self-end"
                  disabled={!isConnected}
                />
                <span className="text-center text-sm mb-8">
                  Note: the first row of your CSV file must be:{" "}
                  <code className="bg-secondaryBackground px-1 mx-1">
                    address,amount
                  </code>
                </span>
              </>
            )}

            {csvData && csvData.length > 0 && isValid(addrAmt) && (
              <div className="w-full text-center text-xl">
                🔎 {csvData.length} rows of data found.
              </div>
            )}
            {addrAmt && !isValid(addrAmt) && (
              <div className="rounded-md border w-full text-center">
                ⚠️ Please check your data and try again.
                <button
                  className="text-violet-600 hover:font-semibold w-full mt-2 py-3"
                  onClick={() => resetData()}
                >
                  Start Over
                </button>
              </div>
            )}
            {addrAmt && isValid(addrAmt) && <PreviewDialog />}
          </div>
        </div>
      </>
    );
  }
}
