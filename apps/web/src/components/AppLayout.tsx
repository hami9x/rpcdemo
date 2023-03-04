import { AppShell, Header, Avatar, Button, Group, LoadingOverlay, Text, Menu } from "@mantine/core";
import gravatarUrl from "gravatar-url";
import { Link } from "react-router-dom";
import { SessionUser } from "@assignment1/core";

import { appConfig } from "../config";
import { useRpcSession } from "../rpc/hooks";

function AppHeader({ user }: { user?: SessionUser }) {
  return (
    <Header height={80} className="flex justify-between content-center px-20">
      <Group className="flex logo content-center">
        <h1 className="text-slate-600">
          <Link to="/">{appConfig.info.name}</Link>
        </h1>
      </Group>
      <Group className="flex content-center">
        {user && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="outline" color="gray">
                <Avatar
                  size="sm"
                  src={gravatarUrl(user.email, { size: 40, default: "mp" })}
                  alt={user.email}
                  radius="xl"
                  style={{ marginRight: 10 }}
                />
                {user.email}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              {[
                { to: "/create", title: "Create item" },
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
                  <Menu.Item>
                    <Link to={item.to} className="py-2" key={item.to} onClick={item.onClick}>
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
}: {
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
}) {
  const { user } = useRpcSession();

  return (
    <AppShell
      padding={0}
      className="px-20"
      header={<AppHeader user={user} />}
      styles={(theme) => ({
        // Override default styles
      })}>
      {title && <h2>{title}</h2>}
      <div className="main relative">
        <LoadingOverlay visible={Boolean(loading)} overlayBlur={3} />
        {children}
      </div>
    </AppShell>
  );
}
