import { Settings } from "@/components/settings/Settings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Supercells",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  return <Settings />;
}