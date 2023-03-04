import { AppShell, Header, Avatar, Button, Group, LoadingOverlay, Text, Menu } from "@mantine/core";
import gravatarUrl from "gravatar-url";
import { Link, Navigate } from "react-router-dom";

import { appConfig } from "../config";
import useSession from "../hooks/useSession";
import useUserInfo, { UserInfo } from "../hooks/useUserInfo";

function AppHeader({ userInfo }: { userInfo: UserInfo }) {
  return (
    <Header height={80} className="flex justify-between content-center px-20">
      <Group className="flex logo content-center">
        <h1 className="text-slate-600">
          <Link to="/">{appConfig.info.name}</Link>
        </h1>
      </Group>
      <Group className="flex content-relative">
        {userInfo.id && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="outline"
                color="gray"
                styles={() => ({
                  root: {
                    height: 55,
                  },
                })}>
                <div className="flex flex-row items-center flex-wrap py-20">
                  <Avatar
                    size="sm"
                    src={gravatarUrl(userInfo.email, { size: 40, default: "mp" })}
                    alt={userInfo.email}
                    radius="xl"
                    className="mr-4 flex"
                  />
                  <div className="flex flex-col py-10">
                    <Text size="sm">{userInfo.email}</Text>
                    <Text>Balance: {userInfo.loading ? "--" : userInfo.balanceAmount}</Text>
                  </div>
                </div>
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {[
                { to: "/create-item", title: "Create item" },
                { to: "/deposit", title: "Deposit" },
                {
                  to: "#",
                  title: "Logout",
                  onClick: () => {
                    localStorage.removeItem("session");
                    window.location.reload();
                  },
                },
              ].map((item) => {
                return (
                  <Menu.Item key={item.to}>
                    <Link to={item.to} className="py-2" onClick={item.onClick}>
                      <Text>{item.title}</Text>
                    </Link>
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Header>
  );
}

export default function AppLayout({
  children,
  loading,
  title,
  requireAuth = false,
}: {
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  requireAuth?: boolean;
}) {
  const { isLoggedIn } = useSession();
  const userInfo = useUserInfo();
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <AppShell padding={0} className="px-20" header={<AppHeader userInfo={userInfo} />}>
      {title && <h2>{title}</h2>}
      <div className="main relative">
        <LoadingOverlay visible={Boolean(loading)} overlayBlur={3} />
        {children}
      </div>
    </AppShell>
  );
}
