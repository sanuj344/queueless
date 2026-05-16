import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/Button';
import CustomerLoginModal from '../components/CustomerLoginModal';
import toast from 'react-hot-toast';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SkrpjWAPFjMaX5';

const STEPS = [
  { label: 'Select Services', icon: '✂️' },
  { label: 'Pick a Slot', icon: '📅' },
  { label: 'Choose Stylist', icon: '👤' },
  { label: 'Confirm & Pay', icon: '💳' }
];

// generateSlots moved inside component to access dynamic vendor settings

export default function SalonBookingPage({ vendor, vendorId }) {
  const navigate = useNavigate();
  const { customer, user } = useAuth();

  const [step, setStep] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [ratingData, setRatingData] = useState({ avgRating: '0.0', totalReviews: 0 });
  const [reviews, setReviews] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [backendTotals, setBackendTotals] = useState({ subtotal: 0, platformFee: 0, tax: 0, deliveryFee: 0, finalTotal: 0 });

  // Customer info — auto-fill if logged in
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');

  const todayStr = new Date().toISOString().split('T')[0];

  const generateSlots = () => {
    if (!vendor) return [];
    const slots = [];
    const opening = vendor.openingTime || '09:00';
    const closing = vendor.closingTime || '21:00';
    const duration = vendor.slotDuration || 30;

    const [startH, startM] = opening.split(':').map(Number);
    const [endH, endM] = closing.split(':').map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const end = new Date();
    end.setHours(endH, endM, 0, 0);

    while (current < end) {
      const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
      slots.push(timeStr);
      current = new Date(current.getTime() + duration * 60000);
    }
    return slots;
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get(`/services/${vendorId}`);
        setServices(res.data.data || []);
      } catch {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    const fetchRating = async () => {
      try {
        const res = await api.get(`/reviews/vendor/${vendorId}`);
        setRatingData({ avgRating: res.data.avgRating || '0.0', totalReviews: res.data.totalReviews || 0 });
      } catch { /* non-critical */ }
    };
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/list/${vendorId}`);
        setReviews(res.data.data || []);
      } catch { /* non-critical */ }
    };
    const fetchWallet = async () => {
      const activeUser = customer || user;
      if (!activeUser) return;
      
      try {
        let url = `/wallet/${activeUser.id}`;
        // Fallback for existing sessions missing the ID
        if (!activeUser.id && activeUser.phone) {
          url = `/wallet?phone=${activeUser.phone}`;
        } else if (!activeUser.id) {
          return;
        }

        const res = await api.get(url);
        const balance = res.data.wallet ? res.data.wallet.balance : (res.data.balance || 0);
        setWalletBalance(balance);
      } catch (err) {
        console.error("Wallet fetch error:", err);
      }
    };
    fetchServices();
    fetchRating();
    fetchReviews();
    fetchWallet();
  }, [vendorId, user?.id, customer?.id]);

  useEffect(() => {
    if (selectedDate && vendorId) {
      const fetchBookedSlots = async () => {
        try {
          const res = await api.get(`/bookings/vendor/${vendorId}/booked-slots?date=${selectedDate}`);
          setBookedSlots(res.data.data || []);
        } catch {
          console.error("Failed to fetch booked slots");
        }
      };
      fetchBookedSlots();
    }
  }, [selectedDate, vendorId]);

  // Auto-select "Anyone" if no stylists available or to provide a default
  useEffect(() => {
    if (step === 2 && stylists.length === 0 && !selectedStylist) {
      setSelectedStylist({ id: 'anyone', name: 'Anyone' });
    }
  }, [step, stylists, selectedStylist]);


  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration || 30), 0);

  // Fetch totals from backend whenever subtotal changes
  useEffect(() => {
    if (subtotal === 0) {
      setBackendTotals({ subtotal: 0, platformFee: 0, tax: 0, deliveryFee: 0, finalTotal: 0 });
      return;
    }

    const fetchTotals = async () => {
      try {
        const res = await api.post('/orders/calculate-total', {
          subtotal,
          vendorId
        });
        if (res.data.success) {
          setBackendTotals(res.data.data);
          console.log('[DEBUG] Salon Backend Totals:', res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch salon totals:', err);
      }
    };
    fetchTotals();
  }, [subtotal, vendorId]);

  const platformFee = backendTotals.platformFee;
  const finalAmount = backendTotals.finalTotal;

  // Auth guard — only logged-in customers (not vendors) can book
  const requireCustomer = () => {
    if (user?.role === 'vendor' || user?.role === 'admin') {
      toast.error('Vendors cannot place bookings.');
      return false;
    }
    if (!customer) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const buildOrderData = () => ({
    type: 'salon',
    vendorId,
    customerName,
    customerPhone,
    services: selectedServices.map(s => ({ id: s.id, name: s.name, price: s.price, duration: s.duration })),
    totalAmount: backendTotals.subtotal,
    platformFee: backendTotals.platformFee,
    finalAmount: backendTotals.finalTotal,
    slotTime: new Date(`${selectedDate}T${selectedSlot}:00`).toISOString(),
    stylistId: selectedStylist?.id === 'anyone' ? null : selectedStylist?.id,
    stylistPreference: selectedStylist?.id === 'anyone' ? 'anyone' : 'specific'
  });


  const handleRazorpayPay = async () => {
    if (!customerName || !customerPhone) return toast.error('Please fill your details');
    setPaying(true);
    try {
      const orderRes = await api.post('/payment/create-order', { amount: platformFee });
      const razorpayOrder = orderRes.data;
      const orderData = buildOrderData();

      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: vendor?.outletName || 'Salon',
        description: `Salon Booking – ${selectedSlot}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData
            });
            if (verifyRes.data.success) {
              const bookingId = verifyRes.data.booking?.id;
              localStorage.setItem('ql_last_booking_id', bookingId);
              toast.success('Booking confirmed! 🎉');
              navigate(`/booking-status/${bookingId}`);
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: '#d4ff00' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Could not initiate payment');
    } finally {
      setPaying(false);
    }
  };

  const handleWalletPay = async () => {
    const activeUser = customer || user;
    if (!activeUser) return toast.error('Please login to use wallet');
    setPaying(true);
    let url = `/wallet/${activeUser.id}`;
    if (!activeUser.id && activeUser.phone) {
      url = `/wallet?phone=${activeUser.phone}`;
    }

    try {
      const walletRes = await api.get(url);
      const balance = walletRes.data.wallet ? walletRes.data.wallet.balance : (walletRes.data.balance || 0);
      const customerId = walletRes.data.wallet ? (walletRes.data.wallet.customerId || walletRes.data.wallet.userId) : activeUser.id;

      if (balance < platformFee) {
        toast.error(`Insufficient wallet balance. You have ₹${balance}, need ₹${platformFee}`);
        setPaying(false);
        return;
      }

      const orderData = buildOrderData();
      const res = await api.post('/payment/wallet-pay', {
        userId: customerId,
        amount: platformFee,
        commissionAmount: platformFee,
        orderData
      });

      if (res.data.success) {
        const bookingId = res.data.booking?.id;
        localStorage.setItem('ql_last_booking_id', bookingId);
        toast.success('Booking confirmed via Wallet! 🎉');
        navigate(`/booking-status/${bookingId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wallet payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-zinc-500 text-sm animate-pulse">Loading services...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pb-24 transition-colors">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-6">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
              💇
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-zinc-900 dark:text-white">{vendor?.outletName || 'Salon'}</h1>
              <p className="text-sm text-zinc-500 truncate">{vendor?.address?.split('\n')[0]}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-sm ${star <= Math.round(parseFloat(ratingData.avgRating)) ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}>★</span>
                  ))}
                  <span className="text-sm font-black text-zinc-900 dark:text-white ml-1">{ratingData.avgRating}</span>
                  <span className="text-xs text-zinc-400">({ratingData.totalReviews} review{ratingData.totalReviews !== 1 ? 's' : ''})</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" /> Open · Book a slot
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mt-6">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all ${i === step ? 'border-[#d4ff00]/40 bg-[#d4ff00]/5 text-[#8cb800] dark:text-[#d4ff00]' : i < step ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>
              <span>{i < step ? '✓' : s.icon}</span>
              <span className="hidden sm:block">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Step 0: Services */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Select Services</h2>
            {services.length === 0 ? (
              <div className="text-center py-16 text-zinc-400">No services added yet.</div>
            ) : (
              services.map(service => {
                const selected = selectedServices.find(s => s.id === service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selected ? 'border-[#d4ff00]/40 bg-[#d4ff00]/5' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                  >
                    <div>
                      <p className={`font-bold text-sm ${selected ? 'text-[#8cb800] dark:text-[#d4ff00]' : 'text-zinc-900 dark:text-white'}`}>{service.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">⏱ {service.duration} min · {service.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-zinc-900 dark:text-white">{formatCurrency(service.price)}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${selected ? 'border-[#d4ff00] bg-[#d4ff00] text-black' : 'border-zinc-300 dark:border-zinc-600'}`}>
                        {selected && '✓'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
            {selectedServices.length > 0 && (
              <div className="sticky bottom-4 mt-6">
                <button
                  onClick={() => { if (requireCustomer()) setStep(1); }}
                  className="w-full py-4 bg-[#d4ff00] text-black font-black rounded-2xl shadow-[0_0_30px_rgba(212,255,0,0.25)] hover:bg-[#c0e600] transition-all"
                >
                  {customer ? `Next: Pick a Slot → (${selectedServices.length} selected · ${formatCurrency(backendTotals.subtotal)})` : '🔐 Login to Continue'}
                </button>
              </div>
            )}

            {/* Customer Reviews */}
            {reviews.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Customer Reviews</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-sm font-black text-zinc-900 dark:text-white">{ratingData.avgRating}</span>
                    <span className="text-xs text-zinc-400">/ 5</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {review.customer?.name || 'Customer'}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`text-xs ${s <= review.rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-zinc-500 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Date + Slot */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Pick a Date & Slot</h2>
              {!vendor?.slotEnabled && (
                <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-1 rounded-md border border-red-500/20">
                  Online Booking Disabled
                </span>
              )}
            </div>

            {!vendor?.slotEnabled ? (
              <div className="p-8 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <div className="text-3xl mb-3">📵</div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Booking Unavailable</h3>
                <p className="text-xs text-zinc-500">This vendor has temporarily disabled online slot bookings. Please contact them directly.</p>
                <button onClick={() => setStep(0)} className="mt-6 text-sm font-bold text-[#8cb800] dark:text-[#d4ff00] underline">← Back to Services</button>
              </div>
            ) : (
              <>
            <div>
              <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2 block">Select Date</label>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all"
              />
            </div>
            {selectedDate && (
              <div>
                <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-3 block">Available Slots</label>
                <div className="grid grid-cols-4 gap-2">
                  {generateSlots().map(slot => {
                    let isAvailable = true;
                    
                    // 1. Past time check for today
                    if (selectedDate === todayStr) {
                      const now = new Date();
                      const [slotHour, slotMinute] = slot.split(':').map(Number);
                      if (slotHour < now.getHours() || (slotHour === now.getHours() && slotMinute <= now.getMinutes())) {
                        isAvailable = false;
                      }
                    }

                    // 2. Duration overlap check
                    if (isAvailable) {
                      const [startH, startM] = slot.split(':').map(Number);
                      const startMins = startH * 60 + startM;
                      const endMins = startMins + totalDuration;
                      
                      // Cannot book if it exceeds closing time
                      const closing = vendor.closingTime || '21:00';
                      const [closeH, closeM] = closing.split(':').map(Number);
                      const maxMins = closeH * 60 + closeM;

                      if (endMins > maxMins) {
                        isAvailable = false;
                      } else {
                        // Check Max Orders Per Slot (Capacity)
                        const maxOrders = vendor.maxOrdersPerSlot || 5;
                        const bookingsInSlot = bookedSlots.filter(b => b.startTime === slot).length;
                        
                        if (bookingsInSlot >= maxOrders) {
                          isAvailable = false;
                        } else {
                          // Advanced overlap check
                        const stylistIds = vendor?.stylists?.map(s => s.id) || [];
                        
                        if (stylistIds.length === 0) {
                          // Fallback if no specific stylists defined (e.g. single operator)
                          const isOverlapping = bookedSlots.some(booking => {
                            if (!booking.startTime || !booking.endTime) return false;
                            const [bStartH, bStartM] = booking.startTime.split(':').map(Number);
                            const [bEndH, bEndM] = booking.endTime.split(':').map(Number);
                            const bStartMins = bStartH * 60 + bStartM;
                            const bEndMins = bEndH * 60 + bEndM;
                            return startMins < bEndMins && endMins > bStartMins;
                          });
                          if (isOverlapping) isAvailable = false;
                        } else {
                          // Check if ANY stylist is completely free for this duration
                          let hasFreeStylist = false;
                          for (const sid of stylistIds) {
                            const stylistBookings = bookedSlots.filter(b => b.stylistId === sid);
                            const hasOverlapForStylist = stylistBookings.some(booking => {
                              if (!booking.startTime || !booking.endTime) return false;
                              const [bStartH, bStartM] = booking.startTime.split(':').map(Number);
                              const [bEndH, bEndM] = booking.endTime.split(':').map(Number);
                              const bStartMins = bStartH * 60 + bStartM;
                              const bEndMins = bEndH * 60 + bEndM;
                              return startMins < bEndMins && endMins > bStartMins;
                            });
                            if (!hasOverlapForStylist) {
                              hasFreeStylist = true;
                              break;
                            }
                          }
                          if (!hasFreeStylist) isAvailable = false;
                          }
                        }
                      }
                    }

                    // Hide past slots entirely for a cleaner UI
                    if (selectedDate === todayStr && !isAvailable) {
                      const now = new Date();
                      const [slotHour, slotMinute] = slot.split(':').map(Number);
                      if (slotHour < now.getHours() || (slotHour === now.getHours() && slotMinute <= now.getMinutes())) {
                        return null; 
                      }
                    }

                    return (
                      <button
                        key={slot}
                        disabled={!isAvailable}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setSelectedStylist(null);
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedSlot === slot ? 'bg-[#d4ff00] text-black border-[#d4ff00]' : !isAvailable ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed opacity-50' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                      >
                        {slot}
                        {!isAvailable && <div className="text-[8px] opacity-60">Unavailable</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
            {vendor?.slotEnabled && (
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">← Back</button>
                <button
                  disabled={!selectedDate || !selectedSlot}
                  onClick={async () => { 
                    if (requireCustomer()) {
                      setLoading(true);
                      try {
                        const slotISO = new Date(`${selectedDate}T${selectedSlot}:00`).toISOString();
                        const res = await api.get(`/vendors/${vendorId}/available-stylists?slotTime=${slotISO}&duration=${totalDuration}`);
                        setStylists(res.data.data || []);
                        setStep(2);
                      } catch {
                        toast.error("Failed to load stylists");
                      } finally {
                        setLoading(false);
                      }
                    } 
                  }}
                  className="flex-1 py-3 bg-[#d4ff00] text-black font-black rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c0e600] transition-all"
                >
                  Next: Choose Stylist →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Choose Stylist */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Choose a Stylist</h2>
            <div className="grid grid-cols-1 gap-3">
              {/* ANYONE OPTION */}
              <button
                onClick={() => setSelectedStylist({ id: 'anyone', name: 'Anyone' })}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedStylist?.id === 'anyone' ? 'border-purple-500/40 bg-purple-500/5' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${selectedStylist?.id === 'anyone' ? 'bg-purple-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                    ✨
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${selectedStylist?.id === 'anyone' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-white'}`}>Anyone</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Salon will assign available stylist</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${selectedStylist?.id === 'anyone' ? 'border-purple-500 bg-purple-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                  {selectedStylist?.id === 'anyone' && '✓'}
                </div>
              </button>

              {stylists.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm">No other specific stylists available for this slot.</div>
              ) : (
                stylists.map(s => (
                  <button
                    key={s.id}
                    disabled={s.isBooked}
                    onClick={() => setSelectedStylist(s)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${selectedStylist?.id === s.id ? 'border-purple-500/40 bg-purple-500/5' : s.isBooked ? 'opacity-50 grayscale cursor-not-allowed border-zinc-200 dark:border-zinc-800' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${selectedStylist?.id === s.id ? 'bg-purple-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${selectedStylist?.id === s.id ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-white'}`}>{s.name}</p>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{s.isBooked ? 'Fully Booked' : 'Available'}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${selectedStylist?.id === s.id ? 'border-purple-500 bg-purple-500 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
                      {selectedStylist?.id === s.id && '✓'}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">← Back</button>
              <button
                disabled={!selectedStylist}
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#d4ff00] text-black font-black rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c0e600] transition-all"
              >
                Next: Confirm →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm + Pay */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Confirm Booking</h2>

            {/* Customer Details */}
            {!customer && (
              <div className="space-y-3">
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your Name" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all" />
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Mobile Number" maxLength={10} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#d4ff00] transition-all" />
              </div>
            )}

            {/* Booking Summary */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 space-y-3">
              <div className="flex justify-between text-xs text-zinc-500 font-bold">
                <span>📅 Date & Time</span>
                <span className="text-zinc-900 dark:text-white font-black">{selectedDate} · {selectedSlot}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-500 font-bold">
                <span>👤 Stylist</span>
                <span className="text-purple-600 dark:text-purple-400 font-black">
                  {selectedStylist?.id === 'anyone' ? 'Will be assigned by salon' : selectedStylist?.name}
                </span>
              </div>

              {selectedServices.map(s => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">{s.name} <span className="text-zinc-400">({s.duration}min)</span></span>
                  <span className="font-bold">{formatCurrency(s.price)}</span>
                </div>
              ))}
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-1">
                <div className="flex justify-between text-xs text-zinc-500"><span>Services Total</span><span>{formatCurrency(backendTotals.subtotal)}</span></div>
                {backendTotals.tax > 0 && (
                  <div className="flex justify-between text-xs text-zinc-500"><span>GST (5%)</span><span>{formatCurrency(backendTotals.tax)}</span></div>
                )}
                <div className="flex justify-between text-xs text-emerald-500 font-bold"><span>Platform Fee (paid now)</span><span>{formatCurrency(backendTotals.platformFee)}</span></div>
                <div className="flex justify-between text-xs text-zinc-500 font-black pt-1 border-t border-zinc-100 dark:border-zinc-800 mt-1"><span>Total Payable</span><span>{formatCurrency(backendTotals.finalTotal)}</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRazorpayPay}
                disabled={paying}
                className="w-full py-4 bg-[#d4ff00] text-black font-black rounded-2xl shadow-[0_0_30px_rgba(212,255,0,0.2)] hover:bg-[#c0e600] transition-all disabled:opacity-50"
              >
                {paying ? 'Processing...' : `Pay ₹${platformFee} via Razorpay`}
              </button>
              {customer && (
                <button
                  onClick={handleWalletPay}
                  disabled={paying || walletBalance < platformFee}
                  className="w-full py-3.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all disabled:opacity-50"
                >
                  {walletBalance < platformFee ? 'Insufficient Balance' : 'Pay via Wallet'}
                  <span className="text-xs text-zinc-500 ml-2">
                    (Balance: {formatCurrency(walletBalance)})
                  </span>
                </button>
              )}
              <p className="text-[10px] font-bold text-emerald-500 text-center px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                ✨ Only the platform fee ({formatCurrency(platformFee)}) is paid online/via wallet. The service amount ({formatCurrency(subtotal)}) is to be paid at the salon.
              </p>
            </div>
            <button onClick={() => setStep(2)} className="w-full text-center text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors py-2">← Back to stylists</button>
          </div>
        )}
      </div>

      {/* Customer Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        isCheckoutFlow={true}
      />

    </div>
  );
}
