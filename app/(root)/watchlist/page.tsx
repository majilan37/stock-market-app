import WatchlistManager from "@/components/WatchlistManager";
import { getWatchlistItemsForUser } from "@/lib/actions/watchlist.actions";

export default async function WatchlistPage() {
  const items = await getWatchlistItemsForUser();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-100">Watchlist</h1>
        <p className="text-gray-400">
          Track and manage the stocks you care about.
        </p>
      </header>

      <WatchlistManager items={items} />
    </div>
  );
}
