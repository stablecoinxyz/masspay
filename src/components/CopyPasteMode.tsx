"use client";

import { memo } from "react";
import { PreviewDialog } from "@/components/PreviewDialog";

const placeholder = `e.g.
0xB5f6fECd59dAd3d5bA4Dfe8FcCA6617CE71B99f9, 0.01
0x589c0e47DE10e0946e2365580B700790AAAbe9f7, 0.001
...
`;

const CopyPasteMode = memo(
  ({
    addrAmt,
    onChange,
    resetData,
    handleSubmit,
    sbcBalance,
    isValid,
  }: {
    addrAmt: string;
    onChange: (value: string) => void;
    resetData: () => void;
    handleSubmit: any;
    sbcBalance: any;
    isValid: (addrAmt: string) => boolean;
  }) => {
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };
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
          key="addrAmt"
          value={addrAmt}
          className="w-full h-48 mt-4 p-2 bg-background border border-border rounded-lg text-sm"
          placeholder={placeholder}
          onChange={handleTextChange}
        />

        <div className="my-6 w-full">
          <PreviewDialog
            addrAmt={addrAmt}
            sbcBalance={sbcBalance}
            resetData={resetData}
            handleSubmit={handleSubmit}
            isValid={isValid}
          />
        </div>
      </>
    );
  },
);

export { CopyPasteMode };
