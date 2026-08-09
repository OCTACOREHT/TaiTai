"use client";

import { canAccessAdminPath, getDefaultAdminPath } from "@/lib/admin-access";
import { getAdminSession } from "@/lib/admin-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setChecking(true);
      setAllowed(false);
      
      try {
        const session = await getAdminSession();

        if (!session?.user) {
          router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
          return;
        }

        if (!canAccessAdminPath(pathname, session.user.role)) {
          router.replace(getDefaultAdminPath(session.user.role));
          return;
        }

        setAllowed(true);
      } catch (error) {
        console.error("Erreur lors de la vérification des accès:", error);
        router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-medium text-gray-500">
        Verification des acces...
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
