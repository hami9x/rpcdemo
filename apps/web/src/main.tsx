import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { MantineProvider } from "@mantine/core";

import "./index.css";
import router from "./router";
import { RpcProvider } from "./rpc/hooks";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif",
        primaryColor: "dark",
      }}>
      <RpcProvider>
        <RouterProvider router={router} />
      </RpcProvider>
    </MantineProvider>
  </React.StrictMode>,
);
