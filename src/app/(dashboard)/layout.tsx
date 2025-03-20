import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />
      <div className="flex-1 p-4 pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}