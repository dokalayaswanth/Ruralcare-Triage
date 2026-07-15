"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();

      if (!user) {
        router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
        return;
      }

      setIsAllowed(true);
      setIsChecking(false);
    }

    checkAuth();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <LoadingSpinner label="Checking specialist access..." />
        </div>
      </section>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}