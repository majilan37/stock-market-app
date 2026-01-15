"use server";

import { connectToDB } from "@/database/mongoose";
import Watchlist from "@/database/models/watchlist.model";
import type { ObjectId } from "mongodb";

type BetterAuthUser = {
  _id?: ObjectId;
  id?: string;
  email?: string;
};

export const getWatchlistSymbolsByEmail = async (
  email: string
): Promise<string[]> => {
  try {
    if (!email) return [];

    const mongoose = await connectToDB();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Mongoose connection not connected");

    const user = await db
      .collection<BetterAuthUser>("users")
      .findOne({ email });

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
