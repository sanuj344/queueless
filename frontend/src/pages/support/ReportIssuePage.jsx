import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem('ql_customer'));

  const handleStart = () => {
    if (!customer) {
      alert('Please log in first to view and report order issues.');
      navigate('/');
      return;
    }
    navigate('/your-orders');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Resolution & Support
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Report an <span className="text-[#8cb800] dark:text-[#d4ff00]">Issue</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Need help with an order? We are here to help review, resolve, and take immediate action.
          </p>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex gap-2 items-center">
              ⚠️ Issues we handle
            </h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">•</span> High order prep or vendor delays.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">•</span> Wrong or incomplete items received.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">•</span> Troublesome or inappropriate vendor behavior.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">•</span> Failed/incomplete payment gateway sessions.
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex gap-2 items-center">
              🛡️ How it works
            </h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">1.</span> Select your order directly from your history.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">2.</span> Provide exact details about your issue.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">3.</span> Your ticket goes straight to our Admin Dashboard for instant resolution.
              </li>
            </ul>
          </Card>
        </div>

        {/* Start Button */}
        <div className="text-center pt-2">
          <Button size="lg" className="px-12 bg-[#d4ff00] text-black font-black hover:bg-[#d4ff00]/90" onClick={handleStart}>
            Report an Issue
          </Button>
        </div>
      </div>
    </div>
  );
}
