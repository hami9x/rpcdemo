import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "./index.css";
import router from "./router";
import { SessionProvider } from "./contexts/session";
import { UserInfoProvider } from "./contexts/userInfo";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif",
        primaryColor: "dark",
      }}>
      <Notifications autoClose={10000} />
      <SessionProvider>
        <UserInfoProvider>
          <RouterProvider router={router} />
        </UserInfoProvider>
      </SessionProvider>
    </MantineProvider>
  </React.StrictMode>,
);
