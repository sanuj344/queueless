import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Security & Trust
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Privacy <span className="text-[#8cb800] dark:text-[#d4ff00]">Policy</span>
          </h1>
        </div>

        {/* Content */}
        <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Data Collection</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-zinc-900 dark:text-zinc-200">Name:</strong> To identify you during order collection.</li>
              <li><strong className="text-zinc-900 dark:text-zinc-200">Phone number:</strong> Used for OTP verification and profile session tracking.</li>
              <li><strong className="text-zinc-900 dark:text-zinc-200">Order Data:</strong> Saved internally to generate order IDs and maintain your previous history.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Data Usage</h2>
            <p>
              Your data is collected and saved exclusively to process your quick-service orders, provide live updates, send notifications, and prevent terminal misuse.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Data Sharing</h2>
            <p>
              We do <strong className="text-zinc-900 dark:text-zinc-200">NOT</strong> sell your personal data. Your contact details are only shared with the vendor from whom you are ordering to complete the order lifecycle.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Security</h2>
            <p>
              We apply industry-standard reasonable protection and encryption measures to ensure your information remains strictly confidential.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">User Rights</h2>
            <p>
              You may request data deletion or account removal at any time by accessing our customer center or opening a ticket.
            </p>
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
