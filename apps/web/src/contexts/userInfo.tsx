import React, { useCallback, useEffect, useState } from "react";
import useRpcService from "../hooks/useRpcService";
import useSession from "../hooks/useSession";

export interface UserInfoValue {
  id: string;
  email: string;
  balanceAmount: number;
  loading: boolean;
  reload: () => void;
}

export const UserInfo = React.createContext<UserInfoValue>({
  id: "",
  email: "",
  balanceAmount: 0,
  loading: true,
  reload: () => {},
});

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const { user: sessionUser } = useSession();
  const { getInfo } = useRpcService();
  const [user, setUser] = useState<{ balanceAmount: number }>({ balanceAmount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { session } = await getInfo({});
    setUser({ balanceAmount: session?.user?.balanceAmount || 0 });
    setLoading(false);
  }, [getInfo]);
  const reload = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (sessionUser && loading) {
      fetchData();
    }
  }, [sessionUser, loading]);

  const value = { ...(sessionUser ?? { email: "", id: "" }), ...user, loading, reload };
  return <UserInfo.Provider value={value}>{children}</UserInfo.Provider>;
}
