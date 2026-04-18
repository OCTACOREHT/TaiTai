import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | FC Toro CMS",
  description: "Page de connexion pour le CMS FC Toro",
};

export default function SignIn() {
  return <SignInForm />;
}
