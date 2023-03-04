import winston from "winston";
import { Config, getConfig } from "./config";

export type Logger = winston.Logger;

function getLogLevel(config: Config) {
  if (config.logging.level) {
    return config.logging.level;
  }
  const nodeEnv = process.env.NODE_ENV || "development";
  return nodeEnv == "development" ? "debug" : "info";
}

export function getLogger(
  config: Config,
  options: { channel: string } = { channel: "default" },
): Logger {
  const logger = winston.createLogger({
    level: getLogLevel(config),
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { channel: options.channel },
    transports: [],
  });

  if (config.logging.console.enabled) {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }
  return logger;
}

export const defaultLogger = getLogger(getConfig());
export default defaultLogger;
