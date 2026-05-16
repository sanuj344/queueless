import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/Button';
import DelayModal from '../components/DelayModal';
import toast from 'react-hot-toast';

const STATUS_STEPS = { placed: 1, accepted: 2, in_service: 3, completed: 4 };
const STEPS_DATA = [
  { id: 1, label: 'Booking Placed' },
  { id: 2, label: 'Accepted by Salon' },
  { id: 3, label: 'Service in Progress' },
  { id: 4, label: 'Completed' },
];

export default function BookingStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manualId, setManualId] = useState('');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      const savedId = localStorage.getItem('ql_last_booking_id');
      if (savedId) navigate(`/booking-status/${savedId}`, { replace: true });
      else setLoading(false);
      return;
    }

    let interval;
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data.data);
        setError('');
        localStorage.setItem('ql_last_booking_id', res.data.data.id);
        if (['completed', 'cancelled'].includes(res.data.data.status)) clearInterval(interval);
      } catch {
        setError('Booking not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
    interval = setInterval(fetchBooking, 4000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  const sendAction = async (action, minutes = null) => {
    try {
      const payload = { bookingId: booking.id, action };
      if (minutes) payload.delayMinutes = minutes;
      const res = await api.post('/bookings/customer-action', payload);
      if (res.data.success) {
        setBooking(res.data.data);
        if (action === 'delayed') toast.success(`Delayed by ${minutes || 5} mins`);
      }
    } catch (e) { 
      console.error(e); 
      toast.error('Action failed');
    }
  };

  const handleCancel = async () => {
    if (booking.status !== 'placed') {
      return toast.error('Cannot cancel after booking is accepted or processed');
    }
    if (!window.confirm('Cancel this booking?')) return;
    try {
      const res = await api.patch(`/bookings/${booking.id}/cancel`);
      if (res.data.success) {
        setBooking(res.data.data);
        toast.success('Booking cancelled');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const markArrived = async () => {
    try {
      const res = await api.patch(`/bookings/${booking.id}/arrived`);
      if (res.data.success) {
        setBooking(res.data.data);
        toast.success("Arrival confirmed!");
      }
    } catch (err) {
      toast.error("Failed to mark arrival");
    }
  };

  const submitReview = async () => {
    if (rating === 0) return toast.error('Please select a rating');
    setSubmittingReview(true);
    try {
      await api.post('/reviews/booking', {
        bookingId: booking.id,
        rating,
        comment,
        customerPhone: booking.customerPhone
      });
      toast.success('Thank you for your feedback!');
      setBooking(prev => ({ ...prev, reviewGiven: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white dark:bg-black pt-28 flex justify-center text-zinc-500 text-sm">Loading booking...</div>;

  if (!id) return (
    <div className="min-h-screen bg-white dark:bg-black pt-32 px-4 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-purple-500/10 rounded-[2.5rem] flex items-center justify-center text-3xl mb-6">💇</div>
      <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Track Your Booking</h1>
      <div className="mt-8 w-full max-w-sm space-y-3">
        <input type="text" placeholder="Enter Booking ID" value={manualId} onChange={e => setManualId(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#d4ff00] transition-all" />
        <Button fullWidth size="lg" onClick={() => { if (manualId) navigate(`/booking-status/${manualId}`); }} disabled={!manualId}>
          Find My Booking
        </Button>
      </div>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-white dark:bg-black pt-28 px-4 flex flex-col items-center text-center">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Booking Not Found</h2>
      <Link to="/" className="mt-6"><Button>Back to Home</Button></Link>
    </div>
  );

  if (booking.status === 'cancelled') return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mb-6"><span className="text-3xl">❌</span></div>
      <h1 className="text-3xl font-black text-red-500">Booking Cancelled</h1>
      <p className="text-zinc-500 mt-2 max-w-xs">This booking has been cancelled.</p>
      <Link to="/" className="mt-8"><Button size="lg">Home</Button></Link>
    </div>
  );

  const currentStep = STATUS_STEPS[booking.status] || 1;
  const slotDate = new Date(booking.slotTime);
  let slotStr = slotDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  if (booking.slotEndTime) {
    const endDate = new Date(booking.slotEndTime);
    const endStr = endDate.toLocaleString('en-IN', { timeStyle: 'short' });
    slotStr = `${slotStr} - ${endStr}`;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4 pt-24 pb-12">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-500 text-xs font-bold mb-3">
          Booking #{id?.slice(0, 8).toUpperCase()}
        </div>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
          {currentStep < 3 ? 'Your booking is confirmed!' : currentStep === 3 ? 'Service in progress ✂️' : 'All done! 🎉'}
        </h1>
        <div className="mt-4 p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 inline-block">
          <h2 className="text-xl font-black text-purple-600 dark:text-purple-400">{slotStr}</h2>
          {booking.stylistPreference === 'anyone' ? (
            <p className="text-xs text-zinc-500 mt-1">Stylist: <strong>Will be assigned by salon</strong></p>
          ) : booking.stylist && (
            <p className="text-xs text-zinc-500 mt-1">Stylist: <strong>{booking.stylist.name}</strong></p>
          )}

          {booking.tokenNumber ? (
            <p className="text-xs text-zinc-500 mt-1">Token: <strong>{booking.tokenNumber}</strong></p>
          ) : (
            <p className="text-xs text-zinc-400 mt-1 italic animate-pulse">Waiting for token assignment...</p>
          )}

        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8 mb-6 shadow-xl">
        <div className="space-y-1">
          {STEPS_DATA.map((step, i) => {
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <div key={step.id}>
                <div className="flex items-center gap-4 py-3">
                  <div className={['w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500',
                    isDone ? 'bg-purple-600 text-white' : isActive ? 'bg-white dark:bg-black border-2 border-purple-500 text-purple-500' : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400'
                  ].join(' ')}>
                    {isDone ? '✓' : isActive ? <span className="animate-pulse">●</span> : step.id}
                  </div>
                  <p className={`font-bold text-sm flex-1 ${isDone || isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>{step.label}</p>
                  {isActive && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping opacity-75" />
                      <span className="text-purple-500 text-[10px] font-black uppercase tracking-widest">Live</span>
                    </div>
                  )}
                </div>
                {i < STEPS_DATA.length - 1 && <div className={`ml-5 w-px h-6 ${isDone ? 'bg-purple-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booked services summary */}
      {Array.isArray(booking.services) && booking.services.length > 0 && (
        <div className="w-full max-w-md mb-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Booked Services</p>
          {booking.services.map((s, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
              <span className="text-zinc-700 dark:text-zinc-300">{s.name} <span className="text-zinc-400">({s.duration}min)</span></span>
              <span className="font-bold text-zinc-900 dark:text-white">₹{s.price}</span>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-zinc-500 font-bold">
              <span>Paid Online (Platform Fee)</span>
              <span className="text-emerald-500">₹{booking.platformFee || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-zinc-900 dark:text-white">Pay at Salon</span>
              <span className="font-black text-purple-600 dark:text-purple-400 text-lg">₹{booking.totalAmount}</span>
            </div>
            <p className="text-[9px] text-zinc-400 italic mt-1 text-center font-bold">Total Service Value: ₹{booking.finalAmount}</p>
          </div>
        </div>
      )}

      {/* Customer action panel */}
      {['accepted', 'in_service'].includes(booking.status) && (
        <div className="w-full max-w-md mb-6 space-y-3 px-1">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Update Salon</h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { action: 'coming', label: 'I am Coming', activeColor: 'bg-emerald-500 text-white border-none', inactiveColor: 'border-emerald-500/30 text-emerald-500' },
              { action: 'delayed', label: booking.customerAction === 'delayed' && booking.customerDelayMinutes ? `Delayed by ${booking.customerDelayMinutes}m` : 'I will be Delayed', activeColor: 'bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20', inactiveColor: 'border-amber-500/30 text-amber-500' },
              { action: 'contact', label: 'Contact Salon', activeColor: 'bg-blue-500 text-white border-none', inactiveColor: 'border-blue-500/30 text-blue-500' }
            ].map(({ action, label, activeColor, inactiveColor }) => (
              <Button key={action} fullWidth variant={booking.customerAction === action ? 'default' : 'outline'}
                className={booking.customerAction === action ? activeColor : inactiveColor}
                onClick={() => {
                  if (action === 'delayed') {
                    setIsDelayModalOpen(true);
                  } else {
                    sendAction(action);
                  }
                }}>
                {booking.customerAction === action ? `✓ ${label}` : label}
              </Button>
            ))}
          </div>
          {booking.customerAction === 'delayed' && (
            <p className="text-[10px] text-zinc-400 mt-2 text-center font-medium animate-pulse uppercase tracking-[0.2em]">
              Salon has been notified of your {booking.customerDelayMinutes}m delay
            </p>
          )}
        </div>
      )}

      <DelayModal 
        isOpen={isDelayModalOpen} 
        onClose={() => setIsDelayModalOpen(false)}
        onUpdate={(mins) => sendAction('delayed', mins)}
        currentDelay={booking.customerDelayMinutes}
      />

      {/* Arrival Confirmation */}
      {['accepted', 'placed'].includes(booking.status) && !booking.hasArrived && (
        <div className="w-full max-w-md mb-6">
          <button
            onClick={markArrived}
            className="w-full py-4 bg-[#d4ff00] text-black font-black rounded-3xl shadow-[0_0_20px_rgba(212,255,0,0.15)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span className="text-xl">📍</span>
            I have arrived at the Salon
          </button>
        </div>
      )}

      {booking.hasArrived && booking.status !== 'completed' && (
        <div className="w-full max-w-md mb-6 p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-center text-sm font-bold flex items-center justify-center gap-2">
          <span>✅</span> Arrival Confirmed
        </div>
      )}

      {/* Vendor contact */}
      {booking.vendor?.mobile && (
        <div className="w-full max-w-md mb-6 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Need Help?</p>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-3">Contact {booking.vendor.outletName || booking.vendor.name}</h4>
          <a href={`tel:${booking.vendor.mobile}`} className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-600 dark:text-purple-400 font-black hover:scale-105 transition-all group">
            <span className="text-xl group-hover:rotate-12 transition-transform">📞</span>
            <span className="text-lg tracking-tight">{booking.vendor.mobile}</span>
          </a>
        </div>
      )}

      {/* Cancel (if before slot time) */}
      {booking.status === 'placed' && new Date() < new Date(booking.slotTime) && (
        <div className="w-full max-w-md mb-4">
          <Button fullWidth variant="outline" size="lg" className="border-red-500/40 text-red-500 hover:bg-red-500/5" onClick={handleCancel}>
            Cancel Booking
          </Button>
        </div>
      )}

      {/* Review Section */}
      {booking.status === 'completed' && !booking.reviewGiven && (
        <div className="w-full max-w-md mb-6 p-6 rounded-3xl border border-[#d4ff00]/30 bg-[#d4ff00]/5 text-center shadow-lg">
          <div className="w-12 h-12 bg-[#d4ff00]/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">⭐</span>
          </div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1">Rate your Service</h3>
          <p className="text-xs text-zinc-500 mb-4">How was your experience with {booking.vendor?.outletName || 'the salon'}?</p>
          
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}`}
              >
                ★
              </button>
            ))}
          </div>
          
          <textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-[#d4ff00] transition-colors resize-none"
            rows="2"
          />
          
          <Button fullWidth onClick={submitReview} disabled={rating === 0 || submittingReview}>
            {submittingReview ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      )}

      <div className="flex gap-3 w-full max-w-md">
        <Link to="/" className="flex-1"><Button variant="outline" fullWidth size="lg">Home</Button></Link>
      </div>

      <DelayModal
        isOpen={isDelayModalOpen}
        onClose={() => setIsDelayModalOpen(false)}
        onUpdate={(mins) => sendAction('delayed', mins)}
        currentDelay={booking.customerDelayMinutes}
      />
    </div>
  );
}
