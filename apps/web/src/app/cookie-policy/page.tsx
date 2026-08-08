import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy — Enginow',
  description: 'Learn how Enginow uses cookies to improve your experience.',
};

export default function CookiePolicyPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-16">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-gray-500">Last updated: August 2026</p>
        </div>
        
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          <p>
            We collect cookies to make your experience on Enginow better. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.
          </p>

          <h2>1. What are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
          </p>

          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for several reasons:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> These are required for the operation of our website, such as enabling you to log into secure areas of the platform.</li>
            <li><strong>Analytical/Performance Cookies:</strong> These allow us to recognize and count the number of visitors and see how visitors move around our website. This helps us improve the way our website works.</li>
            <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website, allowing us to personalize our content for you and remember your preferences (like your referral code state).</li>
          </ul>

          <h2>3. Managing Cookies</h2>
          <p>
            Most web browsers allow some control of most cookies through the browser settings. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
          </p>
          <p>
            Please note that if you disable or refuse cookies, some parts of the Enginow platform (especially authenticated dashboards and checkout processes) may become inaccessible or not function properly.
          </p>
        </div>
      </div>
    </main>
  );
}
