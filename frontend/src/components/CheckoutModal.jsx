import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../utils/api';
import Modal from './Modal';
import Button from './Button';
import OTPModal from './OTPModal';

export default function CheckoutModal() {
  const navigate = useNavigate();
  const { customer, setCustomerSession, activeVendorId } = useAuth();
  const {
    isCheckoutOpen, closeCheckout, openCart,
    items, subtotal, fee, tax, total, clearCart,
  } = useCart();

  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('ASAP');

  // Pre-fill from existing customer session; always reset OTP state
  useEffect(() => {
    if (isCheckoutOpen) {
      setGuestInfo({
        name: customer?.name || '',
        phone: customer?.phone || '',
      });
      setError('');
      setShowOTP(false);
    }
  }, [isCheckoutOpen, customer]);

  const handleContinue = () => {
    if (!guestInfo.name.trim() || !guestInfo.phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }
    if (!/^\d{10}$/.test(guestInfo.phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setShowOTP(true);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const vendorId = activeVendorId || items[0]?.vendorId;
      const payload = {
        customerName: guestInfo.name,
        customerPhone: guestInfo.phone,
        vendorId,
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        totalAmount: subtotal,
        deliveryTime
      };

      const res = await api.post('/orders', payload);
      const order = res.data.data;

      // Persist guest session after first successful order
      setCustomerSession({ name: guestInfo.name, phone: guestInfo.phone });
      localStorage.setItem("ql_last_order_id", order.id);

      clearCart();
      setShowOTP(false);
      closeCheckout();
      navigate(`/order-status/${order.id}`);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      setShowOTP(false);
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <OTPModal
        isOpen={isCheckoutOpen}
        onClose={() => setShowOTP(false)}
        onVerify={handlePlaceOrder}
        phone={guestInfo.phone}
      />
    );
  }

  return (
    <Modal isOpen={isCheckoutOpen} onClose={closeCheckout} title="Order Summary" size="md">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800/50">
          {error}
        </div>
      )}

      {/* Guest Info */}
      <div className="space-y-4 mb-6 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Your Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your Name"
            autoComplete="off"
            value={guestInfo.name}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4ff00] w-full transition-colors"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            maxLength={10}
            autoComplete="off"
            value={guestInfo.phone}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4ff00] w-full transition-colors font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">Delivery Time</label>
          <select
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4ff00] w-full transition-colors text-zinc-800 dark:text-zinc-200"
          >
            <option value="ASAP">ASAP (Immediate)</option>
            <option value="10">10 mins</option>
            <option value="20">20 mins</option>
            <option value="30">30 mins</option>
          </select>
        </div>
        <p className="text-[10px] text-zinc-400 italic">
          {customer ? '✓ Pre-filled from your session. OTP required for every order.' : 'Enter details to receive OTP verification.'}
        </p>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-zinc-400 truncate max-w-[65%]">
              {item.name}<span className="text-zinc-600 ml-1">×{item.quantity}</span>
            </span>
            <span className="text-zinc-900 dark:text-white font-medium tabular-nums shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-5 space-y-3 mb-6 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Item Total</span>
          <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Platform Fee</span>
          <span className="font-black text-[#8cb800] dark:text-[#d4ff00]">{formatCurrency(fee)}</span>
        </div>
        <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-between items-center p-3 rounded-xl bg-[#d4ff00]/5 border border-[#d4ff00]/10">
            <div>
              <p className="text-[10px] uppercase font-black text-[#8cb800] dark:text-[#d4ff00] tracking-widest">Pay at Stall</p>
              <p className="text-xs text-zinc-500">Pay vendor directly</p>
            </div>
            <span className="text-lg font-black text-zinc-900 dark:text-white">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" fullWidth disabled={loading} onClick={() => { closeCheckout(); openCart(); }}>
          Adjust Order
        </Button>
        <Button fullWidth loading={loading} onClick={handleContinue} disabled={items.length === 0}>
          Continue to OTP
        </Button>
      </div>
    </Modal>
  );
}
