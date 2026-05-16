import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';

const STATUS_STEPS = { pending: 1, placed: 1, live: 1, accepted: 2, preparing: 3, ready: 4, handover_pending: 4, completed: 5 };

export default function CustomerOrdersPage() {
  const { customer: authCustomer } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Try both context and localStorage for maximum safety
    const customer = authCustomer || JSON.parse(localStorage.getItem('ql_customer'));

    if (!customer?.phone) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/customer/orders?phone=${customer.phone}`);
        const orderData = res.data.data || [];

        // Sort: Active orders (not completed/cancelled) on top
        const sorted = [...orderData].sort((a, b) => {
          const aActive = a.status !== 'completed' && a.status !== 'cancelled';
          const bActive = b.status !== 'completed' && b.status !== 'cancelled';
          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setOrders(sorted);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [authCustomer]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const getStageTimeLeft = (order) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-32 flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Fetching your orders...</p>
      </div>
    );
  }

  const customer = authCustomer || JSON.parse(localStorage.getItem('ql_customer'));

  if (!customer) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-32 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-3xl mb-6">🔒</div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Login Required</h2>
        <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Please sign in as a customer from the navbar to view your order history.</p>
        <Link to="/" className="mt-8"><Button>Back to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Your Orders</h1>
            <p className="text-zinc-500 mt-2">History for <span className="font-mono text-[#8cb800] dark:text-[#d4ff00] font-bold">{customer.phone}</span></p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="rounded-xl">Home</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-20 px-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/30">
            <span className="text-4xl mb-4">🥡</span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No orders found</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">Looks like you haven't placed any orders yet.</p>
            <Link to="/menu" className="mt-6">
              <Button size="sm">Explore Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => {
              const step = STATUS_STEPS[o.status] || 1;
              const isActive = o.status !== 'completed' && o.status !== 'cancelled';
              const statusColor = isActive
                ? (step >= 4 ? 'text-[#8cb800] dark:text-[#d4ff00]' : 'text-amber-500')
                : 'text-zinc-400';

              return (
                <div
                  key={o.id}
                  onClick={() => navigate(`/order-status/${o.id}`)}
                  className={`p-6 rounded-3xl border ${isActive ? 'border-[#d4ff00]/30 bg-[#d4ff00]/5 shadow-lg shadow-[#d4ff00]/5' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'} hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#d4ff00] animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                      <span className="text-[10px] font-black text-zinc-400 font-mono tracking-widest uppercase">#{o.id.slice(0, 8)}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusColor}`}>
                      {o.status === 'handover_pending' ? '🟡 Confirm Pickup' : o.status}
                    </span>
                  </div>

                  {['placed', 'pending', 'live', 'accepted', 'preparing'].includes(o.status) && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                        ⏱ {Math.floor(getStageTimeLeft(o) / 60)}m {getStageTimeLeft(o) % 60}s remaining
                      </span>
                    </div>
                  )}

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">
                        {Array.isArray(o.items) ? o.items.length : 0} Item{Array.isArray(o.items) && o.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-zinc-900 dark:text-white">₹{o.totalAmount?.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
