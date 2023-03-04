import React, { useContext, useState } from "react";
import { appConfig } from "../config";
import { RpcClient } from "./client";

export interface RpcSessionContextValue {
  rpcClient: RpcClient;
  setRpcClient: React.Dispatch<React.SetStateAction<RpcClient>>;
  authenticate: (token: string) => void;
}

export const RpcSessionContext = React.createContext<RpcSessionContextValue>({
  rpcClient: getDefaultRpcClient(),
  setRpcClient: () => {},
  authenticate: () => {},
});

export function useRpcService() {
  const { rpcClient } = useContext(RpcSessionContext);
  return rpcClient.service;
}

function getDefaultRpcClient() {
  return new RpcClient({ endpoint: appConfig.rpcEndpoint });
}

export function RpcSessionProvider({ children }: { children: React.ReactNode }) {
  const [rpcClient, setRpcClient] = useState<RpcClient>(getDefaultRpcClient());
  const authenticate = (token: string) => {
    setRpcClient(rpcClient.withSession(token));
  };
  (window as any).authenticate = authenticate;
  return (
    <RpcSessionContext.Provider value={{ rpcClient, setRpcClient, authenticate }}>
      {children}
    </RpcSessionContext.Provider>
  );
}
