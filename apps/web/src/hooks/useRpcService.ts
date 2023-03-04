import { useContext } from "react";
import { Session } from "../contexts/session";

export default function useRpcService() {
  return useContext(Session).rpcClient.service;
}
