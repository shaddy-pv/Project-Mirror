import React from 'react';
import { Metadata } from 'next';
import { Code2, Smartphone, Monitor, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services — Enginow',
  description: 'Professional services provided by Enginow including Web Development, App Development, Custom Software Solutions, and Consulting.',
};

const services = [
  {
    title: 'Website Development',
    description: 'Modern, responsive, and performant web applications tailored to your business needs.',
    icon: Monitor,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10'
  },
  {
    title: 'App Development',
    description: 'Native and cross-platform mobile applications for iOS and Android.',
    icon: Smartphone,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10'
  },
  {
    title: 'Custom Software Solutions',
    description: 'Bespoke software architecture and development for complex business logic and integrations.',
    icon: Code2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10'
  },
  {
    title: 'Consulting',
    description: 'Expert technical consulting for startups and enterprises to scale their engineering teams and products.',
    icon: Lightbulb,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10'
  }
];

export default function ServicesPage() {
  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Our Services
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          We empower individuals, companies, and startups with top-tier engineering solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${service.bg}`}>
              <service.icon className={`w-7 h-7 ${service.color}`} />
            </div>
            <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center bg-indigo-50 dark:bg-indigo-900/20 p-10 rounded-3xl">
        <h2 className="text-3xl font-bold mb-4">Ready to start a project?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
          Contact us today to discuss your requirements and let our expert team bring your vision to life.
        </p>
        <a 
          href="/contact" 
          className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </main>
  );
}
