import _ from "lodash";
import { DeepPartial } from "@assignment1/core";

import { Config, getConfig } from "./config";
import { getLogger, Logger } from "./logger";
import { getStorage, Storage } from "./storage";

export interface Providers {
  logger: Logger;
  config: Config;
  storage: Storage;
}

export function getProviders(options: { configOverrides?: DeepPartial<Config> } = {}): Providers {
  const config = _.merge(getConfig(), options.configOverrides ?? {});
  return {
    config,
    logger: getLogger(config),
    storage: getStorage(config),
  };
}
