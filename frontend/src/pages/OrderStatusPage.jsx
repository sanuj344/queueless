import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/Button';

const STATUS_STEPS = {
  'pending': 1,
  'accepted': 2,
  'preparing': 3,
  'ready': 4,
  'completed': 5
};

const STEPS_DATA = [
  { id: 1, label: 'Order Placed', status: 'pending' },
  { id: 2, label: 'Accepted by Vendor', status: 'accepted' },
  { id: 3, label: 'Preparing in Kitchen', status: 'preparing' },
  { id: 4, label: 'Ready for Pickup', status: 'ready' },
  { id: 5, label: 'Completed', status: 'completed' }
];

export default function OrderStatusPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manualId, setManualId] = useState('');

  const fetchOrder = async (orderId) => {
    const targetId = orderId || id;
    if (!targetId) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get(`/orders/${targetId}`);
      setOrder(res.data.data);
      setLoading(false);
      setError('');
    } catch (err) {
      setError('Order not found or something went wrong.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
      const interval = setInterval(fetchOrder, 3000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 flex justify-center text-zinc-500">
      Locating your order...
    </div>
  );

  if (!id && !order) return (
    <div className="min-h-screen bg-white dark:bg-black pt-32 px-4 flex flex-col items-center text-center">
       <div className="w-20 h-20 bg-[#d4ff00]/10 rounded-[2.5rem] flex items-center justify-center mb-6">
          <span className="text-3xl">🔍</span>
        </div>
      <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Track Your Order</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto">Enter your Order ID to see the live status of your meal.</p>
      
      <div className="mt-8 w-full max-w-sm">
        <input 
          type="text" 
          placeholder="Enter Order ID"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#d4ff00] transition-all mb-4"
        />
        <Button fullWidth size="lg" onClick={() => fetchOrder(manualId)} disabled={!manualId}>
          Find My Order
        </Button>
      </div>
      
      <Link to="/" className="mt-8 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm font-medium">
        Back to Home
      </Link>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 flex flex-col items-center text-center">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Order Error</h2>
      <p className="text-zinc-500 dark:text-zinc-400 mt-2">{error || 'Order not found.'}</p>
      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );

  const currentStep = STATUS_STEPS[order.status] || 1;

  const getHeaderTitle = () => {
    if (currentStep < 4) return 'Hang tight!';
    if (currentStep === 4) return 'Your order is ready!';
    return 'Enjoy your meal!';
  };

  const getHeaderSubtitle = () => {
    if (currentStep < 2) return 'Waiting for vendor to accept your order...';
    if (currentStep < 4) return 'Your order is being prepared with care.';
    if (currentStep === 4) return 'Please collect your order from the counter.';
    return 'Thank you for using QueueLess!';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12 transition-colors duration-300">

      {/* Order number badge */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#8cb800]/20 dark:border-[#d4ff00]/20 bg-[#8cb800]/5 dark:bg-[#d4ff00]/5 text-[#8cb800] dark:text-[#d4ff00] text-sm font-bold mb-4">
          Order ID: {id.slice(0, 8)}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-500">
          {getHeaderTitle()}
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          {getHeaderSubtitle()}
        </p>
      </div>

      {/* Status Card */}
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8 mb-8 shadow-xl">

        {/* Steps */}
        <div className="space-y-1">
          {STEPS_DATA.map((status, i) => {
            const stepNum = status.id;
            const isDone = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <div key={status.id}>
                <div className="flex items-center gap-4 py-3">
                  {/* Step indicator */}
                  <div
                    className={[
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500',
                      isDone
                        ? 'bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black shadow-[0_0_20px_rgba(140,184,0,0.4)] dark:shadow-[0_0_20px_rgba(212,255,0,0.4)]'
                        : isActive
                        ? 'bg-white dark:bg-black border-2 border-[#8cb800] dark:border-[#d4ff00] text-[#8cb800] dark:text-[#d4ff00]'
                        : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600',
                    ].join(' ')}
                  >
                    {isDone ? '✓' : isActive ? (
                      <span className="animate-pulse">●</span>
                    ) : (
                      stepNum
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        'font-bold text-sm transition-colors duration-300',
                        isDone || isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-600',
                      ].join(' ')}
                    >
                      {status.label}
                    </p>
                  </div>

                  {/* Active pulse */}
                  {isActive && (
                    <div className="shrink-0 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#8cb800] dark:bg-[#d4ff00] rounded-full animate-ping opacity-75" />
                      <span className="text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">Live</span>
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {i < STEPS_DATA.length - 1 && (
                  <div className={`ml-5 w-px h-6 ${isDone ? 'bg-[#8cb800] dark:bg-[#d4ff00]' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link to={`/menu?vendorId=${order.vendorId}`} className="w-full">
          <Button variant="outline" fullWidth size="lg">
            Order More
          </Button>
        </Link>
        <Link to="/" className="w-full">
          <Button fullWidth size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
