import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";

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
          <div className="bg-background text-foreground">
            <Navigation />
            <div className="py-12">{children}</div>
          </div>
        </Web3Provider>
        <Toaster />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "SBC MassPay",
  description: "Send mass payouts for free using SBC's gasless MassPay",
  keywords: "SBC, Stable Coin, stablecoins, masspay, payouts, crypto",
};
