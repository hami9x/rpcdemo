function getEnv(name: string, defaultValue: any) {
  return (import.meta as any).env[name] ?? process.env[name] ?? defaultValue;
}

export function getConfig() {
  return {
    info: {
      name: getEnv("APP_INFO_NAME", "AuctionX"),
    },
    rpcEndpoint: getEnv("APP_RPC_ENDPOINT", "http://localhost:4001/rpc"),
  };
}

export const appConfig = getConfig();
console.log("using app config:", JSON.stringify(appConfig, null, 2));
