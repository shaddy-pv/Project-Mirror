import { Metadata } from "next";
import { PolicyLayout } from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Shipping Policy — Enginow",
  description: "Shipping details and liability disclaimer for physical products from the Enginow shop.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      subtitle="This policy applies to all physical products purchased through the Enginow Shop."
      updated="August 2026"
    >
      <section>
        <h2>1. Our Shipping Partner</h2>
        <p>
          We have partnered with <strong>Delhivery</strong> to handle all logistics and physical product shipments across India.
          They are responsible for the safe and timely delivery of your packages.
        </p>
      </section>

      <section>
        <h2>2. Processing Time</h2>
        <p>
          All orders are processed within <strong>1–3 business days</strong>. Customised items (like custom diaries) may
          require an additional 2–3 business days for processing and printing before dispatch.
        </p>
      </section>

      <section>
        <h2>3. Liability Disclaimer</h2>
        <p>
          Once a package is handed over to Delhivery and dispatched from our facility, <strong>we do not hold liability</strong> for
          any delays, damages, or lost packages during transit.
        </p>
        <p>
          For shipping issues, tracking updates, or delayed deliveries, please contact Delhivery customer support directly
          using the tracking ID provided to you via email upon dispatch.
        </p>
      </section>

      <section>
        <h2>4. Tracking Your Order</h2>
        <p>
          Once your order ships, you will receive an email with your tracking number and a link to the Delhivery tracking portal.
          You can also view your order status in your <a href="/learner-dashboard" style={{ color: "#B8922E", textDecoration: "underline" }}>Learner Dashboard</a>.
        </p>
      </section>
    </PolicyLayout>
  );
}
