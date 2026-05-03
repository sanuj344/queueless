import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';

export default function ReferVendorPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReferral = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const customer = JSON.parse(localStorage.getItem('ql_customer'));
    const referredByPhone = customer?.phone || 'guest';

    try {
      const res = await api.post('/referrals', {
        ...form,
        referredByPhone
      });
      if (res.data.success) {
        setMessage('Thank you! Referral submitted successfully.');
        setForm({ name: '', phone: '', location: '' });
      } else {
        setError(res.data.message || 'Failed to submit referral.');
      }
    } catch (err) {
      setError('Failed to submit referral. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* Benefits & Instructions */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Grow our ecosystem
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Refer a Vendor & Earn <span className="text-[#8cb800] dark:text-[#d4ff00]">₹100</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-md">
            Help your favorite local food stall or merchant get online. Refer them to QueueLess and get a direct ₹100 cash reward as soon as they onboard.
          </p>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Why refer?</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="text-[#d4ff00] font-bold">✓</span> Support small businesses with digital tech
              </li>
              <li className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="text-[#d4ff00] font-bold">✓</span> Get a ₹100 reward directly for each successful merchant
              </li>
              <li className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="text-[#d4ff00] font-bold">✓</span> Help minimize queues in your local area
              </li>
            </ul>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-500 dark:text-zinc-400">
            <p className="font-bold mb-1 text-zinc-700 dark:text-zinc-300">Terms & Conditions:</p>
            <p>• Referral reward is given only when the referred vendor registers and processes their first 10 orders.</p>
            <p>• Double referral submissions are discarded; reward goes to the first referrer.</p>
          </div>
        </div>

        {/* Form */}
        <div>
          <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Referral Details</h3>
            <form onSubmit={handleReferral} className="space-y-4">
              {message && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl border border-emerald-200/50">
                  {message}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200/50">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Vendor Name / Stall Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Momos"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4ff00] w-full transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Vendor Phone</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4ff00] w-full transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Location / Stall Spot</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Park Food Court"
                  value={form.location}
                  onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4ff00] w-full transition-colors"
                />
              </div>

              <div className="pt-2">
                <Button fullWidth size="lg" type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Referral'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
