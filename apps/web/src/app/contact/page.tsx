'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone, CheckCircle2, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const contacts = [
  { icon: Mail, label: 'Email', lines: ['support@enginow.in', 'partnerships@enginow.in'] },
  { icon: Phone, label: 'Phone', lines: ['+91 (800) 123-4567', 'Mon–Fri, 9 am – 6 pm IST'] },
  { icon: MapPin, label: 'Office', lines: ['123 Innovation Drive', 'Tech Park, Bangalore 560001'] },
];

const socials = [
  { label: 'LinkedIn', icon: LinkedinIcon, href: '#' },
  { label: 'Twitter / X', icon: TwitterIcon, href: '#' },
  { label: 'GitHub', icon: GithubIcon, href: '#' },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <main className="relative min-h-screen" style={{ background: '#FFFFFF' }}>
      {/* Gradient */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '500px', pointerEvents: 'none', background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(255,232,184,0.38) 0%, rgba(255,248,234,0.12) 55%, transparent 80%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-paper" style={{ opacity: 0.04 }} />

      {/* Header */}
      <section className="relative px-6 pb-14 pt-24 md:px-10" style={{ borderBottom: '0.8px solid rgba(21,23,28,0.08)' }}>
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] transition-colors" style={{ color: 'var(--ink-mute)' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
        <div className="mx-auto max-w-[1440px]">
          <span className="eyebrow">— Get In Touch</span>
          <h1 className="display mt-3 max-w-xl text-5xl md:text-6xl" style={{ color: 'var(--ink)' }}>
            Contact <span className="italic-serif" style={{ color: '#B8922E' }}>Us</span>.
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed md:text-[17px]" style={{ color: 'var(--ink-soft)' }}>
            Have a question or want to work with us? Drop us a message and we&apos;ll get back to you shortly.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="relative px-6 py-14 md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-5">

          {/* LEFT — Form */}
          <div className="lg:col-span-3">
            <div className="glass-shell">
              <div className="glass-card p-8 md:p-10" style={{ borderRadius: '23px' }}>
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-16 text-center"
                    >
                      <CheckCircle2 className="h-16 w-16" style={{ color: '#059669' }} />
                      <h2 className="mt-6 text-2xl font-bold" style={{ fontFamily: 'Archivo Variable', color: 'var(--ink)' }}>Message Sent!</h2>
                      <p className="mt-3 text-[14.5px]" style={{ color: 'var(--ink-soft)' }}>Thank you for reaching out. We&apos;ll get back to you soon.</p>
                      <button onClick={() => setIsSuccess(false)} className="mt-6 text-[13px] font-medium underline underline-offset-4 transition-opacity hover:opacity-70" style={{ color: 'var(--ink-mute)' }}>
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest font-semibold mb-6" style={{ color: 'var(--ink-mute)' }}>Send a Message</p>
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="mono block text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-mute)' }}>Full Name *</label>
                            <input required type="text" placeholder="e.g. Rohan Verma"
                              className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                              style={{ color: 'var(--ink)' }} />
                          </div>
                          <div>
                            <label className="mono block text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-mute)' }}>Email Address *</label>
                            <input required type="email" placeholder="you@example.com"
                              className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                              style={{ color: 'var(--ink)' }} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mono block text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-mute)' }}>Category *</label>
                        <select required
                          className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                          style={{ color: 'var(--ink)' }}>
                          <option value="">Select a category…</option>
                          <option value="sales">Sales &amp; Partnerships</option>
                          <option value="career">Careers &amp; Internships</option>
                          <option value="custom">Custom Services</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>

                      <div>
                        <label className="mono block text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink-mute)' }}>Message *</label>
                        <textarea required rows={5} placeholder="How can we help you?"
                          className="mt-1.5 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-ring"
                          style={{ color: 'var(--ink)' }} />
                      </div>

                      <button type="submit" disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-semibold text-paper transition-all hover:opacity-90 disabled:opacity-60"
                        style={{ background: 'var(--ink)' }}>
                        {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send Message</>}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT — Contact Info */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Contact details */}
            <div className="glass-shell">
              <div className="glass-card p-7" style={{ borderRadius: '23px' }}>
                <p className="mono text-[10px] uppercase tracking-widest mb-5" style={{ color: 'var(--ink-mute)' }}>Contact Information</p>
                <div className="space-y-6">
                  {contacts.map(({ icon: Icon, label, lines }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: 'var(--amber-soft)' }}>
                        <Icon className="h-4.5 w-4.5" style={{ color: '#B8922E' }} />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: 'var(--ink)' }}>{label}</p>
                        {lines.map(l => <p key={l} className="text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{l}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="glass-shell">
              <div className="glass-card p-7" style={{ borderRadius: '23px' }}>
                <p className="mono text-[10px] uppercase tracking-widest mb-5" style={{ color: 'var(--ink-mute)' }}>Follow Us</p>
                <div className="flex gap-3">
                  {socials.map(({ label, icon: Icon, href }) => (
                    <a key={label} href={href} title={label}
                      className="grid h-11 w-11 place-items-center rounded-full border transition-all hover:scale-105 hover:shadow-sm"
                      style={{ borderColor: 'rgba(21,23,28,0.10)', color: 'var(--ink-soft)', background: 'rgba(255,255,255,0.8)' }}>
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
