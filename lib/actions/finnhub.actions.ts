"use server";

import { formatArticle, getDateRange, validateArticle } from "@/lib/utils";
import { cache } from "react";
import { POPULAR_STOCK_SYMBOLS } from "../constants";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "";

export const fetchJSON = async <T>(
  url: string,
  revalidateSeconds?: number,
): Promise<T> => {
  const response = await fetch(url, {
    cache: revalidateSeconds ? "force-cache" : "no-store",
    next: revalidateSeconds ? { revalidate: revalidateSeconds } : undefined,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `Finnhub request failed: ${response.status} ${response.statusText} ${message}`,
    );
  }

  return response.json() as Promise<T>;
};

const buildCompanyNewsUrl = (symbol: string, from: string, to: string) =>
  `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(
    symbol,
  )}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

const buildMarketNewsUrl = (category: string = "general") =>
  `${FINNHUB_BASE_URL}/news?category=${category}&token=${FINNHUB_API_KEY}`;

const getGeneralNews = async (): Promise<MarketNewsArticle[]> => {
  const url = buildMarketNewsUrl();
  const rawArticles = await fetchJSON<RawNewsArticle[]>(url);

  const sorted = rawArticles
    .filter(
      (article) => validateArticle(article) && typeof article.id === "number",
    )
    .sort((a, b) => (b.datetime ?? 0) - (a.datetime ?? 0));

  const seen = new Set<string>();
  const formatted: MarketNewsArticle[] = [];

  for (const article of sorted) {
    const key = `${article.id ?? ""}|${article.url ?? ""}|${
      article.headline ?? ""
    }`;

    if (seen.has(key)) continue;
    seen.add(key);

    formatted.push(formatArticle(article, false, undefined, formatted.length));

    if (formatted.length >= 6) break;
  }

  return formatted;
};

export const getNews = async (
  symbols?: string[],
): Promise<MarketNewsArticle[]> => {
  try {
    const cleanedSymbols = (symbols ?? [])
      .map((symbol) => symbol.trim().toUpperCase())
      .filter((symbol) => symbol.length > 0);

    if (cleanedSymbols.length === 0) {
      return await getGeneralNews();
    }

    const { from, to } = getDateRange(5);
    const symbolCache = new Map<string, RawNewsArticle[]>();
    const symbolIndex = new Map<string, number>();
    const usedKeys = new Set<string>();
    const collected: MarketNewsArticle[] = [];

    for (let round = 0; round < 6; round += 1) {
      const symbol = cleanedSymbols[round % cleanedSymbols.length];
      let articles = symbolCache.get(symbol);

      if (!articles) {
        const url = buildCompanyNewsUrl(symbol, from, to);
        articles = await fetchJSON<RawNewsArticle[]>(url);
        symbolCache.set(symbol, articles);
        symbolIndex.set(symbol, 0);
      }

      const startIndex = symbolIndex.get(symbol) ?? 0;
      let selectedArticle: RawNewsArticle | undefined;

      for (let i = startIndex; i < articles.length; i += 1) {
        const article = articles[i];
        if (!validateArticle(article)) continue;

        const key = `${article.id ?? ""}|${article.url ?? ""}|${
          article.headline ?? ""
        }`;
        if (usedKeys.has(key)) continue;

        usedKeys.add(key);
        selectedArticle = article;
        symbolIndex.set(symbol, i + 1);
        break;
      }

      if (selectedArticle) {
        collected.push(
          formatArticle(selectedArticle, true, symbol, collected.length),
        );
      }
    }

    const sorted = collected
      .sort((a, b) => b.datetime - a.datetime)
      .slice(0, 6);

    if (sorted.length === 0) {
      return await getGeneralNews();
    }

    return sorted;
  } catch (error) {
    console.log("Error fetching news: ", error);
    throw new Error("Failed to fetch news");
  }
};

export const searchStocks = cache(
  async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
      const token = FINNHUB_API_KEY;
      if (!token) {
        // If no token, log and return empty to avoid throwing per requirements
        console.error(
          "Error in stock search:",
          new Error("FINNHUB API key is not configured"),
        );
        return [];
      }

      const trimmed = typeof query === "string" ? query.trim() : "";

      let results: FinnhubSearchResult[] = [];

      if (!trimmed) {
        // Fetch top 10 popular symbols' profiles
        const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
        const profiles = await Promise.all(
          top.map(async (sym) => {
            try {
              const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
              // Revalidate every hour
              const profile = await fetchJSON<any>(url, 3600);
              return { sym, profile } as { sym: string; profile: any };
            } catch (e) {
              console.error("Error fetching profile2 for", sym, e);
              return { sym, profile: null } as { sym: string; profile: any };
            }
          }),
        );

        results = profiles
          .map(({ sym, profile }) => {
            const symbol = sym.toUpperCase();
            const name: string | undefined =
              profile?.name || profile?.ticker || undefined;
            const exchange: string | undefined = profile?.exchange || undefined;
            if (!name) return undefined;
            const r: FinnhubSearchResult = {
              symbol,
              description: name,
              displaySymbol: symbol,
              type: "Common Stock",
            };
            // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
            // To keep pipeline simple, attach exchange via closure map stage
            // We'll reconstruct exchange when mapping to final type
            (r as any).__exchange = exchange; // internal only
            return r;
          })
          .filter((x): x is FinnhubSearchResult => Boolean(x));
      } else {
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
        const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
        results = Array.isArray(data?.result) ? data.result : [];
      }

      const mapped: StockWithWatchlistStatus[] = results
        .map((r) => {
          const upper = (r.symbol || "").toUpperCase();
          const name = r.description || upper;
          const exchangeFromDisplay =
            (r.displaySymbol as string | undefined) || undefined;
          const exchangeFromProfile = (r as any).__exchange as
            | string
            | undefined;
          const exchange = exchangeFromDisplay || exchangeFromProfile || "US";
          const type = r.type || "Stock";
          const item: StockWithWatchlistStatus = {
            symbol: upper,
            name,
            exchange,
            type,
            isInWatchlist: false,
          };
          return item;
        })
        .slice(0, 15);

      return mapped;
    } catch (err) {
      console.error("Error in stock search:", err);
      return [];
    }
  },
);
