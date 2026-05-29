import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Konekte | TaiTai SaaS",
  description: "Aksè demonstrasyon pou entèfas TaiTai",
};

export default function SignIn() {
  return <SignInForm />;
}
