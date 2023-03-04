import mongoose, { ClientSession } from "mongoose";
mongoose.set("strictQuery", false);

import { Snowflake } from "nodejs-snowflake";

import * as model from "./models";
import { Config } from "../config";

export class Storage {
  connectionPromise: Promise<typeof mongoose>;
  snowflake: Snowflake;

  values: mongoose.Model<model.KVEntry>;
  users: mongoose.Model<model.User>;

  constructor(private config: Config) {
    this.snowflake = new Snowflake({});

    this.values = mongoose.model<model.KVEntry>("values", model.KVEntrySchema);
    this.users = mongoose.model<model.User>("users", model.UserSchema);
  }

  connect() {
    const dbConfig = this.config.db;
    const dbUri = `mongodb+srv://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}/${dbConfig.database}?${dbConfig.queryParams}`;
    console.log(`connecting to database: ${dbUri}`);
    this.connectionPromise = mongoose.connect(dbUri).then((result) => {
      console.log("Connected to db successfully", { uri: dbUri });
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
}

export function getStorage(config: Config) {
  const storage = new Storage(config);
  storage.connect();
  return storage;
}
