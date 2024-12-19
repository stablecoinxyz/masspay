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
      <div className="flex w-1/3 text-left p-4 ">
        <Image src="nav-sbc-logo.svg" alt="Stablecoin" width={24} height={24} />
        <h1 className="text-xl font-neutral ml-2">SBC</h1>
      </div>

      <ul className="w-1/3 flex justify-center space-x-4">
        <li className="m-4 flex flex-row space-x-2 align-baseline">
          <Image src="nav-swap.svg" alt="Home" width={24} height={24} />
          <Link href="https://swap.stablecoin.xyz">Swap</Link>
        </li>
        <li className="m-4 flex flex-row space-x-2 align-baseline">
          <Image src="nav-masspay.svg" alt="Home" width={24} height={24} />
          <Link href="/" className="font-bold">
            MassPay
          </Link>
        </li>
      </ul>

      <div className="w-1/3 flex">&nbsp;</div>
    </nav>
  );
}
