"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    // /admin/layout.tsx supplies its own navbar/sidebar/FAB.
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "60vh" }}>{children}</main>
      <Footer />
      <FloatingActionButton />
    </>
  );
}
