import { LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MainLayout } from "../layouts/main";

function HomePage() {
  // const rpc = useRpcService();
  const [isLoading, { close }] = useDisclosure(true);

  return (
    <MainLayout loading={isLoading}>
      <div>
        <h1>Home</h1>
      </div>
    </MainLayout>
  );
}

export default HomePage;
