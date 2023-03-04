import { useDisclosure } from "@mantine/hooks";
import AppLayout from "../components/AppLayout";

function HomePage() {
  const [loading] = useDisclosure(false);

  return (
    <AppLayout loading={loading} requireAuth>
      <div></div>
    </AppLayout>
  );
}

export default HomePage;
