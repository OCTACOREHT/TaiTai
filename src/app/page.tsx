"use client";

import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { currentUser, hydrated } = useCms();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    router.replace(currentUser ? "/dashboard" : "/signin");
  }, [currentUser, hydrated, router]);

  return null;
}
