import { Login } from "@/components/auth/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Supercells",
  description: "Login to your Supercells account",
};

export default function LoginPage() {
  return <Login />;
}