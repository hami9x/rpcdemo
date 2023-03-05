import mongoose, { ClientSession } from "mongoose";
mongoose.set("strictQuery", false);

import { Snowflake } from "nodejs-snowflake";

import * as model from "./models";
import { Config } from "../config";
import Debug from "debug";
const debug = Debug("server:storage");

export class Storage {
  connectionPromise: Promise<typeof mongoose>;
  snowflake: Snowflake;

  values: mongoose.Model<model.KVEntry>;
  users: mongoose.Model<model.User>;
  items: mongoose.Model<model.Item>;
  bids: mongoose.Model<model.Bid>;

  constructor(private config: Config) {
    this.snowflake = new Snowflake({});

    this.values = mongoose.model<model.KVEntry>("values", model.KVEntrySchema);
    this.users = mongoose.model<model.User>("users", model.UserSchema);
    this.items = mongoose.model<model.Item>("items", model.ItemSchema);
    this.bids = mongoose.model<model.Bid>("bids", model.BidSchema);
  }

  getDbUri() {
    const dbConfig = this.config.db;
    if (dbConfig.uri) {
      return dbConfig.uri;
    }
    return `mongodb+srv://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}?${dbConfig.queryParams}`;
  }

  connect() {
    const dbUri = this.getDbUri();
    debug(`connecting to database: ${dbUri}`);

    this.connectionPromise = mongoose.connect(dbUri).then((result) => {
      debug("Connected to db successfully", { uri: dbUri });
      return result;
    });
    return this.connectionPromise;
  }

  getConnection() {
    return this.connectionPromise;
  }

  async transact<R>(fn: (session: ClientSession) => R) {
    const connection = await this.getConnection();
    const session = await connection.startSession();
    let result: any;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result as R;
  }

  generateId() {
    return this.snowflake.getUniqueID().toString();
  }

  close() {
    return mongoose.disconnect();
  }
}

export function getStorage(config: Config) {
  const storage = new Storage(config);
  storage.connect();
  return storage;
}
