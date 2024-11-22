import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { ConnectWallet } from "@/components/ConnectWallet";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <div className="bg-violet-100 dark:bg-zinc-950 text-zinc-950 dark:text-neutral-100 ">
            <Navigation />
            <div className="fixed flex right-4 top-12">
              <ConnectWallet />
            </div>
            {children}
          </div>
        </Web3Provider>
        <Toaster />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Stable Coin | MassPay",
  description: "",
  keywords: "",
};
