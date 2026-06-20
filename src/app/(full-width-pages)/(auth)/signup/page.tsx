import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | TaïTaï",
  description: "Page d'inscription de demonstration pour TaïTaï",
};

export default function SignUp() {
  return <SignUpForm />;
}
