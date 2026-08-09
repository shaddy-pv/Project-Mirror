import { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions — Enginow",
  description: "Terms and Conditions for using Enginow services.",
};

export default function TermsConditionsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using Enginow. By accessing our platform, you agree to be bound by them."
      updated="August 2026"
    >
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing this website, you accept these terms and conditions in full.
          Do not continue to use Enginow if you do not agree with all of the terms stated on this page.
        </p>
      </section>

      <section>
        <h2>2. Use License</h2>
        <p>Permission is granted for personal, non-commercial access to materials on Enginow. You may not:</p>
        <ul>
          <li>Modify or copy the materials;</li>
          <li>Use the materials for any commercial or public display purpose;</li>
          <li>Attempt to decompile or reverse-engineer any software on the website;</li>
          <li>Remove any copyright or proprietary notations from the materials.</li>
        </ul>
      </section>

      <section>
        <h2>3. Account Registration</h2>
        <p>
          To access features like applying for internships, enrolling in courses, or taking assessments, you must register
          for an account with accurate and complete information. You are responsible for maintaining the security of your account.
        </p>
      </section>

      <section>
        <h2>4. User Conduct</h2>
        <p>
          Users are expected to conduct themselves professionally. Cheating on assessments, misuse of the platform, or
          sharing fraudulent referral codes will result in immediate termination of your account.
        </p>
      </section>

      <section>
        <h2>5. Intellectual Property</h2>
        <p>
          All content, graphics, design, and software on this site are protected under applicable copyrights, trademarks,
          and other proprietary rights. Unauthorized reproduction is strictly prohibited.
        </p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>
          Enginow shall not be liable for any damages — including loss of data or profit, or business interruption —
          arising out of the use or inability to use materials on this website.
        </p>
      </section>
    </PolicyLayout>
  );
}
