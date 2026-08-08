import React from 'react';
import { Metadata } from 'next';
import { Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Brand Guidelines — Enginow',
  description: 'Downloadable logos, colors, and instructions on how to use the Enginow brand assets.',
};

export default function BrandGuidelinesPage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
          Brand Guidelines
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Everything you need to know about using the Enginow brand assets. Download logos, explore our color palette, and learn how to represent us.
        </p>
      </div>

      <div className="space-y-12">
        <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Logo Assets</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please use our logos as provided without modifying the colors, aspect ratio, or adding any filters. Ensure there is enough clear space around the logo.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 h-48 relative group">
              <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">ENGINOW</span>
              <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-2xl gap-2 font-medium">
                <Download className="w-5 h-5" /> Download SVG
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-900 h-48 relative group">
              <span className="text-2xl font-black tracking-tighter text-white">ENGINOW</span>
              <button className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-gray-900 rounded-2xl gap-2 font-medium">
                <Download className="w-5 h-5" /> Download SVG
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="h-24 rounded-xl bg-indigo-600 mb-3 shadow-inner"></div>
              <p className="font-semibold text-sm">Primary Indigo</p>
              <p className="text-xs text-gray-500 font-mono mt-1">#4F46E5</p>
            </div>
            <div>
              <div className="h-24 rounded-xl bg-blue-600 mb-3 shadow-inner"></div>
              <p className="font-semibold text-sm">Secondary Blue</p>
              <p className="text-xs text-gray-500 font-mono mt-1">#2563EB</p>
            </div>
            <div>
              <div className="h-24 rounded-xl bg-gray-900 mb-3 border border-gray-700"></div>
              <p className="font-semibold text-sm">Text Dark</p>
              <p className="text-xs text-gray-500 font-mono mt-1">#111827</p>
            </div>
            <div>
              <div className="h-24 rounded-xl bg-gray-50 mb-3 border border-gray-200"></div>
              <p className="font-semibold text-sm">Background Light</p>
              <p className="text-xs text-gray-500 font-mono mt-1">#F9FAFB</p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Typography</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Primary Font (Geist Sans)</p>
              <p className="text-3xl font-bold tracking-tight">The quick brown fox jumps over the lazy dog.</p>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-2">Monospace Font (Geist Mono)</p>
              <p className="text-xl font-mono">The quick brown fox jumps over the lazy dog.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
