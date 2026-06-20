import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | TaïTaï",
  description: "Acces de demonstration pour l'interface TaïTaï",
};

export default function SignIn() {
  return <SignInForm />;
}
