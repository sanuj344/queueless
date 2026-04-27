import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockOrders } from '../../data/mockData';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(mockOrders);
  const [newOrderAlert, setNewOrderAlert] = useState(true); // Simulate new order

  useEffect(() => {
    // Hide alert after 5s mock
    const timer = setTimeout(() => setNewOrderAlert(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const statusMap = {
    pending: { label: 'Pending', badge: 'orange', next: 'preparing', actionText: 'Accept' },
    preparing: { label: 'Preparing', badge: 'neon', next: 'ready', actionText: 'Mark Ready' },
    ready: { label: 'Ready for Pickup', badge: 'blue', next: 'completed', actionText: 'Verify Pickup' },
    completed: { label: 'Completed', badge: 'zinc', next: null, actionText: null },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{user?.name}</h1>
            <p className="text-zinc-500">Live Kitchen Display System</p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-semibold mr-2 text-zinc-600 dark:text-zinc-400">Accepting Orders:</span>
            <input type="checkbox" className="toggle-checkbox w-10 h-5" defaultChecked />
          </div>
        </div>

        {/* Alert MOCK */}
        {newOrderAlert && (
          <div className="w-full bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black p-4 rounded-2xl font-bold flex justify-between items-center animate-in slide-in-from-top-4">
            <span>🔔 You have a new order! (ORD-05)</span>
            <Button size="xs" variant="outline" onClick={() => setNewOrderAlert(false)} className="dark:border-black/20 dark:text-black">
              Dismiss
            </Button>
          </div>
        )}

        {/* Order Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pending / New */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">New</h3>
            {orders.filter(o => o.status === 'pending').map(order => (
              <OrderCard key={order.id} order={order} config={statusMap['pending']} onAction={() => handleAction(order.id, 'preparing')} />
            ))}
          </div>

          {/* Preparing */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#8cb800] dark:text-[#d4ff00] uppercase tracking-wider mb-2">Preparing</h3>
            {orders.filter(o => o.status === 'preparing').map(order => (
              <OrderCard key={order.id} order={order} config={statusMap['preparing']} onAction={() => handleAction(order.id, 'ready')} />
            ))}
          </div>

          {/* Ready */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-emerald-500 uppercase tracking-wider mb-2">Ready</h3>
            {orders.filter(o => o.status === 'ready' || o.status === 'completed').map(order => (
              <OrderCard key={order.id} order={order} config={statusMap[order.status]} onAction={order.status === 'ready' ? () => handleAction(order.id, 'completed') : undefined} />
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}

function OrderCard({ order, config, onAction }) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-black text-xl text-zinc-900 dark:text-white">{order.id}</h4>
          <p className="text-sm font-semibold mt-1">{order.customer}</p>
        </div>
        <Badge variant={config.badge}>{config.label}</Badge>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-wrap">{order.items.split(', ').join('\n')}</p>
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-zinc-500 font-semibold">{order.time}</span>
        {onAction && (
          <Button size="sm" onClick={onAction}>
            {config.actionText}
          </Button>
        )}
      </div>
    </Card>
  );
}
