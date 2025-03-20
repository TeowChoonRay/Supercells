import { Register } from "@/components/auth/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Supercells",
  description: "Create your Supercells account",
};

export default function RegisterPage() {
  return <Register />;
}