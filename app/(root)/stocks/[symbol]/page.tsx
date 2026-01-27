import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import { getWatchlistStatus } from "@/lib/actions/watchlist.actions";
import {
  BASELINE_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  SYMBOL_INFO_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
} from "@/lib/constants";

const SCRIPT_URL_BASE =
  "https://s3.tradingview.com/external-embedding/embed-widget-";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const normalizedSymbol = symbol.toUpperCase();
  const watchlistStatus = await getWatchlistStatus(normalizedSymbol);
  const isInWatchlist = watchlistStatus?.isInWatchlist ?? false;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <section className="flex flex-col gap-8">
        <TradingViewWidget
          scriptUrl={`${SCRIPT_URL_BASE}symbol-info.js`}
          config={SYMBOL_INFO_WIDGET_CONFIG(normalizedSymbol)}
          height={170}
        />
        <TradingViewWidget
          scriptUrl={`${SCRIPT_URL_BASE}advanced-chart.js`}
          config={CANDLE_CHART_WIDGET_CONFIG(normalizedSymbol)}
          height={600}
        />
        <TradingViewWidget
          scriptUrl={`${SCRIPT_URL_BASE}advanced-chart.js`}
          config={BASELINE_WIDGET_CONFIG(normalizedSymbol)}
          height={600}
        />
      </section>

      <section className="flex flex-col gap-8">
        <WatchlistButton
          symbol={normalizedSymbol}
          company={normalizedSymbol}
          isInWatchlist={isInWatchlist}
        />
        <TradingViewWidget
          scriptUrl={`${SCRIPT_URL_BASE}technical-analysis.js`}
          config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(normalizedSymbol)}
          height={400}
        />
        <TradingViewWidget
          scriptUrl={`${SCRIPT_URL_BASE}symbol-profile.js`}
          config={COMPANY_PROFILE_WIDGET_CONFIG(normalizedSymbol)}
          height={440}
        />
        <TradingViewWidget
          scriptUrl={`${SCRIPT_URL_BASE}financials.js`}
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(normalizedSymbol)}
          height={464}
        />
      </section>
    </div>
  );
}
