import mongoose from "mongoose";

const MONGO_DB_URI = process.env.MONGO_DB_URI || "";

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDB() {
  if (!MONGO_DB_URI) {
    throw new Error("MONGO_DB_URI must be set in .env file");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_DB_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  console.log("Connected to DB " + process.env.NODE_ENV + " - " + MONGO_DB_URI);
}
