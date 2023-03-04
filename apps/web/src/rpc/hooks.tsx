import React, { useContext, useMemo, useState } from "react";

import { appConfig } from "../config";
import { RpcClient } from "./client";

export interface RpcContextValue {
  client: RpcClient;
  setClient: React.Dispatch<React.SetStateAction<RpcClient>>;
  authenticate: (token: string) => void;
}

export const RpcContext = React.createContext<RpcContextValue>({
  client: getDefaultRpcClient(),
  setClient: () => {},
  authenticate: () => {},
});

function getDefaultRpcClient() {
  const client = new RpcClient({ endpoint: appConfig.rpcEndpoint });
  const sessionToken = localStorage.getItem("session");
  return sessionToken ? client.withSession(sessionToken) : client;
}

export function RpcProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<RpcClient>(getDefaultRpcClient());
  const authenticate = (token: string) => {
    setClient(client.withSession(token));
    localStorage.setItem("session", token);
  };
  (window as any).authenticate = authenticate;
  return (
    <RpcContext.Provider value={{ client, setClient, authenticate }}>
      {children}
    </RpcContext.Provider>
  );
}

export function useRpcService() {
  return useContext(RpcContext).client.service;
}

export function useRpcSession() {
  const { client, authenticate } = useContext(RpcContext);
  return {
    authenticate,
    user: client.user,
    isLoggedIn: !!client.user,
  };
}
