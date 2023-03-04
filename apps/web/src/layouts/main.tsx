import { LoadingOverlay } from "@mantine/core";
import { appConfig } from "../config";

export function MainLayout({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="app px-10">
      <h1>{appConfig.info.name}</h1>
      <div className="main relative">
        <LoadingOverlay visible={Boolean(loading)} overlayBlur={3} />
        {children}
      </div>
    </div>
  );
}
