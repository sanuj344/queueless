import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Our identity
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Who <span className="text-[#8cb800] dark:text-[#d4ff00]">We Are</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Qzaam is a time-based local quick-service operating system designed to completely remove line-waiting and queuing from daily life.
          </p>
        </div>

        {/* Section 1 & 2: We Are vs We Are NOT */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">What We Are</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="font-bold text-emerald-500">✓</span> A robust time-based local ordering terminal.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-500">✓</span> Solution providers eliminating line wait time.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-emerald-500">✓</span> A fast and reliable business tool for local vendors.
              </li>
            </ul>
          </Card>

          <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">What We Are NOT</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="font-bold text-red-500">✕</span> A delivery app; customers pick up directly.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-red-500">✕</span> A food or goods provider; we manage transactions only.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-red-500">✕</span> An ad network; no spammy ads on our terminal.
              </li>
            </ul>
          </Card>
        </div>

        {/* Section 3 & 4: Mission and Vision */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex gap-2">
              <span className="text-[#8cb800] dark:text-[#d4ff00]">🎯</span> Our Mission
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              To eliminate daily waiting time from high-speed scenarios like tech parks, campuses, and busy food stalls, putting control back into the hands of both consumers and vendors.
            </p>
          </Card>

          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex gap-2">
              <span className="text-[#8cb800] dark:text-[#d4ff00]">👁️</span> Our Vision
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We envision a fully connected quick-service future completely free of queues—where waiting time is exactly zero and transactions are completely seamless.
            </p>
          </Card>
        </div>

        {/* Action */}
        <div className="text-center">
          <Link to="/vendor/register">
            <Button size="lg" className="px-8 bg-[#d4ff00] text-black font-black">
              Become a Vendor Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
