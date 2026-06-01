"use client";

import { canAccessAdminPath, getDefaultAdminPath } from "@/lib/admin-access";
import { getAdminSession } from "@/lib/admin-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(false);
    const session = getAdminSession();

    if (!session?.user) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!canAccessAdminPath(pathname, session.user.role)) {
      router.replace(getDefaultAdminPath(session.user.role));
      return;
    }

    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-medium text-gray-500">
        Verification des acces...
      </div>
    );
  }

  return <>{children}</>;
}
