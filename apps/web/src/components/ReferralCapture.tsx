"use client";
/**
 * ReferralCapture — mounted once in the root layout.
 * Silently reads ?ref= from any URL and saves it to localStorage
 * so the discount is applied whenever the user eventually enrols.
 */
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ref.trim()) {
      localStorage.setItem("enginow_ref", ref.trim());
    }
  }, [searchParams]);

  return null;
}
