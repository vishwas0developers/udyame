"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page and signal that the signup modal should open
    router.replace("/?auth=signup");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-pulse text-zinc-500">Redirecting...</div>
    </div>
  );
}
