"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  // const getLinkClass = (path: string) =>
  //   pathname === path
  //     ? "text-zinc-700 font-bold"
  //     : "text-violet-600 hover:text-violet-900 hover:font-bold";

  return (
    <nav className="fixed w-full">
      <ul className="flex justify-center space-x-4">
        <li className="m-4">
          <Link href="https://swap.stablecoin.xyz">Swap</Link>
        </li>
        <li className="m-4">
          <Link href="/" className="font-bold">
            MassPay
          </Link>
        </li>
      </ul>
    </nav>
  );
}
