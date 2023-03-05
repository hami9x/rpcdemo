import { AppShell, Header, Avatar, Button, Group, LoadingOverlay, Text, Menu } from "@mantine/core";
import gravatarUrl from "gravatar-url";
import { Navigate, useNavigate, Link } from "react-router-dom";

import { appConfig } from "../config";
import useSession from "../hooks/useSession";
import useUserInfo from "../hooks/useUserInfo";
import { UserInfoValue } from "../contexts/userInfo";

function MenuLink({
  to,
  children,
  onClick,
  ...props
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  const navigateWithReload = (to: string) => {
    if (to == window.location.pathname) {
      window.location.reload();
    } else {
      navigate(to, { state: { date: Date.now() } });
    }
  };
  return (
    <Menu.Item
      {...props}
      component="a"
      href={to}
      onClick={(event) => {
        onClick ? onClick() : navigateWithReload(to);
        event.preventDefault();
      }}>
      {children}
    </Menu.Item>
  );
}

function AppHeader({ userInfo }: { userInfo: UserInfoValue }) {
  return (
    <Header height={80} className="flex justify-between content-center px-20">
      <Group className="flex logo content-center">
        <h1 className="text-slate-600">
          <Link to="/">{appConfig.info.name}</Link>
        </h1>
      </Group>
      <Group className="flex content-relative">
        <Menu shadow="md" width={200} transitionProps={{ transition: "rotate-right", duration: 0 }}>
          <Menu.Target>
            {userInfo.id ? (
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
            ) : (
              <div></div>
            )}
          </Menu.Target>

          <Menu.Dropdown>
            {[
              { to: "/create-item", title: "Create item" },
              { to: "/deposit", title: "Deposit" },
              {
                to: "#logout",
                title: "Logout",
                onClick: () => {
                  localStorage.removeItem("session");
                  window.location.reload();
                },
              },
            ].map((item) => {
              return (
                <MenuLink key={item.to} to={item.to} className="py-2" onClick={item.onClick}>
                  <Text>{item.title}</Text>
                </MenuLink>
              );
            })}
          </Menu.Dropdown>
        </Menu>
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
