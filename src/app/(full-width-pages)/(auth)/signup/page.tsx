import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | TaiTai SaaS",
  description: "Page d'inscription de demonstration pour TaiTai",
};

export default function SignUp() {
  return <SignUpForm />;
}
