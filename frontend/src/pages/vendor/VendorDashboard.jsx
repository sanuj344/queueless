import { useState } from 'react';
import { mockOrders } from '../../data/mockOrders';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function VendorDashboard() {
  const [orders, setOrders] = useState(mockOrders);

  const updateOrderStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 flex flex-col md:flex-row gap-6">
      
      {/* ─── LIVE ORDER TICKER ─── */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="p-4 rounded-3xl border border-[#8cb800]/30 bg-[#8cb800]/5 dark:bg-[#d4ff00]/5 text-zinc-900 dark:text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
          </div>
          <h2 className="text-xl font-bold mb-1">New Orders Alert</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You have <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">{pendingOrders.length}</span> new requests waiting!
          </p>
        </div>

        <h3 className="font-bold text-lg text-zinc-900 dark:text-white mt-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Pending ({pendingOrders.length})</h3>
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <OrderCard key={order.id} order={order}>
              <Button size="sm" fullWidth onClick={() => updateOrderStatus(order.id, 'preparing')}>
                Accept & Prepare
              </Button>
            </OrderCard>
          ))}
          {pendingOrders.length === 0 && <EmptyState text="No incoming orders right now." />}
        </div>
      </div>

      {/* ─── KITCHEN & DISPATCH DASHBOARD ─── */}
      <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Preparing */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">Preparing ({preparingOrders.length})</h3>
          <div className="space-y-4">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order}>
                <Button size="sm" variant="outline" fullWidth onClick={() => updateOrderStatus(order.id, 'ready')}>
                  Mark Ready
                </Button>
              </OrderCard>
            ))}
            {preparingOrders.length === 0 && <EmptyState text="Kitchen is clear." />}
          </div>
        </div>

        {/* Ready & Completed Grid */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">Ready for Pickup ({readyOrders.length})</h3>
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <OrderCard key={order.id} order={order}>
                  <Button size="sm" fullWidth onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-emerald-500 hover:bg-emerald-600 dark:text-black border-none text-white font-bold">
                    Complete Handover
                  </Button>
                </OrderCard>
              ))}
              {readyOrders.length === 0 && <EmptyState text="No orders waiting for pickup." />}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-lg text-zinc-500 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">Recently Completed ({completedOrders.length})</h3>
            <div className="space-y-2 opacity-60">
              {completedOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-sm">
                  <span className="font-bold text-zinc-900 dark:text-white">{order.id}</span>
                  <span className="text-zinc-500">{order.customer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Helpers ─── 

function OrderCard({ order, children }) {
  return (
    <Card className="p-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{order.id}</span>
          <h4 className="font-bold text-zinc-900 dark:text-white mt-2">{order.item}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{order.customer}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-[#8cb800] dark:text-[#d4ff00]">${order.price.toFixed(2)}</p>
          <p className="text-xs text-zinc-400 mt-1">{order.time}</p>
        </div>
      </div>
      <div className="pt-2">{children}</div>
    </Card>
  );
}

function EmptyState({ text }) {
  return (
    <div className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-center">
      <p className="text-sm text-zinc-400 dark:text-zinc-500">{text}</p>
    </div>
  );
}
