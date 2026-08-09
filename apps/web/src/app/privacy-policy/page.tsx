import { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — Enginow",
  description: "How Enginow collects, uses and safeguards your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and safeguard your information when you use Enginow."
      updated="August 2026"
    >
      <section>
        <h2>1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li><strong>Personal Information:</strong> Name, email, phone number and professional details when you register, apply for jobs/internships, or use the contact form.</li>
          <li><strong>Usage Data:</strong> Pages visited, time spent, and referral codes used to improve your experience.</li>
          <li><strong>Assessment Data:</strong> Results from tests taken on our platform — shared only with relevant HR/Admin for hiring purposes.</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <p>Your data is used to:</p>
        <ul>
          <li>Provide, operate, and maintain our educational and hiring platform.</li>
          <li>Process your applications for internships and jobs.</li>
          <li>Generate certificates, letters of recommendation, and offer letters.</li>
          <li>Improve, personalize, and expand our services.</li>
          <li>Communicate with you for customer service and updates.</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Protection and Security</h2>
        <p>
          We implement industry-standard encryption and secure databases to keep your personal data safe.
          Your content is protected at rest and in transit.
        </p>
      </section>

      <section>
        <h2>4. Sharing of Information</h2>
        <p>
          We do not sell, trade, or transfer your Personally Identifiable Information to outside parties without your consent,
          except to trusted third parties who help us operate our website so long as they agree to keep your data confidential.
        </p>
        <p><em>Assessment data is shared strictly with the relevant Admin and HR personnel for hiring purposes.</em></p>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data at any time.
          Contact us through our <a href="/contact" style={{ color: "#B8922E", textDecoration: "underline" }}>Contact page</a> to make a request.
        </p>
      </section>
    </PolicyLayout>
  );
}
