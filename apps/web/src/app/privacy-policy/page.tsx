import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Enginow',
  description: 'Privacy Policy and data protection guidelines for Enginow.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-500">Last updated: August 2026</p>
        </div>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          <p>
            At Enginow, we are committed to protecting your personal data and respecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, and professional details when you register, apply for jobs/internships, or use the contact form.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with our website, including pages visited, time spent, and referral codes used.</li>
            <li><strong>Assessment Data:</strong> Results and monitoring data from tests taken on our platform (shared only with relevant HR/Admin for hiring purposes).</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>Your data is used to:</p>
          <ul>
            <li>Provide, operate, and maintain our educational and hiring platform.</li>
            <li>Process your applications for internships and jobs.</li>
            <li>Generate certificates, letters of recommendation, and offer letters.</li>
            <li>Improve, personalize, and expand our services.</li>
            <li>Communicate with you for customer service and updates.</li>
          </ul>

          <h2>3. Data Protection and Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. 
            Your content and data are protected using industry-standard encryption and secure databases.
          </p>

          <h2>4. Sharing of Information</h2>
          <p>
            We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties 
            without your consent, except to trusted third parties who assist us in operating our website, conducting our business, 
            or servicing you, so long as those parties agree to keep this information confidential.
          </p>
          <p>
            <em>Assessment data is shared strictly with the relevant Admin and HR personnel for hiring purposes.</em>
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. If you have any concerns regarding your data, 
            please contact us through our Contact page.
          </p>
        </div>
      </div>
    </main>
  );
}
