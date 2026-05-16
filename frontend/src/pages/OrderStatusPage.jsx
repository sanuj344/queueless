import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ReviewModal from '../components/ReviewModal';
import DelayModal from '../components/DelayModal';
import toast from 'react-hot-toast';

const STATUS_STEPS = { 
  upcoming: 0, 
  pending: 1, 
  placed: 1, 
  live: 1, 
  accepted: 2, 
  preparing: 3, 
  ready: 4, 
  handover_pending: 4, 
  completed: 5 
};

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
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [confirming, setConfirming] = useState(false);

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

  const sendAction = async (action, minutes = null) => {
    try {
      const payload = { orderId: order.id, action };
      if (minutes) payload.delayMinutes = minutes;
      const res = await api.post('/orders/customer-action', payload);
      if (res.data.success) {
        setOrder(res.data.data);
        if (action === 'delayed') toast.success(`Delayed by ${minutes || 5} mins`);
      }
    } catch (err) {
      console.error('Failed to update action:', err);
      toast.error('Action failed');
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

  // Timer update effect
  useEffect(() => {
    if (!order || !['placed', 'pending', 'live', 'accepted', 'preparing', 'ready'].includes(order.status)) return;
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [order?.status]);

  const getStageTimeLeft = () => {
    if (!order) return 0;
    const FIVE_MIN = 5 * 60 * 1000;
    const TEN_MIN = 10 * 60 * 1000;
    
    if (order.status === 'placed' || order.status === 'pending' || order.status === 'live') {
      const startTime = order.activatedAt ? new Date(order.activatedAt).getTime() : new Date(order.createdAt).getTime();
      const diff = FIVE_MIN - (now - startTime);
      return Math.max(0, Math.floor(diff / 1000));
    }
    if (order.status === 'accepted' && order.acceptedAt) {
      const diff = TEN_MIN - (now - new Date(order.acceptedAt).getTime());
      return Math.max(0, Math.floor(diff / 1000));
    }
    if (order.status === 'preparing' && order.preparingAt) {
      const diff = FIVE_MIN - (now - new Date(order.preparingAt).getTime());
      return Math.max(0, Math.floor(diff / 1000));
    }
    return 0;
  };

  const handleConfirmPickup = async () => {
    setConfirming(true);
    try {
      const res = await api.post(`/orders/${order.id}/confirm-pickup`);
      if (res.data.success) {
        setOrder(res.data.data);
        toast.success('Pickup confirmed successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm pickup');
    } finally {
      setConfirming(false);
    }
  };

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

    if (order.status === 'upcoming') {
      return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center">
          <div className="w-20 h-20 bg-purple-500/10 rounded-[2.5rem] flex items-center justify-center mb-6">
            <span className="text-3xl">📅</span>
          </div>
          <h1 className="text-3xl font-black text-purple-500">Order Scheduled</h1>
          <p className="text-zinc-900 dark:text-white font-bold mt-4 text-xl">
            Scheduled for {new Date(order.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-zinc-500 mt-2 max-w-xs leading-relaxed">
            Your order is scheduled for {new Date(order.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
            Kitchen preparation will begin closer to your slot.
          </p>
          
          <div className="w-full max-w-md mt-8 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-xl">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 text-left">Order Summary</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium">{item.name} × {item.quantity}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-center text-xs text-zinc-500 font-bold">
                  <span>Paid Online (Platform Fee)</span>
                  <span className="text-emerald-500">₹{order.platformFee || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-black text-zinc-900 dark:text-white">Pay at Stall</span>
                  <span className="font-black text-[#d4ff00] text-lg">₹{order.totalAmount}</span>
                </div>
                <p className="text-[9px] text-zinc-400 italic mt-1 text-center font-bold">Total Order Value: ₹{order.finalAmount}</p>
              </div>
            </div>
          </div>

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

    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/5 text-[#d4ff00] text-xs font-bold mb-3">
            Order #{id.slice(0, 8).toUpperCase()}
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            {currentStep < 4 ? 'Hang tight!' : currentStep === 4 ? 'Ready! 🎉' : 'Enjoy your meal!'}
          </h1>
          {order.tokenNumber ? (
            <div className="mt-4 p-4 rounded-3xl bg-[#d4ff00]/10 border border-[#d4ff00]/20 inline-block">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8cb800] dark:text-[#d4ff00] mb-1">Your Token</p>
              <h2 className="text-4xl font-black text-[#8cb800] dark:text-[#d4ff00]">{order.tokenNumber}</h2>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 inline-block">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Token Status</p>
              <h2 className="text-sm font-bold text-zinc-400">Waiting for assignment...</h2>
            </div>
          )}

          {['placed', 'pending', 'live', 'accepted', 'preparing'].includes(order.status) && (
            <div className="mt-6 flex flex-col items-center">
               <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pulse">
                  <p className="text-xs font-black text-red-500 uppercase tracking-widest">
                    ⏱ {Math.floor(getStageTimeLeft() / 60)}m {getStageTimeLeft() % 60}s Remaining
                  </p>
               </div>
               <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase tracking-tight">
                 {order.status === 'accepted' ? 'Estimated Prep Time' : 'Waiting for vendor to accept'}
               </p>
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

        {(order.status === 'ready' || order.status === 'handover_pending') && (
          <div className="w-full max-w-md mt-6 space-y-4 px-4">
            
            {order.status === 'handover_pending' && (
              <div className="p-5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-[2rem] text-center animate-in zoom-in duration-500 shadow-xl shadow-emerald-500/10">
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-4">
                   Vendor has initiated handover. Please confirm that you have received your order.
                </p>
                <Button 
                  fullWidth 
                  size="xl"
                  loading={confirming}
                  onClick={handleConfirmPickup}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/30"
                >
                  Confirm Pickup ✅
                </Button>
              </div>
            )}

            {order.status === 'ready' && !order.handoverCompletedByVendor && (
              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] text-center shadow-lg">
                <p className="text-xs font-bold text-blue-500 mb-4 uppercase tracking-widest">Pickup Confirmation</p>
                {order.pickupConfirmedByCustomer ? (
                  <div className="py-2">
                    <p className="text-sm font-black text-blue-600 animate-pulse">
                      ✅ Pickup Confirmed! Waiting for vendor to handover.
                    </p>
                  </div>
                ) : (
                  <Button 
                    fullWidth 
                    size="lg"
                    loading={confirming}
                    onClick={handleConfirmPickup}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500/5"
                  >
                    I have received my order
                  </Button>
                )}
              </div>
            )}

            <div className="pt-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center mb-4">Update Vendor</h3>
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
                  className={order.customerAction === 'delayed' ? 'bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20' : 'border-amber-500/30 text-amber-500'}
                  onClick={() => setIsDelayModalOpen(true)}
                >
                  {order.customerAction === 'delayed' ? `✓ Delayed by ${order.customerDelayMinutes || 5}m` : 'I will be Delayed'}
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

        <DelayModal
          isOpen={isDelayModalOpen}
          onClose={() => setIsDelayModalOpen(false)}
          onUpdate={(mins) => sendAction('delayed', mins)}
          currentDelay={order.customerDelayMinutes}
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
