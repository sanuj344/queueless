import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const customer = JSON.parse(localStorage.getItem('ql_customer') || '{}');
  const phone = user?.mobile || customer?.phone || '';

  const fetchWalletDetails = () => {
    if (phone) {
      api.get(`/wallet?phone=${phone}`)
        .then(res => {
          setBalance(res.data.wallet?.balance || 0);
          setTransactions(res.data.transactions || []);
          if (res.data.referralCode) {
            setReferralCode(res.data.referralCode);
          }
        })
        .catch(err => {
          console.error('Failed to load wallet details:', err);
        });
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [user, phone]);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please log in with your phone number to top up your wallet.');
      return;
    }
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      // 🔹 Step 0: Ensure Razorpay SDK is loaded
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 🔹 Step 1: Create top-up order on backend
      const orderRes = await api.post('/payment/topup/create-order', {
        amount: parseFloat(topUpAmount)
      });
      const order = orderRes.data;

      // 🔹 Step 2: Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SkrpjWAPFjMaX5',
        amount: order.amount,
        currency: order.currency,
        name: 'Qzaam Wallet',
        description: `Top-up for ₹${topUpAmount}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 🔹 Step 3: Verify payment and update wallet balance
            const verifyRes = await api.post('/payment/topup/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: parseFloat(topUpAmount),
              phone
            });

            if (verifyRes.data.success) {
              toast.success(`₹${topUpAmount} added to your wallet!`);
              setBalance(verifyRes.data.balance);
              setTopUpAmount('');
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          contact: phone
        },
        theme: {
          color: '#d4ff00'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Top-up error:', err);
      toast.error('Failed to initiate top-up.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Referral code copied!');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-start">
        
        {/* Balance & Add Money Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Qzaam Digital Cash
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            My <span className="text-[#8cb800] dark:text-[#d4ff00]">Wallet</span>
          </h1>

          <Card className="p-6 sm:p-8 bg-[#d4ff00]/10 border border-dashed border-[#d4ff00] rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#8cb800] dark:text-[#d4ff00]">Available Balance</p>
                <h2 className="text-5xl font-black text-zinc-900 dark:text-white mt-1">₹{balance.toFixed(2)}</h2>
              </div>
              <span className="text-3xl">💳</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-3 leading-relaxed">
              Use your digital cash for single-tap, instant checkout. Fast, secure, and always ready.
            </p>
          </Card>

          <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Top up your Wallet</h3>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Top-up Amount</label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount (e.g. 250)"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4ff00] w-full transition-colors"
                />
              </div>

              <Button fullWidth type="submit" disabled={loading || !topUpAmount}>
                {loading ? 'Processing...' : 'Complete Top-up'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Copy Referral Code Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">
            Qzaam Referral Code
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white leading-tight">
            Gift <span className="text-[#8cb800] dark:text-[#d4ff00]">₹100</span>
          </h1>

          <Card className="p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Your Unique Referral Code</h3>
              <p className="text-sm text-zinc-500 mt-1">Share with friends to onboard as vendors</p>
            </div>

            {referralCode ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="px-8 py-4 bg-[#d4ff00]/10 border border-dashed border-[#d4ff00] rounded-2xl select-all">
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

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-500 dark:text-zinc-400">
            <p className="font-bold mb-1 text-zinc-700 dark:text-zinc-300">Terms & Conditions:</p>
            <p>• Digital Cash inside your wallet is non-refundable and cannot be withdrawn.</p>
            <p>• Referral rewards are granted instantly when the referred vendor processes their first 10 orders.</p>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="mt-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest">
            Audit Trail
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Transaction History</h2>

          <Card className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {transactions.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 text-center py-6">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {tx.source === "topup" && "Wallet Top-up"}
                        {tx.source === "order" && "Order Payment"}
                        {tx.source === "referral" && "Referral Reward"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`font-black ${tx.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
