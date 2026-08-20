import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// This page simply redirects to /exports for convenience
export default function ExportsPage() {
  redirect("/exports");
}
