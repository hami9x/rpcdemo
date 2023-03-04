import { createBrowserRouter } from "react-router-dom";

// import CreateItemPage from "./pages/CreateItemPage";
import DepositPage from "./pages/DepositPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/deposit",
    element: <DepositPage />,
  },
  // {
  //   path: "/create-item",
  //   element: <CreateItemPage />,
  // },
]);

export default router;
