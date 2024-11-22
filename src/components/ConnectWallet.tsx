"use client";

import { ConnectKitButton } from "connectkit";

export function ConnectWallet() {
  return (
    <div className="flex flex-col -mt-8 mb-16 space-y-4">
      <ConnectKitButton />
    </div>
  );
}
