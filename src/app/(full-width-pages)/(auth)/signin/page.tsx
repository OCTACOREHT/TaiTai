import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | TaiTai SaaS",
  description: "Acces de demonstration pour l'interface TaiTai",
};

export default function SignIn() {
  return <SignInForm />;
}
