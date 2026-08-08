import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy — Enginow',
  description: 'Shipping details and liability disclaimer for physical products from the Enginow shop.',
};

export default function ShippingPolicyPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Shipping Policy</h1>
          <p className="text-gray-500">Last updated: August 2026</p>
        </div>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          <p>
            This Shipping Policy applies to all physical products purchased through the Enginow Shop (e.g., T-shirts, Diaries, Cups, Key Chains).
          </p>

          <h2>1. Our Shipping Partner</h2>
          <p>
            We have partnered with <strong>Delhivery</strong> to handle all our logistics and physical product shipments across India. They are responsible for the safe and timely delivery of your packages.
          </p>

          <h2>2. Processing Time</h2>
          <p>
            All orders are processed within 1-3 business days. Customized items (like custom diaries) may require an additional 2-3 business days for processing and printing before they are dispatched.
          </p>

          <h2>3. Liability Disclaimer</h2>
          <p>
            Once a package is handed over to our shipping partner (Delhivery) and dispatched from our end, <strong>we do not hold liability</strong> for any delays, damages, or lost packages during transit. 
          </p>
          <p>
            For any issues related to the shipping process, tracking updates, or delayed deliveries, please contact Delhivery customer support directly using the tracking ID provided to you via email upon dispatch.
          </p>

          <h2>4. Tracking Your Order</h2>
          <p>
            Once your order has shipped, you will receive an email containing your tracking number and a link to the Delhivery tracking portal. You can also view your order status in your Learner Dashboard.
          </p>
        </div>
      </div>
    </main>
  );
}
