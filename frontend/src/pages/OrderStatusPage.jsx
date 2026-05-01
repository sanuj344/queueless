import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ReviewModal from '../components/ReviewModal';

const STATUS_STEPS = { pending: 1, accepted: 2, preparing: 3, ready: 4, completed: 5 };
const STEPS_DATA = [
  { id: 1, label: 'Order Placed' },
  { id: 2, label: 'Accepted by Vendor' },
  { id: 3, label: 'Preparing in Kitchen' },
  { id: 4, label: 'Ready for Pickup' },
  { id: 5, label: 'Completed' },
];

export default function OrderStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customer } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manualId, setManualId] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 1. Auto-redirect to last order if no ID provided in URL
  useEffect(() => {
    if (!id) {
      const savedId = localStorage.getItem('ql_last_order_id');
      if (savedId) {
        navigate(`/order-status/${savedId}`, { replace: true });
      } else {
        setLoading(false);
      }
    }
  }, [id, navigate]);

  // 2. Live tracking for a specific order
  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
        setError('');
        
        // Ensure this is saved as the last viewed valid order
        localStorage.setItem('ql_last_order_id', res.data.data.id);
      } catch {
        setError('Order not found.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
    const interval = setInterval(fetchOrder, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 flex justify-center text-zinc-500 text-sm">
      Locating your order...
    </div>
  );

  // ─── Specific order live view ──────────────────────────────────────────────
  if (id) {
    if (error || !order) return (
      <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Order Not Found</h2>
        <p className="text-zinc-500 mt-2">{error}</p>
        <Link to="/" className="mt-6"><Button>Back to Home</Button></Link>
      </div>
    );

    const currentStep = STATUS_STEPS[order.status] || 1;
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/5 text-[#d4ff00] text-xs font-bold mb-3">
            Order #{id.slice(0, 8).toUpperCase()}
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            {currentStep < 4 ? 'Hang tight!' : currentStep === 4 ? 'Ready! 🎉' : 'Enjoy your meal!'}
          </h1>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8 mb-8 shadow-xl">
          <div className="space-y-1">
            {STEPS_DATA.map((step, i) => {
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id}>
                  <div className="flex items-center gap-4 py-3">
                    <div className={[
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500',
                      isDone ? 'bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black'
                        : isActive ? 'bg-white dark:bg-black border-2 border-[#d4ff00] text-[#d4ff00]'
                        : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400',
                    ].join(' ')}>
                      {isDone ? '✓' : isActive ? <span className="animate-pulse">●</span> : step.id}
                    </div>
                    <p className={`font-bold text-sm flex-1 ${isDone || isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#d4ff00] rounded-full animate-ping opacity-75" />
                        <span className="text-[#d4ff00] text-[10px] font-black uppercase tracking-widest">Live</span>
                      </div>
                    )}
                  </div>
                  {i < STEPS_DATA.length - 1 && (
                    <div className={`ml-5 w-px h-6 ${isDone ? 'bg-[#d4ff00]' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {order.status === 'completed' && !order.reviewGiven && (
          <div className="w-full max-w-md mb-6">
            <Button
              fullWidth
              variant="default"
              size="lg"
              className="bg-[#d4ff00] text-black hover:bg-[#d4ff00]/90 font-black tracking-tight"
              onClick={() => setShowReviewModal(true)}
            >
              ⭐ Leave a Review
            </Button>
          </div>
        )}

        <div className="flex gap-3 w-full max-w-md">
          <Link to={`/menu?vendorId=${order.vendorId}`} className="flex-1">
            <Button variant="outline" fullWidth size="lg">Order More</Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button fullWidth size="lg">Home</Button>
          </Link>
        </div>

        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          order={order}
          onReviewSubmitted={() => {
            setOrder(prev => prev ? { ...prev, reviewGiven: true } : prev);
          }}
        />
      </div>
    );
  }

  // ─── Manual lookup / empty state ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-32 px-4 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-[#d4ff00]/10 rounded-[2.5rem] flex items-center justify-center mb-6">
        <span className="text-3xl">🔍</span>
      </div>
      <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Track Your Order</h1>
      <p className="text-zinc-500 mt-2 max-w-xs">
        {customer ? 'No active orders found.' : 'Enter your Order ID to see live status.'}
      </p>
      <div className="mt-8 w-full max-w-sm space-y-3">
        <input
          type="text"
          placeholder="Enter Order ID"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#d4ff00] transition-all"
        />
        <Button fullWidth size="lg" onClick={() => { if (manualId) window.location.href = `/order-status/${manualId}`; }} disabled={!manualId}>
          Find My Order
        </Button>
      </div>
      <Link to="/" className="mt-8 text-zinc-500 hover:text-zinc-300 text-sm font-medium">Back to Home</Link>
    </div>
  );
}
