import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | FC Toro CMS",
  description: "Page d'inscription pour le CMS FC Toro",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
