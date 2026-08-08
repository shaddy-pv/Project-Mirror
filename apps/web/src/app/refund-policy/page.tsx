import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy — Enginow',
  description: 'Refund policy for courses, trainings, and shop products on Enginow.',
};

export default function RefundPolicyPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-gray-500">Last updated: August 2026</p>
        </div>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          <p>
            Thank you for purchasing our courses, training programs, and products at Enginow. We want to ensure that our users have a rewarding experience while they are discovering, assessing, and purchasing our educational content and physical products.
          </p>

          <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-6 my-8 rounded-r-xl">
            <h3 className="text-red-800 dark:text-red-400 mt-0">No Refund Policy</h3>
            <p className="text-red-700 dark:text-red-300 mb-0">
              Please note that currently, <strong>no refunds are available</strong> for any feature, course, training, or product purchase on the platform. All sales are considered final and non-refundable.
            </p>
          </div>

          <h2>1. Digital Products & Courses</h2>
          <p>
            Due to the digital nature of our courses, training programs, and assessments, once access is granted, the product cannot be "returned." Therefore, we do not offer refunds or exchanges for any digital products or services purchased on Enginow.
          </p>

          <h2>2. Physical Products (Shop)</h2>
          <p>
            For physical products purchased from our Shop (e.g., T-shirts, diaries, mugs), all sales are final. We do not accept returns or offer refunds for these items unless they arrived damaged or defective due to manufacturing issues.
          </p>
          <p>
            If you received a defective item, please reach out to us via the Contact page within 48 hours of delivery with photographic evidence, and our support team will assist you.
          </p>

          <h2>3. Shipping Issues</h2>
          <p>
            We use Delhivery as our primary shipping partner. For issues related to shipping delays or lost packages, please refer to our <a href="/shipping-policy">Shipping Policy</a>. Enginow is not liable for issues that occur once the package has been handed over to the courier.
          </p>
        </div>
      </div>
    </main>
  );
}
