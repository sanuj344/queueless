import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';
import Card from '../components/Card';
import { formatCurrency } from '../utils/formatCurrency';

export default function ReferVendorPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);

  const customer = JSON.parse(localStorage.getItem('ql_customer') || '{}');
  const phone = user?.mobile || customer?.phone || '';

  useEffect(() => {
    if (user?.referralCode) {
      setReferralCode(user.referralCode);
    } else if (phone) {
      api.get(`/payment/wallet-balance?phone=${phone}`)
        .then(res => {
          if (res.data.referralCode) {
            setReferralCode(res.data.referralCode);
          }
        })
        .catch(err => console.error(err));
    }
  }, [user, phone]);

  useEffect(() => {
    const userIdOrCode = user?.id || customer?.id || referralCode || user?.mobile || customer?.phone;
    if (!userIdOrCode) return;

    const fetchReferrals = () => {
      api.get(`/referral/my-referrals/${userIdOrCode}`)
        .then(res => {
          setReferrals(res.data);
        })
        .catch(err => console.error('Failed to fetch referrals', err));
    };

    fetchReferrals();
    const interval = setInterval(fetchReferrals, 5000);
    return () => clearInterval(interval);
  }, [user?.id, customer?.id, referralCode, phone]);

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            Help your favorite local food stall or merchant get online. Share your unique referral code with them to get a direct ₹100 cash reward as soon as they onboard.
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

        {/* Copy Referral Code Section */}
        <div>
          <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Your Referral Code</h3>
              <p className="text-sm text-zinc-500 mt-1">Share this code with vendors to onboard</p>
            </div>

            {referralCode ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="px-8 py-4 bg-[#d4ff00]/10 border border-dashed border-[#d4ff00] rounded-2xl">
                  <span className="text-4xl font-black text-zinc-900 dark:text-white tracking-widest">
                    {referralCode}
                  </span>
                </div>
                <Button fullWidth onClick={handleCopy}>
                  {copied ? 'Copied to clipboard!' : 'Copy Code'}
                </Button>
              </div>
            ) : (
              <div className="p-6 text-zinc-500 text-sm font-medium">
                {phone ? 'Loading code...' : 'Enter your name and phone in checkout to generate a code!'}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Referrals Progress Tracking List */}
      <div className="w-full max-w-4xl mt-16 pt-12 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Your Referred Vendors</h2>
            <p className="text-sm text-zinc-500">Track onboarding and order progress in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Updates every 5s</span>
          </div>
        </div>

        {referrals.length === 0 ? (
          <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center">
            <p className="text-sm text-zinc-500 font-medium">No vendors referred yet. Share your code to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {referrals.map((ref, index) => (
              <div
                key={index}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4 hover:border-[#d4ff00]/40 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{ref.vendorName}</h3>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{ref.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    ref.rewardEarned
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] border border-[#d4ff00]/20'
                  }`}>
                    {ref.rewardEarned ? '✅ Reward Earned' : '⏳ In Progress'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 font-bold mb-1">
                    <span>Order Progress</span>
                    <span>{ref.completedOrders}/10 completed</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-[#d4ff00] h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(100, (ref.completedOrders / 10) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span>Remaining Orders</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">
                    {ref.remainingOrders}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
