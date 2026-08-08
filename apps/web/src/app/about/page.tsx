import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — Enginow',
  description: 'Learn about our goals, timeline, tech stack, and what makes us unique.',
};

export default function AboutPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
      <div className="space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
            About Enginow
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We are building the ultimate learning house for engineers. Here is our story, our goals, and what drives us forward.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Our Goals</h2>
          <p className="text-gray-600 dark:text-gray-300">
            To bridge the gap between academic learning and industry expectations. We strive to provide hands-on, practical education that empowers individuals to build real-world software solutions and accelerate their careers.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Timeline</h2>
          <ul className="space-y-4 border-l-2 border-indigo-100 dark:border-indigo-900 ml-3 pl-6">
            <li className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-gray-800"></span>
              <h3 className="font-semibold text-lg">Inception</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">When the idea was born to change engineering education.</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-gray-800"></span>
              <h3 className="font-semibold text-lg">First Cohort</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Successfully trained our first batch of engineering students.</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-gray-800"></span>
              <h3 className="font-semibold text-lg">Platform Launch</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Launched the unified Enginow platform with comprehensive dashboards.</p>
            </li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Our Tech Stack</h2>
          <div className="flex flex-wrap gap-3">
            {['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Express.js', 'MongoDB', 'TanStack Start', 'Redis'].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium text-sm">
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Why We Are Unique</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We don't just teach theory. Our platform seamlessly integrates learning, practice, assessments, and real-world internships into a single, cohesive journey. Our custom staff and educator portals ensure that content is always industry-relevant and vetted by experts.
          </p>
        </section>
      </div>
    </main>
  );
}
