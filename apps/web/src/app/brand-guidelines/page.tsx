import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download, Sparkles, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Brand Guidelines — Enginow',
  description: 'Downloadable logos, color system, typography, and guidelines on how to represent the Enginow brand.',
};

const brandColors = [
  { name: 'Core Ink', hex: '#15171C', role: 'Primary Typography & Dark Surfaces', border: 'border-black/10', bg: '#15171C', text: '#FFF9ED' },
  { name: 'Auralis Amber', hex: '#FFE8B8', role: 'Primary Accent & Highlights', border: 'border-black/10', bg: '#FFE8B8', text: '#15171C' },
  { name: 'Amber Soft', hex: '#FFF8EA', role: 'Secondary Backgrounds & Cards', border: 'border-black/10', bg: '#FFF8EA', text: '#15171C' },
  { name: 'Tertiary Lime', hex: '#E8FFC2', role: 'Badge & Success Signals', border: 'border-black/10', bg: '#E8FFC2', text: '#15171C' },
  { name: 'Pure Paper', hex: '#FFFFFF', role: 'Base Background Surface', border: 'border-black/10', bg: '#FFFFFF', text: '#15171C' },
  { name: 'Ink Soft', hex: 'rgba(21,23,28,0.62)', role: 'Secondary Text & Captions', border: 'border-black/10', bg: 'rgba(21,23,28,0.62)', text: '#FFFFFF' },
];

export default function BrandGuidelinesPage() {
  return (
    <main className="relative min-h-screen" style={{ background: '#FFFFFF' }}>
      {/* Background Gradient */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '500px',
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, rgba(255,248,234,0.12) 55%, transparent 80%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.04 }} />

      {/* Header */}
      <section className="relative px-6 pb-14 pt-24 md:px-10" style={{ borderBottom: '0.8px solid rgba(21,23,28,0.08)' }}>
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: 'var(--ink-mute)' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
        <div className="mx-auto max-w-[1440px]">
          <span className="eyebrow">— Identity & Assets</span>
          <h1 className="display mt-3 max-w-2xl text-5xl md:text-6xl" style={{ color: 'var(--ink)' }}>
            Brand <span className="italic-serif" style={{ color: '#B8922E' }}>Guidelines</span>.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed md:text-[17px]" style={{ color: 'var(--ink-soft)' }}>
            Everything you need to know about representing Enginow. Explore our color system, typography rules, and logo assets.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative px-6 py-14 md:px-10">
        <div className="mx-auto max-w-[1440px] space-y-12">
          
          {/* Logo Assets */}
          <article className="glass-shell">
            <div className="glass-card p-8 md:p-10" style={{ borderRadius: '23px' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'var(--amber)' }}>
                  <Sparkles className="h-4 w-4" style={{ color: 'var(--ink)' }} />
                </span>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Archivo Variable', color: 'var(--ink)' }}>Logo Assets</h2>
              </div>
              <p className="text-[14.5px] leading-relaxed mb-8 max-w-2xl" style={{ color: 'var(--ink-soft)' }}>
                Please use our wordmark and emblem as provided without modifying letterforms, proportions, or colors. Keep clear spacing around all lockups.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl p-8 flex flex-col items-center justify-center h-48 relative group border" style={{ background: 'var(--ink)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-lg font-bold" style={{ background: 'var(--amber)', color: 'var(--ink)' }}>
                      E
                    </span>
                    <span className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Archivo Variable', color: '#FFF9ED' }}>
                      Enginow
                    </span>
                  </div>
                  <span className="mt-4 text-[12px] mono text-white/50">Dark Background Lockup</span>
                </div>
                
                <div className="rounded-2xl p-8 flex flex-col items-center justify-center h-48 relative group border" style={{ background: '#FFF8EA', borderColor: 'rgba(21,23,28,0.1)' }}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-lg font-bold" style={{ background: 'var(--ink)', color: '#FFF9ED' }}>
                      E
                    </span>
                    <span className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Archivo Variable', color: 'var(--ink)' }}>
                      Enginow
                    </span>
                  </div>
                  <span className="mt-4 text-[12px] mono" style={{ color: 'var(--ink-mute)' }}>Light Background Lockup</span>
                </div>
              </div>
            </div>
          </article>

          {/* Color Palette */}
          <article className="glass-shell">
            <div className="glass-card p-8 md:p-10" style={{ borderRadius: '23px' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: 'var(--amber)' }}>
                  <Layers className="h-4 w-4" style={{ color: 'var(--ink)' }} />
                </span>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Archivo Variable', color: 'var(--ink)' }}>Color Palette</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {brandColors.map((c) => (
                  <div key={c.name} className="p-4 rounded-2xl border" style={{ background: '#FFFFFF', borderColor: 'rgba(21,23,28,0.08)' }}>
                    <div className="h-20 rounded-xl mb-3 flex items-end p-3 shadow-inner" style={{ background: c.bg, color: c.text }}>
                      <span className="mono text-[12px] font-bold">{c.hex}</span>
                    </div>
                    <p className="font-bold text-[14.5px]" style={{ color: 'var(--ink)' }}>{c.name}</p>
                    <p className="text-[12.5px] mt-1" style={{ color: 'var(--ink-soft)' }}>{c.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Typography */}
          <article className="glass-shell">
            <div className="glass-card p-8 md:p-10" style={{ borderRadius: '23px' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Archivo Variable', color: 'var(--ink)' }}>Typography System</h2>
              <div className="space-y-6">
                <div>
                  <p className="mono text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--ink-mute)' }}>Display & Headings — Archivo Variable</p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Archivo Variable', color: 'var(--ink)' }}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
                <div className="pt-6 border-t" style={{ borderColor: 'rgba(21,23,28,0.08)' }}>
                  <p className="mono text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--ink-mute)' }}>Body Text & UI — Geist Sans</p>
                  <p className="text-[16px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                    Enginow empowers engineers to build real-world systems through project-based mastery.
                  </p>
                </div>
                <div className="pt-6 border-t" style={{ borderColor: 'rgba(21,23,28,0.08)' }}>
                  <p className="mono text-[11px] uppercase tracking-wider mb-2" style={{ color: 'var(--ink-mute)' }}>Code & Metadata — Geist Mono</p>
                  <p className="mono text-[14px]" style={{ color: 'var(--ink)' }}>
                    const engineer = new Practitioner({'{'} focus: &apos;systems&apos;, cohort: 2026 {'}'});
                  </p>
                </div>
              </div>
            </div>
          </article>

        </div>
      </section>
    </main>
  );
}
