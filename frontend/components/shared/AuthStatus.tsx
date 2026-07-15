"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

import { getCurrentUser, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-40 truncate text-xs text-slate-500 md:inline">
        {user.email}
      </span>

      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      >
        Sign Out
      </button>
    </div>
  );
}