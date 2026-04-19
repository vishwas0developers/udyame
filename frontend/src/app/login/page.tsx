"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page and signal that the login modal should open
    router.replace("/?auth=login");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-pulse text-zinc-500">Redirecting...</div>
    </div>
  );
}
