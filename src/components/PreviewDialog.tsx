"use client";
import { Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { btnClasses } from "@/app/constants";

export function PreviewDialog({
  addrAmt,
  sbcBalance,
  resetData,
  handleSubmit,
  isValid,
}: {
  addrAmt: string;
  sbcBalance: any;
  resetData: () => void;
  handleSubmit: any;
  isValid: (addrAmt: string) => boolean;
}) {
  /**
   * Calculates and returns the total amount to send
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
              Double-check recipient addresses and amounts to ensure everything
              is accurate.
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
          >
            Send
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
