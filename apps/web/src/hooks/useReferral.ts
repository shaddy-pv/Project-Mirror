/**
 * useReferral — shared hook for referral code reading, storing, and sharing.
 *
 * Usage:
 *   const { appliedRef, refDiscount, handleShare, refBanner } = useReferral({
 *     refCode,          // from useSearchParams().get("ref")
 *     shareUrl,         // base URL to share (without ?ref=)
 *     myProfile,        // user profile with .referralCode and .referralExpired
 *     isAuthenticated,
 *     validateFn,       // async (code: string) => { valid: boolean; discountPercent?: number }
 *   });
 */
"use client";
import { useState, useEffect } from "react";

interface UseReferralOptions {
  refCode: string | null;
  shareUrl: string;
  myProfile?: { referralCode?: string | null; referralExpired?: boolean } | null;
  isAuthenticated: boolean;
  validateFn: (code: string) => Promise<{ valid: boolean; discountPercent?: number }>;
}

export function useReferral({
  refCode,
  shareUrl,
  myProfile,
  isAuthenticated,
  validateFn,
}: UseReferralOptions) {
  const [appliedRef, setAppliedRef] = useState<string | null>(null);
  const [refDiscount, setRefDiscount] = useState(0);
  const [copied, setCopied] = useState(false);

  // On mount / refCode change: store & validate any incoming ?ref=
  useEffect(() => {
    if (refCode) localStorage.setItem("enginow_ref", refCode);
  }, [refCode]);

  useEffect(() => {
    const code = refCode ?? localStorage.getItem("enginow_ref");
    if (!code) return;
    validateFn(code)
      .then((result) => {
        if (result.valid) {
          setAppliedRef(code);
          setRefDiscount(result.discountPercent ?? 15);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refCode]);

  /** Builds a referral share URL and copies it to clipboard */
  function handleShare() {
    const canRefer =
      isAuthenticated && myProfile?.referralCode && !myProfile?.referralExpired;
    const url = canRefer
      ? `${shareUrl}?ref=${myProfile!.referralCode}`
      : shareUrl;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  /** Whether a discount banner should show */
  const showBanner = !!appliedRef && refDiscount > 0;

  return { appliedRef, refDiscount, handleShare, copied, showBanner };
}
