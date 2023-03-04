import { useDisclosure } from "@mantine/hooks";
import { Navigate } from "react-router-dom";
import { useRpcSession } from "../rpc/hooks";
import AppLayout from "../components/AppLayout";

function HomePage() {
  const { isLoggedIn, user } = useRpcSession();
  const [isLoading] = useDisclosure(false);
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <AppLayout loading={isLoading}>
      <div></div>
    </AppLayout>
  );
}

export default HomePage;
