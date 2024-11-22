"use client";

import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const getLinkClass = (path: string) =>
    pathname === path
      ? "text-zinc-700 font-bold"
      : "text-violet-600 hover:text-violet-900 hover:font-bold";
  return (
    <nav className="fixed">
      <ul className="flex space-x-4">
        <li className="m-4 ml-8">
          <a
            href="https://swap.stablecoin.xyz"
            className={getLinkClass("/swap")}
            target="_blank"
          >
            Swap
          </a>
        </li>
        <li className="m-4">
          <a href="/" className={getLinkClass("/")}>
            MassPay
          </a>
        </li>
      </ul>
    </nav>
  );
}
