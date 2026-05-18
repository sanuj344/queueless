import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

const faqs = [
  {
    q: "Do I need to stand in queue?",
    a: "No. You can order in advance and pick up at your selected time."
  },
  {
    q: "What if my order is not ready?",
    a: "You can contact the vendor directly or raise an issue through our support platform."
  },
  {
    q: "Can I cancel my order?",
    a: "Yes, but only before the vendor starts the preparation stage."
  },
  {
    q: "How is Qzaam different?",
    a: "It focuses on time-based pickup directly at our terminals, not instant delivery."
  },
  {
    q: "What if I arrive late?",
    a: "Your order may expire if not picked up promptly and no refund will be issued."
  },
  {
    q: "Is food quality guaranteed?",
    a: "All items are prepared directly by our third-party vendors. Quality depends on them."
  },
  {
    q: "Payment done but no order?",
    a: "Please wait a moment and refresh. If still missing, a refund is automatically initiated."
  },
  {
    q: "How will I know when the order is ready?",
    a: "You will receive a notification and a real-time status update on the tracking page."
  },
  {
    q: "Can I change pickup time?",
    a: "No. Cancel the order before preparation and place a new one with the correct time."
  },
  {
    q: "Wrong item received?",
    a: "Report the issue immediately through the support center with your order ID."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Answers & Help
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Frequently Asked <span className="text-[#8cb800] dark:text-[#d4ff00]">Questions</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Find immediate answers to common questions about your time-based ordering experience.
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Card 
                key={i} 
                className={`p-5 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 transition-all hover:border-[#d4ff00]/20 select-none cursor-pointer ${isOpen ? 'shadow-xl border-[#d4ff00]/30' : 'shadow-md'}`}
                onClick={() => setOpenIndex(isOpen ? null : i)}
              >
                <div className="flex justify-between items-center gap-4">
                  <h3 className={`text-base font-bold transition-colors ${isOpen ? 'text-[#8cb800] dark:text-[#d4ff00]' : 'text-zinc-900 dark:text-white'}`}>
                    {item.q}
                  </h3>
                  <span className={`text-xl font-black transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#d4ff00]' : 'text-zinc-400'}`}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                {isOpen && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 leading-relaxed transition-all">
                    {item.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>

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
