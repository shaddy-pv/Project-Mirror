import { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Refund Policy — Enginow",
  description: "Refund policy for courses, trainings, and shop products on Enginow.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="Thank you for your purchase. Please read our refund policy carefully before buying any course, training, or product."
      updated="August 2026"
    >
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: "rgba(220,38,38,0.25)", background: "rgba(254,242,242,0.6)" }}
      >
        <p className="font-semibold" style={{ color: "#991b1b" }}>⚠ No Refund Policy</p>
        <p className="mt-1 text-[14.5px]" style={{ color: "#b91c1c" }}>
          All sales on Enginow are considered <strong>final and non-refundable</strong>. Please review your selection carefully before purchasing.
        </p>
      </div>

      <section>
        <h2>1. Digital Products &amp; Courses</h2>
        <p>
          Due to the digital nature of our courses, training programs, and assessments, once access is granted the product
          cannot be &quot;returned.&quot; We do not offer refunds or exchanges for any digital product purchased on Enginow.
        </p>
      </section>

      <section>
        <h2>2. Physical Products (Shop)</h2>
        <p>
          For physical products from our Shop (e.g., T-shirts, diaries, mugs), all sales are final. We do not accept returns
          or offer refunds unless the item arrived damaged or defective due to a manufacturing issue.
        </p>
        <p>
          If you received a defective item, contact us via the <a href="/contact" style={{ color: "#B8922E", textDecoration: "underline" }}>Contact page</a> within
          48 hours of delivery with photographic evidence, and our support team will assist you.
        </p>
      </section>

      <section>
        <h2>3. Shipping Issues</h2>
        <p>
          We use Delhivery as our primary shipping partner. For shipping delays or lost packages, please refer to our{" "}
          <a href="/shipping-policy" style={{ color: "#B8922E", textDecoration: "underline" }}>Shipping Policy</a>. Enginow is not
          liable for issues that occur once the package has been handed to the courier.
        </p>
      </section>
    </PolicyLayout>
  );
}
