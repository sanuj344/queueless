import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Connect with us
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Contact <span className="text-[#8cb800] dark:text-[#d4ff00]">Center</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Our support and success team is available to assist you via phone or email directly.
          </p>
        </div>

        {/* Channels */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white pb-2 flex gap-2 items-center">
                📞 Call Us
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Connect directly with our operations team for active order issues.
              </p>
              <p className="text-xl font-black text-[#8cb800] dark:text-[#d4ff00] font-mono mt-3">
                +91 6364399738
              </p>
            </div>
            <p className="text-xs text-zinc-400 mt-2">Mon-Sun 9 AM to 11 PM IST</p>
          </Card>

          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white pb-2 flex gap-2 items-center">
                ✉️ Email Support
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Email us directly regarding vendor onboarding or merchant inquiries.
              </p>
              <p className="text-base font-black text-[#8cb800] dark:text-[#d4ff00] font-mono mt-3">
                qzaam4u@gmail.com
              </p>
            </div>
            <p className="text-xs text-zinc-400 mt-2">Average response: &lt; 2 hours</p>
          </Card>
        </div>

        {/* Details & Help */}
        <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-3">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex gap-2">
            🤝 When to contact:
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Urgent order delays or payment problems.</li>
            <li>In-stall/vendor registration onboarding help.</li>
            <li>Platform enterprise software or commercial partnerships.</li>
          </ul>
        </Card>

        {/* Action Button */}
        <div className="text-center pt-2">
          <Link to="/">
            <Button size="lg" className="px-8 bg-[#d4ff00] text-black font-black hover:bg-[#d4ff00]/90">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
