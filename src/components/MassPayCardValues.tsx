"use client";
import { DataConfig } from "@/config";
import { memo } from "react";
import { CsvMode } from "./CsvMode";
import { CopyPasteMode } from "./CopyPasteMode";
import Image from "next/image";

const MassPayCardValues = memo(
  ({
    csvMode,
    addrAmt,
    onChange,
    isFetched,
    isValid,
    isConnected,
    resetData,
    csvData,
    setCsvData,
    sbcBalance,
    handleSubmit,
  }: {
    csvMode: boolean;
    addrAmt: string;
    onChange: (value: string) => void;
    isFetched: boolean;
    isConnected: boolean;
    isValid: (addrAmt: string) => boolean;
    resetData: () => void;
    csvData: DataConfig;
    setCsvData: (data: DataConfig) => void;
    sbcBalance: any;
    handleSubmit: any;
  }) => {
    return (
      <div className="flex flex-col items-center p-6">
        {isFetched && isConnected ? (
          csvMode ? (
            <CsvMode
              addrAmt={addrAmt}
              onChange={onChange}
              resetData={resetData}
              csvData={csvData}
              setCsvData={setCsvData}
              isConnected={isConnected}
              isValid={isValid}
              sbcBalance={sbcBalance}
              handleSubmit={handleSubmit}
            />
          ) : (
            <CopyPasteMode
              addrAmt={addrAmt}
              onChange={onChange}
              resetData={resetData}
              sbcBalance={sbcBalance}
              handleSubmit={handleSubmit}
              isValid={isValid}
            />
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
  },
);

export { MassPayCardValues };
