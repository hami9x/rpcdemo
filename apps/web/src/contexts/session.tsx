import React, { useState } from "react";

import { appConfig } from "../config";
import { RpcClient } from "../rpc";

export interface SessionValue {
  rpcClient: RpcClient;
  setRpcClient: React.Dispatch<React.SetStateAction<RpcClient>>;
  authenticate: (token: string) => void;
  updatedAt?: Date;
  notifyUpdate: () => void;
}

export const Session = React.createContext<SessionValue>({
  rpcClient: getDefaultRpcClient(),
  setRpcClient: () => {},
  authenticate: () => {},
  notifyUpdate: () => {},
});

function getDefaultRpcClient() {
  const client = new RpcClient({ endpoint: appConfig.rpcEndpoint });
  const sessionToken = localStorage.getItem("session");
  return sessionToken ? client.withSession(sessionToken) : client;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [rpcClient, setRpcClient] = useState<RpcClient>(getDefaultRpcClient());
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());

  const authenticate = (token: string) => {
    setRpcClient(rpcClient.withSession(token));
    localStorage.setItem("session", token);
  };
  (window as any).authenticate = authenticate;
  return (
    <Session.Provider
      value={{
        rpcClient: rpcClient,
        setRpcClient,
        authenticate,
        updatedAt,
        notifyUpdate: () => setUpdatedAt(new Date()),
      }}>
      {children}
    </Session.Provider>
  );
}
