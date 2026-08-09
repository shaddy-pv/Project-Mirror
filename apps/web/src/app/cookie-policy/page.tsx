import { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Cookie Policy — Enginow",
  description: "Learn how Enginow uses cookies to improve your experience.",
};

export default function CookiePolicyPage() {
  return (
    <PolicyLayout
      title="Cookie Policy"
      subtitle="How and why we use cookies to deliver a better experience on Enginow."
      updated="August 2026"
    >
      <section>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files placed on your device when you visit a website. They allow the site to remember
          your actions and preferences so you don&apos;t have to keep re-entering them whenever you return.
        </p>
      </section>

      <section>
        <h2>2. How We Use Cookies</h2>
        <ul>
          <li><strong>Essential Cookies:</strong> Required to operate the website — enabling you to log in, access your dashboard, and complete checkout securely.</li>
          <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with the platform so we can improve it.</li>
          <li><strong>Functionality Cookies:</strong> Remember your preferences, like your referral code or dark-mode setting, on return visits.</li>
        </ul>
      </section>

      <section>
        <h2>3. Managing Cookies</h2>
        <p>
          Most browsers let you control cookies through their settings. You can set your browser to refuse all or
          some cookies, or to alert you when cookies are set.
        </p>
        <p>
          <strong>Note:</strong> If you disable essential cookies, some parts of the Enginow platform — particularly
          authenticated dashboards and checkout — may not function correctly.
        </p>
      </section>
    </PolicyLayout>
  );
}
