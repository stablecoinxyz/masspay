"use client";

import { DataConfig } from "@/config";
import { memo } from "react";
import { PreviewDialog } from "@/components/PreviewDialog";
import { CsvImporter } from "@/components/CsvImporter";

const CsvMode = memo(
  ({
    addrAmt,
    onChange,
    resetData,
    csvData,
    setCsvData,
    isConnected,
    isValid,
    sbcBalance,
    handleSubmit,
  }: {
    addrAmt: string;
    onChange: (value: string) => void;
    resetData: () => void;
    csvData: DataConfig;
    setCsvData: (data: DataConfig) => void;
    isConnected: boolean;
    isValid: (addrAmt: string) => boolean;
    sbcBalance: {
      decimals: number;
      formatted: string;
      symbol: string;
      value: bigint;
    };
    handleSubmit: any;
  }) => {
    const handleChangeAddrAmt = (data: string) => {
      onChange(data);
    };
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

                    setCsvData([...csvData, ...formattedData]);

                    const addrAmtData = formattedData
                      .map((item) => `${item.address},${item.amount}`)
                      .join("\n");

                    handleChangeAddrAmt(addrAmtData);
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
              <div className="w-full text-center text-lg">
                🔎 {csvData.length} rows of data found.{" "}
                {/* {csvData.length > 200 && (
                  <span className="text-red-500">
                    Masspay supports up to 200 recipients. Please adjust your
                    data and try again.
                  </span>
                )} */}
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
            {addrAmt && isValid(addrAmt) && (
              <PreviewDialog
                addrAmt={addrAmt}
                sbcBalance={sbcBalance}
                resetData={resetData}
                handleSubmit={handleSubmit}
                isValid={isValid}
              />
            )}
          </div>
        </div>
      </>
    );
  },
);

export { CsvMode };
