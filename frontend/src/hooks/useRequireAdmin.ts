"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useRequireAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
    } else if (user.role !== "ADMIN") {
      router.push("/");
    }
  }, [isLoading, user, router]);

  return { user, isLoading, isAuthorized: !isLoading && user?.role === "ADMIN" };
}
