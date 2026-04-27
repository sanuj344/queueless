import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import Modal from './Modal';
import Button from './Button';

export default function CheckoutModal() {
  const navigate = useNavigate();
  const {
    isCheckoutOpen,
    closeCheckout,
    openCart,
    items,
    subtotal,
    fee,
    tax,
    total,
    clearCart,
  } = useCart();

  const [timeSlot, setTimeSlot] = useState(0);
  const [loading, setLoading] = useState(false);

  const slots = ['ASAP (~12 min)', '+5 min', '+10 min', '+15 min', '+20 min'];

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      clearCart();
      closeCheckout();
      navigate('/order-status');
    }, 1500);
  };

  return (
    <Modal isOpen={isCheckoutOpen} onClose={closeCheckout} title="Order Summary" size="md">
      {/* Items breakdown */}
      <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-zinc-400 truncate max-w-[65%]">
              {item.name}
              <span className="text-zinc-600 ml-1">×{item.quantity}</span>
            </span>
            <span className="text-zinc-900 dark:text-white font-medium tabular-nums shrink-0">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Time slot */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Pickup Time
        </label>
        <div className="space-y-1">
          <input
            id="timeSlot"
            type="range"
            min={0}
            max={4}
            value={timeSlot}
            onChange={(e) => setTimeSlot(Number(e.target.value))}
            className="w-full accent-[#8cb800] dark:accent-[#d4ff00]"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            {slots.map((s) => (
              <span key={s}>{s.split(' ')[0]}</span>
            ))}
          </div>
        </div>
        <p className="mt-2 text-sm text-[#8cb800] dark:text-[#d4ff00] font-semibold">{slots[timeSlot]}</p>
      </div>

      {/* Cost breakdown */}
      <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 p-4 space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Subtotal</span>
          <span className="text-zinc-900 dark:text-white tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Platform fee (5%)</span>
          <span className="text-zinc-900 dark:text-white tabular-nums">{formatCurrency(fee)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">GST (5%)</span>
          <span className="text-zinc-900 dark:text-white tabular-nums">{formatCurrency(tax)}</span>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 flex justify-between font-bold">
          <span className="text-zinc-900 dark:text-white">Total</span>
          <span className="text-[#8cb800] dark:text-[#d4ff00] text-lg tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            closeCheckout();
            openCart();
          }}
        >
          Adjust Order
        </Button>
        <Button
          fullWidth
          loading={loading}
          onClick={handleConfirm}
        >
          Confirm & Pay
        </Button>
      </div>
    </Modal>
  );
}
