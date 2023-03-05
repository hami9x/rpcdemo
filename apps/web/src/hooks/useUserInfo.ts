import { useState } from "react";

import useEffectAsync from "./useEffectAsync";
import useRpcService from "./useRpcService";
import useSession from "./useSession";

export interface UserInfo {
  id: string;
  email: string;
  balanceAmount: number;
  loading: boolean;
}

export default function useUserInfo(): UserInfo {
  const { user: sessionUser, updatedAt } = useSession();
  const { getInfo } = useRpcService();
  const [user, setUser] = useState<{ balanceAmount: number }>({ balanceAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffectAsync(async () => {
    if (sessionUser && loading) {
      const info = await getInfo({});
      setUser({ balanceAmount: info.session?.user?.balanceAmount || 0 });
      setLoading(false);
    }
  }, [sessionUser, updatedAt]);
  if (!sessionUser) return { ...user, loading, email: "", id: "" };
  return { ...sessionUser, ...user, loading };
}
