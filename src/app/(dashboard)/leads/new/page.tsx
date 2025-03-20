import { NewCompany } from "@/components/leads/NewCompany";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Lead | Supercells",
  description: "Add a new company lead",
};

export default function NewCompanyPage() {
  return <NewCompany />;
}