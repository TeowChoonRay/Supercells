import { Leads } from "@/components/leads/Leads";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads | Supercells",
  description: "Manage your leads",
};

export default function LeadsPage() {
  return <Leads />;
}