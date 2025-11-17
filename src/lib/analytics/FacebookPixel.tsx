"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export default function FacebookPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      try {
        window.fbq("track", "PageView");
      } catch {
        // no-op
      }
    }
  }, [pathname, searchParams?.toString()]);

  return null;
}
