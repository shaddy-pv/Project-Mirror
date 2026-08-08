import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Enginow',
  description: 'Terms and Conditions for using Enginow services.',
};

export default function TermsConditionsPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
          <p className="text-gray-500">Last updated: August 2026</p>
        </div>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          <p>
            Please read these terms and conditions carefully before using our service. By accessing or using the Enginow platform, you agree to be bound by these Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Enginow's website if you do not accept all of the terms and conditions stated on this page.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily access the materials (information or software) on Enginow's website for personal, non-commercial transitory viewing only.
          </p>
          <p>You may not:</p>
          <ul>
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose, or for any public display;</li>
            <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
            <li>Remove any copyright or other proprietary notations from the materials;</li>
          </ul>

          <h2>3. Account Registration</h2>
          <p>
            To access certain features of the platform (like applying for internships, enrolling in courses, or taking assessments), you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>

          <h2>4. User Conduct</h2>
          <p>
            Users are expected to conduct themselves professionally. Any cheating, misuse of the assessment platform, or sharing of fraudulent referral codes will result in immediate termination of your account.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights. 
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall Enginow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Enginow's website.
          </p>
        </div>
      </div>
    </main>
  );
}
