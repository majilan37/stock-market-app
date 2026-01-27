"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";
import type { ObjectId } from "mongodb";

type BetterAuthUser = {
  _id?: ObjectId;
  id?: string;
  email?: string;
};

const getSessionUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
  };
};

export const getWatchlistSymbolsByEmail = async (
  email: string,
): Promise<string[]> => {
  try {
    if (!email) return [];

    const mongoose = await connectToDB();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Mongoose connection not connected");

    const user = await db.collection<BetterAuthUser>("user").findOne({ email });

    if (!user) return [];

    const userId = user.id ?? user._id?.toString();
    if (!userId) return [];

    const items = await Watchlist.find({ userId })
      .select("symbol -_id")
      .lean<{ symbol: string }[]>();

    return items.map((item) => item.symbol);
  } catch (error) {
    console.log("Error getting watchlist symbols: ", error);
    return [];
  }
};

export const isSymbolInWatchlist = async (
  email: string,
  symbol: string,
): Promise<boolean> => {
  try {
    if (!email || !symbol) return false;

    const mongoose = await connectToDB();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Mongoose connection not connected");
    const user = await db.collection<BetterAuthUser>("user").findOne({ email });
    if (!user) return false;

    const userId = user.id ?? user._id?.toString();
    if (!userId) return false;
    const normalizedSymbol = symbol.toUpperCase();
    const item = await Watchlist.findOne({
      userId,
      symbol: normalizedSymbol,
    }).lean();
    return !!item;
  } catch (error) {
    console.log("Error checking watchlist symbol: ", error);
    return false;
  }
};

export const addSymbolToWatchlist = async (
  email: string,
  symbol: string,
  company: string,
) => {
  try {
    if (!email || !symbol)
      return {
        success: false,
        error: "Please provide email & symbol",
      };

    const mongoose = await connectToDB();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Mongoose connection not connected");
    const user = await db.collection<BetterAuthUser>("user").findOne({ email });
    if (!user)
      return {
        success: false,
        error: "User not found",
      };

    const normalizedSymbol = symbol.toUpperCase();
    const userId = user.id ?? user._id?.toString();

    if (!userId)
      return {
        success: false,
        error: "User not found",
      };

    const existing = await Watchlist.findOne({
      userId,
      symbol: normalizedSymbol,
    }).lean();

    if (existing)
      return {
        success: true,
        message: `${company || normalizedSymbol} already in watchlist`,
      };

    await Watchlist.create({
      userId,
      symbol: normalizedSymbol,
      company: company || normalizedSymbol,
    });

    return {
      success: true,
      message: `${company} added to watchlist successfully`,
    };
  } catch (error) {
    console.log("Error adding symbol to watchlist: ", error);
    return {
      success: false,
      error: "Failed to add symbol to watchlist",
    };
  }
};

export const getWatchlistStatus = async (symbol: string) => {
  try {
    if (!symbol)
      return {
        success: false,
        isInWatchlist: false,
      };

    const user = await getSessionUser();
    if (!user)
      return {
        success: false,
        isInWatchlist: false,
      };

    const normalizedSymbol = symbol.toUpperCase();
    await connectToDB();
    const item = await Watchlist.findOne({
      userId: user.id,
      symbol: normalizedSymbol,
    }).lean();

    return {
      success: true,
      isInWatchlist: !!item,
    };
  } catch (error) {
    console.log("Error checking watchlist status: ", error);
    return {
      success: false,
      isInWatchlist: false,
    };
  }
};

export const getWatchlistItemsForUser = async () => {
  try {
    const user = await getSessionUser();
    if (!user) return [];

    await connectToDB();
    const items = await Watchlist.find({ userId: user.id })
      .select("symbol company -_id")
      .sort({ addedAt: -1 })
      .lean<{ symbol: string; company: string }[]>();

    return items.map((item) => ({
      symbol: item.symbol?.toUpperCase() ?? "",
      company: item.company ?? item.symbol ?? "",
    }));
  } catch (error) {
    console.log("Error loading watchlist items: ", error);
    return [];
  }
};

export const removeSymbolFromWatchlist = async (symbol: string) => {
  try {
    if (!symbol)
      return {
        success: false,
        error: "Please provide a symbol",
      };

    const user = await getSessionUser();
    if (!user)
      return {
        success: false,
        error: "Not authenticated",
      };

    const normalizedSymbol = symbol.toUpperCase();
    await connectToDB();

    const result = await Watchlist.findOneAndDelete({
      userId: user.id,
      symbol: normalizedSymbol,
    });

    return {
      success: true,
      isInWatchlist: false,
      message: result
        ? `${normalizedSymbol} removed from watchlist`
        : `${normalizedSymbol} was not in watchlist`,
    };
  } catch (error) {
    console.log("Error removing from watchlist: ", error);
    return {
      success: false,
      error: "Failed to remove symbol from watchlist",
    };
  }
};

export const addSymbolToWatchlistForUser = async (
  symbol: string,
  company: string,
) => {
  try {
    if (!symbol)
      return {
        success: false,
        error: "Please provide a symbol",
      };

    const user = await getSessionUser();
    if (!user)
      return {
        success: false,
        error: "Not authenticated",
      };

    const normalizedSymbol = symbol.toUpperCase();
    await connectToDB();

    const existing = await Watchlist.findOne({
      userId: user.id,
      symbol: normalizedSymbol,
    }).lean();

    if (existing)
      return {
        success: true,
        isInWatchlist: true,
        message: `${company || normalizedSymbol} already in watchlist`,
      };

    await Watchlist.create({
      userId: user.id,
      symbol: normalizedSymbol,
      company: company || normalizedSymbol,
    });

    return {
      success: true,
      isInWatchlist: true,
      message: `${company || normalizedSymbol} added to watchlist`,
    };
  } catch (error) {
    console.log("Error adding to watchlist: ", error);
    return {
      success: false,
      error: "Failed to add symbol to watchlist",
    };
  }
};

export const toggleWatchlistSymbol = async (
  symbol: string,
  company: string,
) => {
  const status = await getWatchlistStatus(symbol);

  if (!status.success) {
    return {
      success: false,
      isInWatchlist: false,
      error: "Unable to check watchlist status",
    };
  }

  if (status.isInWatchlist) {
    return removeSymbolFromWatchlist(symbol);
  }

  return addSymbolToWatchlistForUser(symbol, company);
};
