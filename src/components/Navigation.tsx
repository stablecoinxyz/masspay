"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  // const getLinkClass = (path: string) =>
  //   pathname === path
  //     ? "text-zinc-700 font-bold"
  //     : "text-violet-600 hover:text-violet-900 hover:font-bold";

  return (
    <nav className="fixed w-full bg-card flex flex-row z-50">
      <Link href="https://stablecoin.xyz" className="flex w-1/3 text-left p-4 ">
        <Image src="nav-sbc-logo.svg" alt="Stablecoin" width={24} height={24} />
        <h1 className="text-xl font-neutral ml-2">SBC</h1>
      </Link>

      <ul className="w-1/3 flex justify-center space-x-4">
        <li className="m-4 flex flex-row space-x-2 align-baseline">
          <Link href="https://swap.stablecoin.xyz">
            <div className="flex flex-row space-x-2 align-baseline">
              <Image src="nav-swap.svg" alt="Home" width={24} height={24} />
              <span>Swap</span>
            </div>
          </Link>
        </li>
        <li className="m-4 flex flex-row space-x-2 align-baseline">
          <Link href="/" className="font-bold">
            <div className="flex flex-row space-x-2 align-baseline">
              <Image src="nav-masspay.svg" alt="Home" width={24} height={24} />
              <span>MassPay</span>
            </div>
          </Link>
        </li>
      </ul>

      <div className="w-1/3 flex">&nbsp;</div>
    </nav>
  );
}
