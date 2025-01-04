"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useWalletClient } from "wagmi";
import { Chain, Hex, isAddress } from "viem";
import { ConnectWallet } from "@/components/ConnectWallet";
import { MassPayCard } from "@/components/MassPayCard";
import { ToastAction } from "@/components/ui/toast";
import { getScannerUrl } from "@/lib/providers";
import { SBC } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { executeGaslessMassPay } from "@/lib/masspay";
import { CurrentConfig, dataConfig, type DataConfig } from "@/config";
import { base, baseSepolia } from "viem/chains";

export default function MassPayPage() {
  const account = useAccount();
  const { address, isConnected, chain } = account;
  const { data: wallet, isFetched } = useWalletClient();

  const [sbcBalance, setSbcBalance] = useState<{
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint;
  }>({
    decimals: 0,
    formatted: "0",
    symbol: "SBC",
    value: BigInt(0),
  });
  const [currentChain, setCurrentChain] = useState<Chain>(base);
  const [csvMode, setCsvMode] = useState<boolean>(false);
  const [addrAmt, setAddrAmt] = useState<string>("");
  const [csvData, setCsvData] = useState<DataConfig>(dataConfig);

  if (isFetched && isConnected) {
    CurrentConfig.wallet = wallet!;
    CurrentConfig.account = account!;
  }

  const { toast } = useToast();

  const {
    data: sbcBaseBalance,
    isLoading: isSbcBaseLoading,
    isError: isSbcBaseError,
  } = useBalance({
    address,
    token: SBC[base.id].address as Hex,
  });

  const {
    data: sbcBaseSepoliaBalance,
    isLoading: isSbcBaseSepoliaLoading,
    isError: isSbcBaseSepoliaError,
  } = useBalance({
    address,
    token: SBC[baseSepolia.id].address as Hex,
  });

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
   * Handles the form submission event.
   *
   * @param {React.FormEvent<HTMLElement>} evt - The form submission event.
   * @returns {Promise<void>} A promise that resolves when the form submission handling is complete.
   */
  async function handleSubmit(
    evt: React.FormEvent<HTMLElement>,
  ): Promise<void> {
    evt.preventDefault();

    if (!isValid(addrAmt)) {
      toast({
        title: "Invalid Input",
        description: `Please check your input and try again.`,
        duration: 5000,
      });
      return;
    }

    const totalAmtToSend = addrAmt
      .split("\n")
      .map((line) => line.split(",")[1])
      .reduce((acc, val) => acc + parseFloat(val), 0);

    if (totalAmtToSend > parseFloat(sbcBalance.formatted)) {
      toast({
        title: "Insufficient Balance",
        description: `You do not have enough balance to send ${totalAmtToSend.toFixed(
          6,
        )} SBC.`,
        duration: 5000,
      });
      return;
    }

    if (addrAmt.split("\n").length > 200) {
      toast({
        title: "Too many recipients",
        description: `MassPay supports up to 200 recipients per transaction. Please reduce the number of recipients and try again.`,
        duration: 5000,
      });
      return;
    }

    toast({
      title: "Preparing MassPay",
      description: `Please wait while we process your transaction...`,
      duration: 8000,
    });

    try {
      const chain = currentChain;
      const txs = addrAmt.split("\n").map((line) => {
        const [addr, amt] = line.split(",");
        return {
          to: addr.trim(),
          value: parseFloat(amt.trim()),
        };
      });

      const txHash = await executeGaslessMassPay(txs, chain);

      if (txHash.startsWith("Error")) {
        toast({
          title: "Something went wrong",
          description: `There was an error sending your transaction. ${txHash}.`,
          duration: 7000,
        });

        return; // exit early
      }

      console.debug(getScannerUrl((chain as Chain).id, txHash));

      toast({
        title: "Transaction Sent",
        action: (
          <ToastAction altText="View on BaseScan">View Status</ToastAction>
        ),
        description: `🎉 Check your transaction status 👉🏻`,
        duration: 20000,
        onClick: () => {
          window.open(getScannerUrl((chain as Chain).id, txHash));
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

  useEffect(() => {
    setCurrentChain(chain as Chain);
  }, [chain]);

  useEffect(() => {
    setSbcBalance(sbcBaseBalance!);
    if (chain?.id === base.id) {
      setSbcBalance(sbcBaseBalance!);
    } else if (chain?.id === baseSepolia.id) {
      setSbcBalance(sbcBaseSepoliaBalance!);
    }
  }, [sbcBaseBalance, sbcBaseSepoliaBalance, chain]);

  return (
    <main className="px-4 pb-10 min-h-[100vh] min-w-[600] flex items-top justify-center container max-w-screen-lg mx-auto">
      <div className="w-3/5 min-w-[540px]">
        <Header />

        <div className="mx-auto min-w-[360px]">
          <WalletCard />
          <MassPayCard
            csvMode={csvMode}
            setCsvMode={setCsvMode}
            addrAmt={addrAmt}
            onChange={setAddrAmt}
            isFetched={isFetched}
            isConnected={isConnected}
            isValid={isValid}
            resetData={resetData}
            csvData={csvData}
            setCsvData={setCsvData}
            sbcBalance={sbcBalance}
            handleSubmit={handleSubmit}
          />
          <Disclaimer />
        </div>
      </div>
    </main>
  );

  function Header() {
    return (
      <header className="flex flex-col items-center my-20 mb-6">
        <Image src="/globus.svg" width={42} height={42} alt="Globe" />
        <h1 className="my-4 text-3xl font-semibold tracking-tighter">
          MassPay
        </h1>
        <div className="flex flex-col items-center mt-2 text-center">
          Send payments to multiple recipients with zero gas fees on Base,
          powered by SBC. This application supports sending up to 200 transfers
          at a time.
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
                {Number(sbcBalance!.formatted).toFixed(3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  function resetData() {
    setAddrAmt("");
    setCsvData(dataConfig);
  }
}
