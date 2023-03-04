import _ from "lodash";
import { SignOptions } from "jsonwebtoken";

import { parseBoolean } from "@assignment1/core";

import dotenv from "dotenv-flow";
const env = _.merge(dotenv.config().parsed ?? {}, process?.env ?? {});

export interface Config {
  apiserver: {
    port: number;
  };
  db: {
    user: string;
    password: string;
    host: string;
    database: string;
    queryParams: string;
  };
  logging: {
    level?: string;
    maxBodyLength: number;
    console: {
      enabled: boolean;
    };
  };
  auth: {
    jwtSecret: string;
    jwtOptions: SignOptions;
  };
}

export function getConfig(): Config {
  return {
    apiserver: {
      port: parseInt(env.SERVER_PORT || "") || 4001,
    },
    db: {
      user: env.DB_MONGO_USER || "",
      password: env.DB_MONGO_PASSWORD || "",
      host: env.DB_MONGO_HOST || "",
      database: env.DB_MONGO_DATABASE || "",
      queryParams: env.DB_MONGO_QUERY_PARAMS || "retryWrites=true&compressors=zlib",
    },
    logging: {
      level: env.LOG_LEVEL || undefined,
      maxBodyLength: parseInt(env.LOG_MAX_BODY_LENGTH ?? "") || 1000,
      console: {
        enabled: parseBoolean(env.LOGGING_CONSOLE_ENABLED ?? "", true),
      },
    },
    auth: {
      jwtSecret: env.JWT_SECRET || "defaultsecret",
      jwtOptions: {
        expiresIn: env.JWT_EXPIRES_IN || "365d",
      },
    },
  };
}
