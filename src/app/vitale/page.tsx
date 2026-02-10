"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

export default function VitaleAutoLogin() {
  const router = useRouter();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    signIn("credentials", {
      email: "admin@vitale.com",
      password: "vitale2024",
      redirect: false,
    }).then((result) => {
      if (result?.ok) {
        router.replace("/dashboard");
        router.refresh();
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <p className="text-white text-lg font-medium">Signing in to Vitale...</p>
        <div className="flex justify-center">
          <div className="h-1 w-32 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full w-full bg-white/60 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
