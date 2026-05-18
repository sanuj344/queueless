import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export default function CustomerHub() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            For smart consumers
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Customer <span className="text-[#8cb800] dark:text-[#d4ff00]">Hub</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about using Qzaam to skip the lines and pick up your items seamlessly.
          </p>
        </div>

        {/* Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Section 1: How it works */}
          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex gap-2 items-center">
              <span className="text-[#8cb800] dark:text-[#d4ff00]">Step 1</span> How It Works
            </h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">1.</span> Scan the digital QR code directly from the vendor's terminal.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">2.</span> Select your favorite items and add them to your cart.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">3.</span> Choose your expected delivery / pickup time (ASAP, 10m, 20m, 30m).
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">4.</span> Verify your OTP and place the order in seconds.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">5.</span> Arrive, show your order ID, and collect your items with no queue.
              </li>
            </ul>
          </Card>

          {/* Section 2: Our Promises */}
          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Our Commitments</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">✓</span> <strong className="text-zinc-900 dark:text-zinc-200">Time-based pickup:</strong> Pickup exactly when you scheduled it, fresh and hot.
              </li>
              <li className="flex gap-3">
                <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">✓</span> <strong className="text-zinc-900 dark:text-zinc-200">Real-time updates:</strong> Stay informed of your order status from pending to ready instantly.
              </li>
              <li className="flex gap-3">
                <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">✓</span> <strong className="text-zinc-900 dark:text-zinc-200">Smooth experience:</strong> One continuous terminal without any extra downloads.
              </li>
            </ul>
          </Card>

          {/* Section 3: Safe usage and limitations */}
          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Limitations</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-red-500 font-bold">!</span> <strong className="text-zinc-900 dark:text-zinc-200">Vendor delays:</strong> High-traffic hours might introduce minor vendor prep delays.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-bold">!</span> <strong className="text-zinc-900 dark:text-zinc-200">Network issues:</strong> Smooth OTP verification relies on strong mobile network reception.
              </li>
              <li className="flex gap-3">
                <span className="text-red-500 font-bold">!</span> <strong className="text-zinc-900 dark:text-zinc-200">Item unavailabilities:</strong> Rare occasions where the vendor runs out of menu items.
              </li>
            </ul>
          </Card>

          {/* Section 4: Responsibility */}
          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Your Responsibility</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">✓</span> <strong className="text-zinc-900 dark:text-zinc-200">Arrive on time:</strong> Make sure you pick up your order promptly.
              </li>
              <li className="flex gap-3">
                <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">✓</span> <strong className="text-zinc-900 dark:text-zinc-200">Verify items:</strong> Double-check your fresh order before leaving the stall.
              </li>
            </ul>
          </Card>
        </div>

        {/* CTAs */}
        <div className="text-center">
          <Link to="/">
            <Button size="lg" className="px-8 bg-[#d4ff00] text-black font-black">
              Start Exploring Vendors
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
