import { AvatarSelection } from "@/components/auth/AvatarSelection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose Avatar | Supercells",
  description: "Select your avatar type",
};

export default function AvatarSelectionPage() {
  return <AvatarSelection />;
}