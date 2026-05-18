import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import VendorInstructionsModal from '../../components/VendorInstructionsModal';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';


export default function VendorDashboard() {
  const { user, setUser } = useAuth();
  const [vendorType, setVendorType] = useState(user?.vendorType || 'food');
  const isSalon = vendorType === 'salon';
  const [activeTab, setActiveTab] = useState('orders'); // Default to orders for both, or bookings for salon if preferred

  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [stylists, setStylists] = useState([]);
  const [tokenModal, setTokenModal] = useState({ isOpen: false, type: '', id: '', token: '' });

  
  const audioRef = useRef(null);
  const prevOrdersCount = useRef(0);

  // Fetch fresh vendor profile so vendorType is always correct
  // (covers vendors who logged in before the field was added)
  useEffect(() => {
    const syncProfile = async () => {
      if (!localStorage.getItem('ql_token')) return;
      try {
        const res = await api.get('/vendor/profile');
        const freshVendorType = res.data.data?.vendorType || 'food';
        setVendorType(freshVendorType);
        if (setUser) {
          setUser(prev => prev ? { ...prev, vendorType: freshVendorType } : prev);
        }
      } catch (e) {
        console.error('Failed to sync profile', e);
      }
    };
    syncProfile();
  }, []);


  const fetchOrders = async () => {
    if (!localStorage.getItem('ql_token')) return;
    try {
      const res = await api.get('/orders/vendor');

      const newOrders = res.data.data;
      
      // Sound notification for new orders
      const pendingCount = newOrders.filter(o => ['pending', 'placed'].includes(o.status)).length;
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
    if (!localStorage.getItem('ql_token')) return;
    try {
      const res = await api.get('/vendor/generate-qr');

      setQrData(res.data.data);
    } catch (err) {
      console.error('Failed to generate QR');
    }
  };

  const fetchBookings = async () => {
    if (!localStorage.getItem('ql_token')) return;
    try {
      const res = await api.get('/bookings/vendor');

      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings');
    }
  };

  const fetchStylists = async () => {
    if (!localStorage.getItem('ql_token')) return;
    try {
      const res = await api.get('/vendor/stylists');

      setStylists(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch stylists');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchQr();
    fetchBookings(); // Both might have bookings/slots now
    
    if (isSalon) {
      fetchStylists();
    }
    
    const seen = localStorage.getItem('ql_instructions_seen');
    if (!seen) setShowInstructions(true);

    const interval = setInterval(() => {
      if (localStorage.getItem('ql_token')) {
        fetchOrders();
        fetchBookings();
      }
    }, 5000);

    window.addEventListener('orderPlaced', fetchOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener('orderPlaced', fetchOrders);
    };
  }, [isSalon]);

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem('ql_instructions_seen', 'true');
  };

  const updateOrderStatus = async (id, newStatus, payload = {}) => {
    try {
      const order = orders.find(o => o.id === id);
      if (newStatus === 'accepted' && order?.expiresAt && new Date() > new Date(order.expiresAt)) {
        alert('This order has expired.');
        return;
      }
      await api.patch(`/orders/${id}`, { status: newStatus, ...payload });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const updateBookingStatus = async (id, newStatus, payload = {}) => {
    try {
      await api.patch(`/bookings/${id}`, { status: newStatus, ...payload });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const handleAcceptWithToken = (type, id) => {
    setTokenModal({ isOpen: true, type, id, token: '' });
  };

  const submitToken = async () => {
    if (!/^\d{3}$/.test(tokenModal.token)) {
      alert('Token must be a 3-digit number');
      return;
    }

    if (tokenModal.type === 'order') {
      await updateOrderStatus(tokenModal.id, 'accepted', { tokenNumber: tokenModal.token });
    } else {
      await updateBookingStatus(tokenModal.id, 'accepted', { tokenNumber: tokenModal.token });
    }

    setTokenModal({ isOpen: false, type: '', id: '', token: '' });
  };
  
  const handleDeleteStylist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stylist?')) return;
    try {
      await api.delete(`/vendor/stylists/${id}`);
      fetchStylists();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete stylist');
    }
  };



  const sortedOrders = [...orders].sort((a, b) => {
    // Priority 1: Time comparison
    const timeA = a.scheduledTime ? new Date(a.scheduledTime) : new Date(a.createdAt);
    const timeB = b.scheduledTime ? new Date(b.scheduledTime) : new Date(b.createdAt);
    
    if (timeA.getTime() !== timeB.getTime()) {
      return timeA - timeB;
    }
    
    // Priority 2: Manual Token Index
    return (a.tokenIndex || 0) - (b.tokenIndex || 0);
  });
  
  const pendingOrders = sortedOrders.filter((o) => ['pending', 'placed', 'live'].includes(o.status));
  const activeOrders = sortedOrders.filter((o) => ['accepted', 'preparing', 'ready', 'handover_pending'].includes(o.status));
  const completedOrders = sortedOrders.filter((o) => ['completed', 'cancelled'].includes(o.status));
  
  const scheduledOrders = sortedOrders.filter(o => o.status === 'upcoming');

  const now = new Date();
  
  // Categorize Salon Bookings
  const sortedBookings = [...bookings].sort((a, b) => new Date(a.slotTime) - new Date(b.slotTime));

  const upcomingBookings = sortedBookings.filter(b => {
    if (['completed', 'cancelled'].includes(b.status)) return false;
    const slotTime = new Date(b.slotTime);
    // Future appointments (more than 15 mins away and haven't started)
    return slotTime.getTime() > now.getTime() + 15 * 60000 && !['in_service'].includes(b.status);
  });

  const liveBookings = sortedBookings.filter(b => {
    if (['completed', 'cancelled'].includes(b.status)) return false;
    const slotTime = new Date(b.slotTime);
    // Live services (within 15 mins, or already started)
    return slotTime.getTime() <= now.getTime() + 15 * 60000 || ['in_service'].includes(b.status);
  });

  const completedBookings = sortedBookings.filter(b => ['completed', 'cancelled'].includes(b.status));


  if (loading && activeTab === 'orders') return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" />

      {/* Tabs */}
      <div className="max-w-7xl mx-auto flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-[#d4ff00] text-black shadow-lg shadow-[#d4ff00]/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-white'}`}
        >
          {isSalon ? 'Live Services' : 'Live Orders'}
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'bookings' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-white'}`}
        >
          {isSalon ? 'Upcoming Appointments' : 'Slot Booking'}
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'qr' ? 'bg-[#d4ff00] text-black shadow-lg shadow-[#d4ff00]/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-white'}`}
        >
          Digital QR
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#d4ff00] text-black shadow-lg shadow-[#d4ff00]/20' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-white'}`}
        >
          Settings
        </button>
      </div>



      {activeTab === 'orders' ? (
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          {isSalon ? (
            <>
              {/* ─── UPCOMING APPOINTMENTS ─── */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="p-6 rounded-3xl border border-purple-500/30 bg-purple-500/5 text-zinc-900 dark:text-white relative overflow-hidden shadow-2xl">
                  <h2 className="text-xl font-black mb-1">Upcoming Appointments</h2>
                  <p className="text-sm text-zinc-500">
                    You have <span className="font-black text-purple-500">{upcomingBookings.length}</span> future bookings.
                  </p>
                </div>
                <div className="space-y-4">
                  {upcomingBookings.map(booking => (
                    <SalonServiceCard 
                      key={booking.id} 
                      booking={booking} 
                      stylists={stylists}
                      onAssignStylist={async (id, val) => {
                        if (!val) return;
                        try {
                          await api.patch(`/bookings/${id}`, { stylistId: val });
                          fetchBookings();
                        } catch(e) {
                          alert(e.response?.data?.message || 'Failed');
                        }
                      }}
                    >
                      {booking.status === 'placed' && (
                        <button onClick={() => handleAcceptWithToken('booking', booking.id)}
                          className="w-full py-2.5 text-xs font-black bg-[#d4ff00] text-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#d4ff00]/10">
                          Accept Booking
                        </button>
                      )}
                    </SalonServiceCard>
                  ))}
                  {upcomingBookings.length === 0 && <EmptyState text="No upcoming appointments." />}
                </div>
              </div>

              {/* ─── LIVE SERVICES ─── */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <div className="p-6 rounded-3xl border border-[#d4ff00]/30 bg-[#d4ff00]/5 text-zinc-900 dark:text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
                  </div>
                  <h2 className="text-xl font-black mb-1">Live Services</h2>
                  <p className="text-sm text-zinc-500">
                    <span className="font-black text-[#d4ff00]">{liveBookings.length}</span> active services.
                  </p>
                </div>
                <div className="space-y-4">
                  {liveBookings.map(booking => {
                    const isBeforeService = now < new Date(booking.slotTime);
                    const slotTimeString = new Date(booking.slotTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <SalonServiceCard 
                        key={booking.id} 
                        booking={booking} 
                        stylists={stylists}
                        onAssignStylist={async (id, val) => {
                          if (!val) return;
                          try {
                            await api.patch(`/bookings/${id}`, { stylistId: val });
                            fetchBookings();
                          } catch(e) {
                            alert(e.response?.data?.message || 'Failed');
                          }
                        }}
                      >
                        {booking.status === 'placed' && (
                          <button onClick={() => handleAcceptWithToken('booking', booking.id)}
                            className="w-full py-2.5 text-xs font-black bg-[#d4ff00] text-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#d4ff00]/10">
                            Accept Booking
                          </button>
                        )}
                        {booking.status === 'accepted' && (
                          <button 
                            onClick={async () => { 
                              if (isBeforeService) return;
                              try {
                                await api.patch(`/bookings/${booking.id}`, { status: 'in_service' }); 
                                fetchBookings(); 
                              } catch(err) {
                                alert(err.response?.data?.message || 'Failed to start service');
                              }
                            }}
                            disabled={isBeforeService}
                            className={`w-full py-2.5 text-xs font-black rounded-xl transition-all shadow-lg ${
                              isBeforeService 
                                ? 'bg-zinc-200 dark:bg-zinc-800/80 text-zinc-500 cursor-not-allowed shadow-none border border-zinc-300 dark:border-zinc-700' 
                                : 'bg-purple-500 text-white hover:scale-[1.02] active:scale-95 shadow-purple-500/10'
                            }`}
                          >
                            {isBeforeService ? `Available at ${slotTimeString}` : 'Start Service'}
                          </button>
                        )}
                        {booking.status === 'in_service' && (
                          <button onClick={async () => { await api.patch(`/bookings/${booking.id}`, { status: 'completed' }); fetchBookings(); }}
                            className="w-full py-2.5 text-xs font-black bg-emerald-500 text-white rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/10">
                            Complete Service
                          </button>
                        )}
                        {booking.paymentStatus === 'pending' && (
                          <button onClick={async () => { await api.patch(`/bookings/${booking.id}/pay`); fetchBookings(); }}
                            className="w-full py-2.5 text-xs font-black bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl hover:scale-[1.02] active:scale-95 transition-all mt-2">
                            Collect Payment (₹{booking.totalAmount})
                          </button>
                        )}
                      </SalonServiceCard>
                    );
                  })}
                  {liveBookings.length === 0 && <EmptyState text="No live services right now." />}
                </div>
              </div>

              {/* ─── HISTORY ─── */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-2 border-b border-zinc-800 pb-2">History ({completedBookings.length})</h3>
                <div className="space-y-4">
                  {completedBookings.slice(0, 10).map(booking => {
                    const slotDate = new Date(booking.slotTime);
                    let slotStr = slotDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
                    if (booking.slotEndTime) {
                      const endDate = new Date(booking.slotEndTime);
                      slotStr = `${slotStr} - ${endDate.toLocaleString('en-IN', { timeStyle: 'short' })}`;
                    }
                    return (
                      <div key={booking.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex justify-between items-center text-sm opacity-70 hover:opacity-100 transition-opacity">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{booking.customerName}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            ID: {booking.id.slice(0, 8)} • <span className={booking.status === 'cancelled' ? 'text-red-500 font-bold uppercase' : 'text-emerald-500 font-bold uppercase'}>{booking.status}</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">📅 {slotStr}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className="font-black text-purple-500 block">{formatCurrency(booking.totalAmount)}</span>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase mt-1 block">
                            {booking.stylist?.name || 'No Stylist'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {completedBookings.length === 0 && <EmptyState text="No completed services today." />}
                </div>
              </div>
            </>
          ) : (
            <>
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
                      <Button size="sm" fullWidth onClick={() => handleAcceptWithToken('order', order.id)}>
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
                          <>
                            {order.pickupConfirmedByCustomer && (
                              <div className="mb-2 p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                  ✅ Customer Already Confirmed
                                </p>
                              </div>
                            )}
                            <Button size="sm" fullWidth onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                              Complete Handover
                            </Button>
                          </>
                        )}
                        {order.status === 'handover_pending' && (
                          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
                              Waiting for Customer Confirmation
                            </p>
                          </div>
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
                            <p className="text-[10px] text-zinc-500">
                              ID: {order.id.slice(0, 8)} • <span className={order.status === 'cancelled' ? 'text-red-500' : 'text-emerald-500 font-bold uppercase'}>{order.status}</span>
                            </p>
                          </div>
                          <span className="font-black text-[#d4ff00]">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      ))}
                      {completedOrders.length === 0 && <EmptyState text="No completed orders today." />}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : activeTab === 'bookings' ? (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-black mb-6 text-zinc-900 dark:text-white">{isSalon ? 'Upcoming Appointments' : 'Upcoming Scheduled Orders'}</h2>

          {(isSalon ? upcomingBookings.length === 0 : scheduledOrders.length === 0) ? (
            <div className="text-center py-20 text-zinc-400">
              <div className="text-5xl mb-4">{isSalon ? '💇' : '📅'}</div>
              <p className="font-bold">No {isSalon ? 'upcoming appointments' : 'scheduled orders'} yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Salon Bookings */}
              {isSalon && upcomingBookings.map(booking => (
                <SalonServiceCard 
                  key={booking.id} 
                  booking={booking} 
                  stylists={stylists}
                  onAssignStylist={async (id, val) => {
                    if (!val) return;
                    try {
                      await api.patch(`/bookings/${id}`, { stylistId: val });
                      fetchBookings();
                    } catch(e) {
                      alert(e.response?.data?.message || 'Failed');
                    }
                  }}
                >
                  {booking.status === 'placed' && (
                    <button onClick={() => handleAcceptWithToken('booking', booking.id)}
                      className="w-full py-2.5 text-xs font-black bg-[#d4ff00] text-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#d4ff00]/10">
                      Accept Booking
                    </button>
                  )}
                </SalonServiceCard>
              ))}

              {/* Food Scheduled Orders */}
              {!isSalon && scheduledOrders.map(order => (
                <OrderCard key={order.id} order={order}>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-purple-500 mb-1">Status: Upcoming</p>
                    <p className="text-xs text-zinc-500">This order will automatically move to Live Orders when preparation time starts.</p>
                  </div>
                </OrderCard>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'settings' ? (
        <div className="max-w-xl mx-auto">
           <Card className="p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Store Settings</h2>
              <p className="text-zinc-500 text-sm mb-8">Configure how your store handles orders and bookings.</p>
              
              <div className="space-y-6">
                {/* Slot Booking Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">Enable Time Slot Booking</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Allow customers to schedule pickups</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const newVal = !user.slotEnabled;
                        await api.patch('/vendor/profile', { slotEnabled: newVal });
                        setUser({ ...user, slotEnabled: newVal });
                        toast.success(`Slot booking ${newVal ? 'enabled' : 'disabled'}`);
                      } catch (err) {
                        toast.error('Failed to update slot settings');
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition-all relative ${user.slotEnabled ? 'bg-[#d4ff00]' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${user.slotEnabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {user.slotEnabled && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Slot Duration (min)</label>
                        <select 
                          value={user.slotDuration || 30}
                          onChange={async (e) => {
                            try {
                              const val = parseInt(e.target.value);
                              await api.patch('/vendor/profile', { slotDuration: val });
                              setUser({ ...user, slotDuration: val });
                              toast.success('Slot duration updated');
                            } catch (err) {
                              toast.error('Failed to update duration');
                            }
                          }}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
                        >
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={45}>45 mins</option>
                          <option value={60}>60 mins</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Max Orders / Slot</label>
                        <input 
                          type="number"
                          value={user.maxOrdersPerSlot || 5}
                          onChange={async (e) => {
                            try {
                              const val = parseInt(e.target.value);
                              if (isNaN(val) || val < 1) return;
                              await api.patch('/vendor/profile', { maxOrdersPerSlot: val });
                              setUser({ ...user, maxOrdersPerSlot: val });
                              toast.success('Max orders updated');
                            } catch (err) {
                              toast.error('Failed to update capacity');
                            }
                          }}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Opening Time</label>
                        <input 
                          type="time"
                          value={user.openingTime || '09:00'}
                          onChange={async (e) => {
                            try {
                              const val = e.target.value;
                              await api.patch('/vendor/profile', { openingTime: val });
                              setUser({ ...user, openingTime: val });
                              toast.success('Opening time updated');
                            } catch (err) {
                              toast.error('Failed to update opening time');
                            }
                          }}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Closing Time</label>
                        <input 
                          type="time"
                          value={user.closingTime || '21:00'}
                          onChange={async (e) => {
                            try {
                              const val = e.target.value;
                              await api.patch('/vendor/profile', { closingTime: val });
                              setUser({ ...user, closingTime: val });
                              toast.success('Closing time updated');
                            } catch (err) {
                              toast.error('Failed to update closing time');
                            }
                          }}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white mb-4 uppercase tracking-widest">Business Details</h3>
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Outlet Name</label>
                          <input 
                            value={user.outletName || ''}
                            onChange={async (e) => {
                              try {
                                const val = e.target.value;
                                await api.patch('/vendor/profile', { outletName: val });
                                setUser({ ...user, outletName: val });
                                // Using a debounced approach or just standard onChange?
                                // For simplicity and immediate persistence as before:
                              } catch(e) {}
                            }}
                            onBlur={async (e) => {
                              toast.success('Outlet name updated');
                            }}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                          <input 
                            value={user.mobile || ''}
                            onChange={async (e) => {
                              try {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length > 10) return;
                                await api.patch('/vendor/profile', { mobile: val });
                                setUser({ ...user, mobile: val });
                              } catch(e) {}
                            }}
                            onBlur={() => toast.success('Phone number updated')}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00]"
                          />
                        </div>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Store Address</label>
                        <textarea 
                          value={user.address || ''}
                          onChange={async (e) => {
                            try {
                              const val = e.target.value;
                              await api.patch('/vendor/profile', { address: val });
                              setUser({ ...user, address: val });
                            } catch(e) {}
                          }}
                          onBlur={() => toast.success('Address updated')}
                          rows={2}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Store Description</label>
                        <textarea 
                          value={user.storeDescription || ''}
                          onChange={async (e) => {
                            try {
                              const val = e.target.value;
                              await api.patch('/vendor/profile', { storeDescription: val });
                              setUser({ ...user, storeDescription: val });
                            } catch(e) {}
                          }}
                          onBlur={() => toast.success('Description updated')}
                          rows={3}
                          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4ff00] resize-none"
                        />
                      </div>
                  </div>
                </div>
              </div>
           </Card>
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
                      link.download = 'qzaam-menu-qr.png';
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

          {/* Stylist Management */}
          {isSalon && (
            <Card className="mt-8 p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl">
              <div className="text-left w-full">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1">Manage Stylists</h3>
                <p className="text-xs text-zinc-500 mb-6">Add your team members to assign them to bookings.</p>
                
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Stylist Name" 
                    id="new-stylist-name"
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#d4ff00]"
                  />
                  <Button size="sm" onClick={async () => {
                    const input = document.getElementById('new-stylist-name');
                    if (!input.value.trim()) return;
                    await api.post('/vendor/stylists', { name: input.value });
                    input.value = '';
                    fetchStylists();
                  }}>
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {stylists.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{s.name}</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-black">Active</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteStylist(s.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Delete Stylist"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {stylists.length === 0 && <p className="text-center text-zinc-400 text-xs py-4">No stylists added yet.</p>}
                </div>
              </div>
            </Card>
          )}

        </div>
      )}

      <VendorInstructionsModal 
        isOpen={showInstructions} 
        onClose={handleCloseInstructions} 
      />

      {/* Manual Token Assignment Modal */}
      {tokenModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Assign Token</h3>
            <p className="text-sm text-zinc-500 mb-6">Enter a 3-digit token number for this {tokenModal.type}.</p>
            
            <input 
              autoFocus
              type="text" 
              maxLength="3"
              placeholder="e.g. 102"
              value={tokenModal.token}
              onChange={(e) => setTokenModal(prev => ({ ...prev, token: e.target.value.replace(/\D/g, '') }))}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl px-6 py-4 text-2xl font-black tracking-[0.5em] text-center outline-none focus:border-[#d4ff00] transition-all mb-6"
            />
            
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setTokenModal({ isOpen: false, type: '', id: '', token: '' })}>
                Cancel
              </Button>
              <Button fullWidth onClick={submitToken} disabled={tokenModal.token.length !== 3}>
                Confirm & Accept
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

// ─── Helpers ─── 

function OrderCard({ order, children }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!['placed', 'pending', 'accepted', 'preparing'].includes(order.status)) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [order.status]);

  const getStageTimeLeft = () => {
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

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    placed: 'bg-yellow-500/10 text-yellow-500',
    upcoming: 'bg-purple-500/10 text-purple-500',
    live: 'bg-emerald-500/10 text-emerald-500',
    accepted: 'bg-blue-500/10 text-blue-500',
    preparing: 'bg-amber-500/10 text-amber-500',
    ready: 'bg-emerald-500/10 text-emerald-500',
    handover_pending: 'bg-blue-500/10 text-blue-500',
    completed: 'bg-zinc-500/10 text-zinc-500',
    cancelled: 'bg-red-500/10 text-red-500'
  };

  return (
    <Card className="p-5 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 flex flex-col gap-4 hover:border-[#d4ff00]/40 transition-all shadow-xl">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${statusColors[order.status]}`}>
               {order.status === 'upcoming' ? '🟣 Upcoming' : order.status === 'live' ? '🟢 Live' : order.status}
             </span>
             {order.tokenNumber ? (
               <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                 Token: {order.tokenNumber}
               </span>
             ) : (
               <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                 Token: Pending
               </span>
             )}

             <span className="text-[10px] font-bold text-zinc-600">ID: {order.id.slice(0, 8)}</span>
          </div>
          <h4 className="font-black text-zinc-900 dark:text-white truncate">{order.customerName}</h4>
          <p className="text-xs text-zinc-500">{order.customerPhone}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-[#d4ff00]">{formatCurrency(order.totalAmount)}</p>
          <p className="text-[10px] text-zinc-500 mt-1">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          {order.scheduledTime ? (
            <div className={`mt-2 border rounded-lg p-2 text-right ${order.status === 'upcoming' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
              <p className={`text-[8px] uppercase font-black tracking-widest ${order.status === 'upcoming' ? 'text-purple-500' : 'text-emerald-500'}`}>
                {order.status === 'upcoming' ? 'Scheduled Pickup' : 'Activated Order'}
              </p>
              <p className={`text-xs font-black ${order.status === 'upcoming' ? 'text-purple-500' : 'text-emerald-500'}`}>
                {new Date(order.scheduledTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} · {new Date(order.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              {order.status === 'upcoming' && order.activationTime && (
                <p className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">Activation: {new Date(order.activationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-zinc-500 mt-1 font-bold">⏱ Delivery: {order.deliveryTime || 'ASAP'}</p>
          )}
          <p className="text-[10px] text-emerald-500 font-bold mt-1">Paid (Online): {formatCurrency(order.platformFee || 0)}</p>
          <p className="text-[10px] text-zinc-400 font-bold">Collect at Stall: {formatCurrency(order.totalAmount)}</p>

          {['placed', 'pending', 'accepted', 'preparing', 'ready'].includes(order.status) && (
            <p className="text-xs font-black mt-1 text-red-500 animate-pulse">
              ⏳ {Math.floor(getStageTimeLeft() / 60)}m {getStageTimeLeft() % 60}s left
            </p>
          )}
          {order.customerAction && (
             <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
               <span className="text-xs">
                 {order.customerAction === 'coming' && '🚗 Coming'}
                 {order.customerAction === 'delayed' && `⏰ Delayed by ${order.customerDelayMinutes || 5}m`}
                 {order.customerAction === 'contact' && '📞 Contact'}
               </span>
             </div>
          )}
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

function SalonServiceCard({ booking, children, stylists, onAssignStylist }) {
  const statusColors = {
    placed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    accepted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    in_service: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  const statusLabels = {
    placed: 'Booked',
    accepted: 'Accepted',
    in_service: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  const slotDate = new Date(booking.slotTime);
  let slotStr = slotDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  if (booking.slotEndTime) {
    const endDate = new Date(booking.slotEndTime);
    slotStr = `${slotStr} - ${endDate.toLocaleString('en-IN', { timeStyle: 'short' })}`;
  }

  return (
    <Card className="p-5 bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 flex flex-col gap-4 hover:border-purple-500/40 transition-all shadow-xl">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${statusColors[booking.status]}`}>
               {statusLabels[booking.status]}
             </span>
             {booking.tokenNumber ? (
               <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20">
                 Token: {booking.tokenNumber}
               </span>
             ) : (
               <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                 Token: Pending
               </span>
             )}
          </div>
          <h4 className="font-black text-zinc-900 dark:text-white truncate">{booking.customerName}</h4>
          <p className="text-xs text-zinc-500">{booking.customerPhone}</p>
          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">📅 {slotStr}</p>
        </div>
        <div className="text-right shrink-0 ml-2">
          <p className="text-[10px] text-emerald-500 font-bold mb-0.5">Online: {formatCurrency(booking.platformFee || 0)}</p>
          <p className="text-sm font-black text-purple-500">Salon: {formatCurrency(booking.totalAmount)}</p>
          <p className="text-[10px] text-zinc-500 mt-1">ID: {booking.id.slice(0, 8)}</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <p className="text-[10px] font-black uppercase text-zinc-500">
          {booking.stylistPreference === 'anyone' ? (
            <>Stylist Preference: <span className="text-purple-500">Anyone</span></>
          ) : (
            <>Assigned Stylist: <span className="text-purple-500">{booking.stylist?.name || 'None'}</span></>
          )}
        </p>
        {booking.stylistPreference === 'anyone' && !['completed', 'cancelled'].includes(booking.status) && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase">Assign:</span>
            <select 
              className="flex-1 text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 outline-none focus:border-purple-500 transition-colors"
              value={booking.stylistId || ''}
              onChange={(e) => onAssignStylist(booking.id, e.target.value)}
            >
              <option value="">Select Stylist</option>
              {stylists.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {Array.isArray(booking.services) && (
        <div className="text-xs text-zinc-500 space-y-0.5">
          {booking.services.map((s, i) => <p key={i}>✂️ {s.name} — {s.duration}m</p>)}
        </div>
      )}

      {booking.customerAction && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold animate-pulse ${
          booking.customerAction === 'coming' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' :
          booking.customerAction === 'delayed' ? 'bg-amber-500/10 border-amber-500/30 text-amber-600' :
          'bg-blue-500/10 border-blue-500/30 text-blue-600'
        }`}>
          {booking.customerAction === 'coming' && '🚗 Customer is Coming'}
          {booking.customerAction === 'delayed' && `⏰ Delayed by ${booking.customerDelayMinutes || 5}m`}
          {booking.customerAction === 'contact' && '📞 Please Contact'}
        </div>
      )}

      {booking.hasArrived && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20">
          <span>✅</span> Customer Arrived
        </div>
      )}

      <div className="pt-2 flex flex-col gap-2">
        {children}
      </div>
    </Card>
  );
}

