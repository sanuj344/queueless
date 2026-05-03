import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Fair & Transparent
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Refund & <span className="text-[#8cb800] dark:text-[#d4ff00]">Cancellation</span>
          </h1>
        </div>

        {/* Content */}
        <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Customer Cancellation</h2>
            <p>
              Order cancellation is allowed only before the order moves to the <strong className="text-zinc-900 dark:text-zinc-200">Preparing</strong> stage on the vendor's terminal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Vendor Cancellation</h2>
            <p>
              If a vendor cancels your order due to item unavailabilities, a <strong className="text-zinc-900 dark:text-zinc-200">full refund</strong> is initiated and processed immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Payment Failures</h2>
            <p>
              In case of payment gateway timeouts or failed debit transactions, a refund is automatically initiated within our gateway and settled within 5-7 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">No Pickup / No Collection</h2>
            <p>
              No refund will be processed or provided if you place an order and do not arrive to collect it within the expected pickup time.
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
