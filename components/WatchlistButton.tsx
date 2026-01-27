"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleWatchlistSymbol } from "@/lib/actions/watchlist.actions";

function WatchlistButton({
  symbol,
  company,
  isInWatchlist,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) {
  const [pending, startTransition] = useTransition();
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist);

  const label = inWatchlist
    ? `Remove ${company || symbol} from Watchlist`
    : `Add ${company || symbol} to Watchlist`;

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleWatchlistSymbol(symbol, company);
      if (result?.success) {
        const nextState = Boolean(result.isInWatchlist);
        setInWatchlist(nextState);
        onWatchlistChange?.(symbol, nextState);
      }
    });
  };

  return (
    <div className="flex justify-end">
      <Button
        className="w-full sm:w-auto"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={inWatchlist}
        size={type === "icon" ? "icon" : "default"}
      >
        {pending ? "Updating..." : label}
      </Button>
    </div>
  );
}

export default WatchlistButton;
