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
  { label: 'Confirm & Pay', icon: '💳' }
];

const generateSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 20; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    if (hour < 20) slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

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

  // Customer info — auto-fill if logged in
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');

  const todayStr = new Date().toISOString().split('T')[0];

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
    fetchServices();
    fetchRating();
    fetchReviews();
  }, [vendorId]);

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const platformFee = Math.ceil(total * 0.05);
  const finalAmount = total + platformFee;

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
    totalAmount: total,
    platformFee,
    finalAmount,
    slotTime: new Date(`${selectedDate}T${selectedSlot}:00`).toISOString()
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
    if (!customer) return toast.error('Please login to use wallet');
    setPaying(true);
    try {
      const walletRes = await api.get(`/payment/wallet-balance?phone=${customer.phone}`);
      const { balance, customerId } = walletRes.data;
      if (balance < platformFee) {
        toast.error(`Insufficient wallet balance. You have ₹${balance}, need ₹${platformFee}`);
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
                  {[1,2,3,4,5].map(star => (
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
                  {customer ? `Next: Pick a Slot → (${selectedServices.length} selected · ${formatCurrency(total)})` : '🔐 Login to Continue'}
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
                          {[1,2,3,4,5].map(s => (
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
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Pick a Date & Slot</h2>
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
                  {generateSlots().map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedSlot === slot ? 'bg-[#d4ff00] text-black border-[#d4ff00]' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">← Back</button>
              <button
                disabled={!selectedDate || !selectedSlot}
                onClick={() => { if (requireCustomer()) setStep(2); }}
                className="flex-1 py-3 bg-[#d4ff00] text-black font-black rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c0e600] transition-all"
              >
                Next: Confirm →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm + Pay */}
        {step === 2 && (
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
              {selectedServices.map(s => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">{s.name} <span className="text-zinc-400">({s.duration}min)</span></span>
                  <span className="font-bold">{formatCurrency(s.price)}</span>
                </div>
              ))}
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-1">
                <div className="flex justify-between text-xs text-zinc-500"><span>Services Total</span><span>{formatCurrency(total)}</span></div>
                <div className="flex justify-between text-xs text-emerald-500 font-bold"><span>Platform Fee (paid now)</span><span>{formatCurrency(platformFee)}</span></div>
                <div className="flex justify-between text-xs text-zinc-500"><span>Collect at salon</span><span>{formatCurrency(total)}</span></div>
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
                  disabled={paying}
                  className="w-full py-3.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all disabled:opacity-50"
                >
                  Pay via Wallet
                </button>
              )}
            </div>
            <button onClick={() => setStep(1)} className="w-full text-center text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors py-2">← Back to slots</button>
          </div>
        )}
      </div>

      {/* Customer Login Modal */}
      <CustomerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
