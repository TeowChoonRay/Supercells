import { Dashboard } from "@/components/dashboard/Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Supercells",
  description: "Your Supercells dashboard",
};

export default function DashboardPage() {
  return <Dashboard />;
}