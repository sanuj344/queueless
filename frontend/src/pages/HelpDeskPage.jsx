import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import CustomerLoginModal from '../components/CustomerLoginModal';
import ComplaintModal from '../components/ComplaintModal';

const STATUS_STEPS = { pending: 1, accepted: 2, preparing: 3, ready: 4, completed: 5 };

export default function HelpDeskPage() {
  const { customer: authCustomer } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);

  useEffect(() => {
    const customer = authCustomer || JSON.parse(localStorage.getItem('ql_customer'));

    if (!customer?.phone) {
      setShowLogin(true);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get(`/customer/orders?phone=${customer.phone}`);
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authCustomer]);

  const customer = authCustomer || JSON.parse(localStorage.getItem('ql_customer'));

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-32 flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading help desk...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-32 px-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-3xl mb-6">🔒</div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Customer Session Required</h2>
        <p className="text-zinc-500 mt-2 max-w-xs mx-auto">Please sign in as a customer from the navbar or click the button below to raise a complaint.</p>
        <div className="mt-8 flex gap-3">
          <Button onClick={() => setShowLogin(true)}>Sign in as Customer</Button>
          <Link to="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>
        <CustomerLoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} isCheckoutFlow={false} />

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Help Desk</h1>
            <p className="text-zinc-500 mt-2">Select an order to raise a complaint for <span className="font-mono text-[#8cb800] dark:text-[#d4ff00] font-bold">{customer.phone}</span></p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="rounded-xl">Home</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-20 px-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/30">
            <span className="text-4xl mb-4">🥢</span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No orders found</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">You need an active or past order to file a complaint.</p>
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
                  className={`p-6 rounded-3xl border ${isActive ? 'border-[#d4ff00]/30 bg-[#d4ff00]/5 shadow-lg shadow-[#d4ff00]/5' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'} transition-all`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#d4ff00] animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                      <span className="text-[10px] font-black text-zinc-400 font-mono tracking-widest uppercase">#{o.id.slice(0, 8)}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusColor}`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">
                        {Array.isArray(o.items) ? o.items.length : 0} Item{Array.isArray(o.items) && o.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-black text-zinc-900 dark:text-white">₹{o.totalAmount?.toFixed(0)}</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsComplaintOpen(true);
                        }}
                      >
                        Raise Complaint
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <ComplaintModal
          isOpen={isComplaintOpen}
          onClose={() => {
            setIsComplaintOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          customerPhone={customer.phone}
        />
      )}
    </div>
  );
}
