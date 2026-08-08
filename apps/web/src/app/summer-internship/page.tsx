import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";

export default function SummerInternshipPage() {
  return (
    <main className="relative min-h-screen bg-[#FDFCF8]">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
      <section className="relative px-6 pb-20 pt-24 md:px-10">
        <div className="absolute left-6 top-6 md:left-10 md:top-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-amber-700/60 transition-colors hover:text-amber-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full bg-amber-100/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-inset ring-amber-500/20">
            Internship Program
          </span>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-[#1a1a1a] md:text-7xl">
            Summer <span className="text-amber-600">Internship</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            We have a summer internship program for various durations for which users can apply during the designated time, and if shortlisted they will get all the benefits of that.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
              <Clock className="h-5 w-5 text-amber-600" />
              <div className="text-left">
                <p className="text-xs font-medium text-gray-500">Durations</p>
                <p className="font-semibold text-gray-900">1,2,3, 6 Months</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
              <Calendar className="h-5 w-5 text-amber-600" />
              <div className="text-left">
                <p className="text-xs font-medium text-gray-500">Starting From</p>
                <p className="font-semibold text-gray-900">May first week</p>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <Link href="/internship?type=summer" className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md hover:ring-2 hover:ring-amber-600 hover:ring-offset-2">
              Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
