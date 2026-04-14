import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
