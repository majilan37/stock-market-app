"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import WatchlistButton from "@/components/WatchlistButton";

type WatchlistEntry = {
  symbol: string;
  company: string;
};

interface WatchlistManagerProps {
  items: WatchlistEntry[];
}

function WatchlistManager({ items }: WatchlistManagerProps) {
  const [list, setList] = useState(items);

  const sorted = useMemo(() => {
    return [...list].sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [list]);

  const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
    if (!isAdded) {
      setList((prev) => prev.filter((item) => item.symbol !== symbol));
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-neutral-950 p-6 text-gray-400">
        Your watchlist is empty. Use the stock details page to add symbols.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sorted.map((item) => (
        <div
          key={item.symbol}
          className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-neutral-950 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Link
              href={`/stocks/${item.symbol}`}
              className="text-lg font-semibold text-gray-100 hover:text-yellow-500"
            >
              {item.symbol}
            </Link>
            <p className="text-sm text-gray-400">{item.company}</p>
          </div>

          <WatchlistButton
            symbol={item.symbol}
            company={item.company}
            isInWatchlist={true}
            onWatchlistChange={handleWatchlistChange}
          />
        </div>
      ))}
    </div>
  );
}

export default WatchlistManager;
