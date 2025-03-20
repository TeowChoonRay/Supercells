import { LeadsEnquiry } from "@/components/leads/LeadsEnquiry";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Assistant | Supercells",
  description: "Chat with our AI lead assistant",
};

export default function LeadsEnquiryPage() {
  return <LeadsEnquiry />;
}