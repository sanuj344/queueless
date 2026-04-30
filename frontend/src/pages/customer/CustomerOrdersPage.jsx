import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';

const STATUS_STEPS = { pending: 1, accepted: 2, preparing: 3, ready: 4, completed: 5 };

export default function CustomerOrdersPage() {
  const { customer } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer?.phone) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await api.post('/customer/orders', { phone: customer.phone });
        setOrders(res.data.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [customer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-28 flex justify-center text-zinc-500 text-sm">
        Loading your history...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-3xl mb-6">🔒</div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">No Active Session</h2>
        <p className="text-zinc-500 mt-2">You need to place an order first to view your history.</p>
        <Link to="/" className="mt-6"><Button>Back to Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Your Orders</h1>
            <p className="text-zinc-500 mt-1">Order history for <span className="font-mono text-[#d4ff00]">{customer.phone}</span></p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">Home</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center text-center">
            <p className="text-sm text-zinc-500">No past orders found. Place your first order!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const step = STATUS_STEPS[o.status] || 1;
              const statusColor = step >= 4 ? 'text-[#d4ff00]' : step === 1 ? 'text-amber-400' : 'text-blue-400';
              return (
                <div 
                  key={o.id} 
                  onClick={() => navigate(`/order-status/${o.id}`)}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-[#d4ff00]/40 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-zinc-400 font-mono">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-xs font-black uppercase tracking-widest ${statusColor}`}>{o.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {Array.isArray(o.items) ? o.items.length : 0} item{Array.isArray(o.items) && o.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="font-bold text-zinc-900 dark:text-white">₹{o.totalAmount?.toFixed(2)}</p>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">{new Date(o.createdAt).toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
