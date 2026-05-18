import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Clear context
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Our <span className="text-[#8cb800] dark:text-[#d4ff00]">Disclaimer</span>
          </h1>
        </div>

        {/* Content */}
        <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Qzaam operates strictly as a technology software platform and does not manufacture, prepare, or directly supply any of the food or items on its menu pages.
          </p>

          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">Food quality:</strong> Food freshness, allergens, and ultimate preparation quality depend directly on our third-party vendors.
            </li>
            <li>
              <strong className="text-zinc-900 dark:text-zinc-200">Preparation delays:</strong> Delays and preparation timeouts may occur during high-traffic hours.
            </li>
          </ul>

          <p className="border-t border-zinc-200 dark:border-zinc-800 pt-4 font-bold text-zinc-700 dark:text-zinc-300">
            By placing orders via Qzaam, you acknowledge and understand that usage is at your own risk.
          </p>
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
