import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Rules & Regulations
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Terms <span className="text-[#8cb800] dark:text-[#d4ff00]">of Service</span>
          </h1>
        </div>

        {/* Content */}
        <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.1 Introduction</h2>
            <p>
              Qzaam is a digital quick-service operating system that facilitates time-based food and retail ordering between customers and vendors. By accessing this platform, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.2 Platform Role</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We do not prepare food, products, or goods.</li>
              <li>We do not directly control vendor operations or schedules.</li>
              <li>We do not guarantee the ultimate quality or availability of any items.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.3 User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate identification details including name and valid 10-digit phone number.</li>
              <li>Select your correct expected pickup time during order placement.</li>
              <li>Arrive on time to ensure fresh quality upon collection.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.4 Vendor Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Accept orders timely within the vendor dashboard or terminal.</li>
              <li>Maintain correct menu status (active, stock levels, pricing).</li>
              <li>Ensure hygiene and proper quality standards.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.5 Order Lifecycle</h2>
            <p>Our operational flow remains strictly structured: Scheduled → Preparing → Ready → Completed.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.6 Payments</h2>
            <p>All online transaction methods are handled securely via our verified third-party payment gateways.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.7 Limitation of Liability</h2>
            <p>Qzaam is not responsible for food quality, supply issues, or vendor preparation delays.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">1.8 Termination</h2>
            <p>User and Vendor accounts may be immediately suspended for misuse, fraud, or intentional platform exploitation.</p>
          </section>
        </Card>

        {/* Home Link */}
        <div className="text-center pt-2">
          <Link to="/">
            <Button size="lg" className="px-8 bg-[#d4ff00] text-black font-black hover:bg-[#d4ff00]/90">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
