import { useContext } from "react";
import { Session } from "../contexts/session";

export default function useSession() {
  const session = useContext(Session);
  const sessionUser = session.rpcClient.user;
  return {
    ...session,
    user: sessionUser,
    isLoggedIn: !!sessionUser,
  };
}
