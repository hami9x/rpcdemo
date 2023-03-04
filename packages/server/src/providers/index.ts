import { Config, getConfig } from "./config";
import { getLogger, Logger } from "./logger";
import { getStorage, Storage } from "./storage";

export interface Providers {
  logger: Logger;
  config: Config;
  storage: Storage;
}

export function getProviders(): Providers {
  const config = getConfig();
  return {
    config,
    logger: getLogger(config),
    storage: getStorage(config),
  };
}
