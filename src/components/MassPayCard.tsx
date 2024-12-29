"use client";
import { DataConfig } from "@/config";
import { memo } from "react";
import { MassPayCardValues } from "@/components/MassPayCardValues";

const MassPayCard = memo(
  ({
    csvMode,
    setCsvMode,
    addrAmt,
    onChange,
    isFetched,
    isConnected,
    isValid,
    resetData,
    csvData,
    setCsvData,
    sbcBalance,
    handleSubmit,
  }: {
    csvMode: boolean;
    setCsvMode: (value: boolean) => void;
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
      <div className=" bg-card rounded w-auto">
        <div className="flex justify-center space-x-4 mt-4">
          <div
            className={`p-4 ${!csvMode ? "border-b-2 border-violet-600" : ""}`}
          >
            <button
              className={`text-lg ${!csvMode ? "text-cardForeground" : ""}`}
              onClick={() => {
                setCsvMode(false);
                resetData();
              }}
            >
              Manual
            </button>
          </div>
          <div
            className={`p-4 ${csvMode ? "border-b-2 border-violet-600" : ""}`}
          >
            <button
              className={`text-lg ${csvMode ? "text-cardForeground" : ""}`}
              onClick={() => {
                setCsvMode(true);
                resetData();
              }}
            >
              Upload CSV
            </button>
          </div>
        </div>
        <MassPayCardValues
          csvMode={csvMode}
          addrAmt={addrAmt}
          onChange={onChange}
          isFetched={isFetched}
          isConnected={isConnected}
          isValid={isValid}
          resetData={resetData}
          csvData={csvData}
          setCsvData={setCsvData}
          sbcBalance={sbcBalance}
          handleSubmit={handleSubmit}
        />
      </div>
    );
  },
);

export { MassPayCard };
