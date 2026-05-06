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

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await api.patch(`/orders/${order.id}/cancel`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed. Please try again.');
    }
  };

  const sendAction = async (action) => {
    try {
      const res = await api.post('/orders/customer-action', {
        orderId: order.id,
        action
      });
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error('Failed to update action:', err);
    }
  };

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

    let interval;
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        const data = res.data.data;
        setOrder(data);
        setError('');

        // Ensure this is saved as the last viewed valid order
        localStorage.setItem('ql_last_order_id', data.id);

        if (['completed', 'cancelled'].includes(data.status)) {
          clearInterval(interval);
        }
      } catch {
        setError('Order not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    interval = setInterval(fetchOrder, 3000);
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

    if (order.status === 'cancelled') {
      return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-3xl font-black text-red-500">Order Cancelled</h1>
          <p className="text-zinc-500 mt-2 max-w-xs leading-relaxed">
            Vendor did not accept within the 5-minute window or cancelled the order.
          </p>
          {order.vendor?.mobile && (
          <div className="w-full max-w-md mt-4 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-lg text-center">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Need Assistance?</p>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
              Contact {order.vendor.outletName || order.vendor.name}
            </h4>
            <a 
              href={`tel:${order.vendor.mobile}`}
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#d4ff00]/10 border border-[#d4ff00]/20 rounded-2xl text-[#8cb800] dark:text-[#d4ff00] font-black hover:scale-105 transition-all group"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform">📞</span>
              <span className="text-lg tracking-tight">{order.vendor.mobile}</span>
            </a>
            <p className="text-[10px] text-zinc-500 mt-3 font-medium">Tap to call vendor directly</p>
          </div>
        )}

        <div className="flex gap-3 w-full max-w-md mt-8">
            <Link to={`/menu?vendorId=${order.vendorId}`} className="flex-1">
              <Button variant="outline" fullWidth size="lg">Order More</Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button fullWidth size="lg">Home</Button>
            </Link>
          </div>
        </div>
      );
    }

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
          {order.tokenNumber && (
            <div className="mt-4 p-4 rounded-3xl bg-[#d4ff00]/10 border border-[#d4ff00]/20 inline-block">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8cb800] dark:text-[#d4ff00] mb-1">Your Token</p>
              <h2 className="text-4xl font-black text-[#8cb800] dark:text-[#d4ff00]">{order.tokenNumber}</h2>
            </div>
          )}
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

        {order.status === 'ready' && (
          <div className="w-full max-w-md mt-6 space-y-3 px-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center mb-2">Update Vendor</h3>
            <div className="grid grid-cols-1 gap-3">
              <Button 
                fullWidth 
                variant={order.customerAction === 'coming' ? 'default' : 'outline'}
                className={order.customerAction === 'coming' ? 'bg-emerald-500 text-white border-none' : 'border-emerald-500/30 text-emerald-500'}
                onClick={() => sendAction('coming')}
              >
                {order.customerAction === 'coming' ? '✓ I am Coming' : 'I am Coming'}
              </Button>
              <Button 
                fullWidth 
                variant={order.customerAction === 'delayed' ? 'default' : 'outline'}
                className={order.customerAction === 'delayed' ? 'bg-amber-500 text-white border-none' : 'border-amber-500/30 text-amber-500'}
                onClick={() => sendAction('delayed')}
              >
                {order.customerAction === 'delayed' ? '✓ I will be Delayed' : 'I will be Delayed (5 min)'}
              </Button>
              <Button 
                fullWidth 
                variant={order.customerAction === 'contact' ? 'default' : 'outline'}
                className={order.customerAction === 'contact' ? 'bg-blue-500 text-white border-none' : 'border-blue-500/30 text-blue-500'}
                onClick={() => sendAction('contact')}
              >
                {order.customerAction === 'contact' ? '✓ Calling Vendor' : 'Contact Vendor'}
              </Button>
            </div>
            {order.customerAction && (
              <p className="text-[10px] text-center text-zinc-500 animate-pulse font-bold uppercase tracking-tighter">
                Notification sent to vendor
              </p>
            )}
          </div>
        )}

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

        {(order.status === 'placed' || order.status === 'pending') && (
          <div className="w-full max-w-md mb-6">
            <Button
              fullWidth
              variant="outline"
              size="lg"
              className="border-red-500/40 hover:border-red-500 text-red-500 hover:bg-red-500/5 font-black tracking-tight"
              onClick={handleCancel}
            >
              Cancel Order
            </Button>
          </div>
        )}

        {order.vendor?.mobile && (
          <div className="w-full max-w-md mb-6 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-lg text-center">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Need Assistance?</p>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">
              Contact {order.vendor.outletName || order.vendor.name}
            </h4>
            <a 
              href={`tel:${order.vendor.mobile}`}
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#d4ff00]/10 border border-[#d4ff00]/20 rounded-2xl text-[#8cb800] dark:text-[#d4ff00] font-black hover:scale-105 transition-all group"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform">📞</span>
              <span className="text-lg tracking-tight">{order.vendor.mobile}</span>
            </a>
            <p className="text-[10px] text-zinc-500 mt-3 font-medium">Tap to call vendor directly</p>
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
