import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import VendorInstructionsModal from '../../components/VendorInstructionsModal';
import Spinner from '../../components/Spinner';

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  
  const audioRef = useRef(null);
  const prevOrdersCount = useRef(0);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/vendor');
      const newOrders = res.data.data;
      
      // Sound notification for new orders
      const pendingCount = newOrders.filter(o => o.status === 'pending').length;
      if (pendingCount > prevOrdersCount.current && audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }
      prevOrdersCount.current = pendingCount;
      
      setOrders(newOrders);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch orders.');
      setLoading(false);
    }
  };

  const fetchQr = async () => {
    try {
      const res = await api.get('/vendor/generate-qr');
      setQrData(res.data.data);
    } catch (err) {
      console.error('Failed to generate QR');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchQr();
    
    // Check if instructions should be shown
    const seen = localStorage.getItem('ql_instructions_seen');
    if (!seen) {
      setShowInstructions(true);
    }

    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem('ql_instructions_seen', 'true');
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await api.patch(`/orders/${id}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status');
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter((o) => ['accepted', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'completed');

  if (loading && activeTab === 'orders') return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" />

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-[#d4ff00] text-black shadow-lg shadow-[#d4ff00]/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-white'}`}
        >
          Live Orders
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'qr' ? 'bg-[#d4ff00] text-black shadow-lg shadow-[#d4ff00]/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-white'}`}
        >
          Digital QR
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* ─── NEW ORDERS ─── */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="p-6 rounded-3xl border border-[#d4ff00]/30 bg-[#d4ff00]/5 text-zinc-900 dark:text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
              </div>
              <h2 className="text-xl font-black mb-1">Incoming Requests</h2>
              <p className="text-sm text-zinc-500">
                You have <span className="font-black text-[#d4ff00]">{pendingOrders.length}</span> new orders!
              </p>
            </div>

            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order}>
                  <Button size="sm" fullWidth onClick={() => updateOrderStatus(order.id, 'accepted')}>
                    Accept Order
                  </Button>
                </OrderCard>
              ))}
              {pendingOrders.length === 0 && <EmptyState text="No incoming orders right now." />}
            </div>
          </div>

          {/* ─── ACTIVE KITCHEN ─── */}
          <div className="w-full lg:w-2/3 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Accepted & Preparing */}
              <div className="space-y-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-amber-500 mb-4 border-b border-zinc-800 pb-2">Kitchen Workflow ({activeOrders.length})</h3>
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order}>
                    {order.status === 'accepted' && (
                      <Button size="sm" variant="outline" fullWidth onClick={() => updateOrderStatus(order.id, 'preparing')}>
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" fullWidth onClick={() => updateOrderStatus(order.id, 'ready')} className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button size="sm" fullWidth onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                        Complete Handover
                      </Button>
                    )}
                  </OrderCard>
                ))}
                {activeOrders.length === 0 && <EmptyState text="Kitchen is currently clear." />}
              </div>

              {/* Recently Completed */}
              <div className="space-y-4">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">History ({completedOrders.length})</h3>
                <div className="space-y-3">
                  {completedOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex justify-between items-center text-sm opacity-60">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{order.customerName}</p>
                        <p className="text-[10px] text-zinc-500">ID: {order.id.slice(0, 8)}</p>
                      </div>
                      <span className="font-black text-[#d4ff00]">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  ))}
                  {completedOrders.length === 0 && <EmptyState text="No completed orders today." />}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <Card className="p-8 flex flex-col items-center text-center bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] text-[10px] font-black uppercase tracking-widest mb-4">
                Your Store Terminal
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Digital Menu QR</h2>
              <p className="text-zinc-500 text-sm mt-1">Place this QR at your counter for instant ordering.</p>
            </div>
            
            {qrData ? (
              <div className="space-y-8 flex flex-col items-center w-full">
                <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_0_60px_rgba(212,255,0,0.15)] border border-zinc-100">
                  <img 
                    id="store-qr"
                    src={qrData.qrUrl} 
                    alt="Store QR" 
                    className="w-56 h-56" 
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Button 
                    fullWidth 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrData.qrUrl;
                      link.download = 'queueless-menu-qr.png';
                      link.target = '_blank'; // Needed for external URLs sometimes
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-[#d4ff00] text-black border-none hover:bg-[#8cb800]"
                  >
                    Download QR Code
                  </Button>
                  <Button variant="outline" fullWidth onClick={() => window.open(qrData.menuUrl, '_blank')}>
                    Preview Menu
                  </Button>
                </div>
                
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Store Link</p>
                  <p className="text-xs text-zinc-500 break-all font-medium select-all cursor-pointer">{qrData.menuUrl}</p>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#d4ff00]/20 border-t-[#d4ff00] rounded-full animate-spin"></div>
                <p className="text-zinc-500 font-bold animate-pulse">Generating your terminal...</p>
              </div>
            )}
          </Card>
        </div>
      )}

      <VendorInstructionsModal 
        isOpen={showInstructions} 
        onClose={handleCloseInstructions} 
      />
    </div>
  );
}

// ─── Helpers ─── 

function OrderCard({ order, children }) {
  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    accepted: 'bg-blue-500/10 text-blue-500',
    preparing: 'bg-amber-500/10 text-amber-500',
    ready: 'bg-emerald-500/10 text-emerald-500',
    completed: 'bg-zinc-500/10 text-zinc-500'
  };

  return (
    <Card className="p-5 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 flex flex-col gap-4 hover:border-[#d4ff00]/40 transition-all shadow-xl">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${statusColors[order.status]}`}>
               {order.status}
             </span>
             <span className="text-[10px] font-bold text-zinc-600">ID: {order.id.slice(0, 8)}</span>
          </div>
          <h4 className="font-black text-zinc-900 dark:text-white truncate">{order.customerName}</h4>
          <p className="text-xs text-zinc-500">{order.customerPhone}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-[#d4ff00]">{formatCurrency(order.totalAmount)}</p>
          <p className="text-[10px] text-zinc-500 mt-1">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      
      <div className="py-3 border-y border-zinc-100 dark:border-zinc-800">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Order Items</p>
        <div className="space-y-1">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-300">{item.name} <span className="text-[10px] text-zinc-500">× {item.quantity}</span></span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-1">{children}</div>
    </Card>
  );
}

function EmptyState({ text }) {
  return (
    <div className="p-8 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl flex items-center justify-center text-center">
      <p className="text-sm text-zinc-500">{text}</p>
    </div>
  );
}

