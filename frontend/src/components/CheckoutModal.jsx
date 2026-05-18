import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import api from '../utils/api';
import Modal from './Modal';
import Button from './Button';
import OTPModal from './OTPModal';
import FoodSlotPicker from './FoodSlotPicker';
import toast from 'react-hot-toast';


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

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletCustomerId, setWalletCustomerId] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [selectedSlotData, setSelectedSlotData] = useState(null);





  useEffect(() => {
    if (guestInfo.phone && /^\d{10}$/.test(guestInfo.phone)) {
      api.get(`/payment/wallet-balance?phone=${guestInfo.phone}`)
        .then(res => {
          setWalletBalance(res.data.balance);
          setWalletCustomerId(res.data.customerId);
        })
        .catch(err => console.error('Failed to fetch wallet balance:', err));
    } else {
      setWalletBalance(null);
      setWalletCustomerId(null);
    }
  }, [guestInfo.phone]);

  // Pre-fill from existing customer session; always reset OTP state
  useEffect(() => {
    if (isCheckoutOpen) {
      setGuestInfo({
        name: customer?.name || '',
        phone: customer?.phone || '',
      });
      setError('');
      setShowOTP(false);
      
      // Fetch vendor details to check slot booking support
      const vendorId = activeVendorId || items[0]?.vendorId;
      if (vendorId) {
        api.get(`/vendors/${vendorId}`)
          .then(res => setVendor(res.data.data))
          .catch(err => console.error('Failed to fetch vendor:', err));
      }
    }
  }, [isCheckoutOpen, customer, activeVendorId, items]);



  const handleContinue = () => {
    if (!guestInfo.name.trim() || !guestInfo.phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }
    if (!/^\d{10}$/.test(guestInfo.phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (vendor?.slotEnabled && !selectedSlotData) {
      setError('Please select a pickup time slot.');
      toast.error('Pickup slot is required');
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
        platformFee: fee,
        finalAmount: total,
        deliveryTime: vendor?.slotEnabled ? `Slot: ${selectedSlotData.time}` : deliveryTime,
        scheduledDate: selectedSlotData?.date || null,
        scheduledSlot: selectedSlotData?.time || null,
        slotDateTime: selectedSlotData?.dateTime || null
      };


      if (paymentMethod === 'wallet') {
        const clientOrderId = `${walletCustomerId}-${Date.now()}`;
        const res = await api.post('/payment/wallet-pay', {
          userId: walletCustomerId,
          commissionAmount: fee,
          orderData: { ...payload, clientOrderId }
        });
        
        if (res.data.success) {
          const order = res.data.order;
          setCustomerSession({ name: guestInfo.name, phone: guestInfo.phone });
          localStorage.setItem("ql_last_order_id", order.id);

          clearCart();
          setShowOTP(false);
          closeCheckout();

          // 🔥 Trigger vendor refresh real-time
          window.dispatchEvent(new Event("orderPlaced"));

          navigate(`/order-status/${order.id}`);
        } else {
          setError(res.data.message || 'Wallet payment failed');
        }
        return;
      }


      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        setError('Razorpay SDK failed to load. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create Razorpay order (Only for platformFee)
      const res = await api.post('/payment/create-order', {
        amount: fee
      });
      const rzpOrder = res.data;

      // Open Razorpay Popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SkrpjWAPFjMaX5',
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'Qzaam',
        description: 'Payment for platform fee',
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            setLoading(true);
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: payload
            });

            if (verifyRes.data.success) {
              const order = verifyRes.data.order;
              setCustomerSession({ name: guestInfo.name, phone: guestInfo.phone });
              localStorage.setItem("ql_last_order_id", order.id);

              clearCart();
              setShowOTP(false);
              closeCheckout();

              // 🔥 Trigger vendor refresh real-time
              window.dispatchEvent(new Event("orderPlaced"));

              navigate(`/order-status/${order.id}`);
            } else {
              setError('Payment verification failed. Please try again.');
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: guestInfo.name,
          contact: guestInfo.phone
        },
        theme: {
          color: '#d4ff00'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Failed to initiate payment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initiate payment. Please try again.');
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
        isCheckoutFlow={true}
      />
    );
  }

  return (
    <Modal isOpen={isCheckoutOpen} onClose={closeCheckout} title="Order Summary" size="md">
      <div className="max-h-[80vh] flex flex-col h-full">
        <div className="overflow-y-auto flex-1 pr-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800/50">
              {error}
            </div>
          )}

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
            
            {vendor?.slotEnabled ? (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <FoodSlotPicker 
                  vendorId={activeVendorId || items[0]?.vendorId} 
                  onSelect={(data) => {
                    setSelectedSlotData(data);
                    setError('');
                  }} 
                />
                {selectedSlotData && (
                  <p className="mt-3 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 text-center animate-in fade-in zoom-in duration-300">
                    Pickup Scheduled: {new Date(selectedSlotData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} at {selectedSlotData.time}
                  </p>
                )}
              </div>
            ) : (
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
            )}
            <p className="text-[10px] text-zinc-400 italic">
              {customer ? '✓ Pre-filled from your session. OTP required for every order.' : 'Enter details to receive OTP verification.'}
            </p>
          </div>

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

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 mb-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'razorpay' ? 'border-[#d4ff00] bg-[#d4ff00]/5' : 'border-zinc-200 dark:border-zinc-800 hover:border-[#d4ff00]/40'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="accent-[#d4ff00]"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Online Payment</p>
                  <p className="text-[10px] text-zinc-500">Platform fee via Razorpay</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${paymentMethod === 'wallet' ? 'border-[#d4ff00] bg-[#d4ff00]/5' : 'border-zinc-200 dark:border-zinc-800 hover:border-[#d4ff00]/40'} ${walletBalance === null || walletBalance < fee ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={() => {
                    if (walletBalance !== null && walletBalance >= fee) {
                      setPaymentMethod('wallet');
                    }
                  }}
                  disabled={walletBalance === null || walletBalance < fee}
                  className="accent-[#d4ff00]"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">Pay with Wallet</p>
                  {walletBalance !== null ? (
                    <p className={`text-[10px] font-bold mt-0.5 ${walletBalance >= fee ? 'text-emerald-500' : 'text-red-500'}`}>
                      Bal: {formatCurrency(walletBalance)} {walletBalance < fee && '(Low)'}
                    </p>
                  ) : (
                    <p className="text-[10px] text-zinc-500">Checking balance...</p>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-5 space-y-3 mb-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Item Total (Pay at Stall)</span>
              <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Platform Fee (Pay Online Now)</span>
              <span className="font-black text-[#8cb800] dark:text-[#d4ff00]">{formatCurrency(fee)}</span>
            </div>
            <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700">
              {paymentMethod === 'wallet' ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div>
                      <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Pay with Wallet</p>
                      <p className="text-xs text-zinc-500">Will be deducted</p>
                    </div>
                    <span className="text-lg font-black text-emerald-400">{formatCurrency(fee)}</span>
                  </div>
                  <p className="text-xs font-bold text-emerald-500 ml-1">Wallet will deduct only {formatCurrency(fee)}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#d4ff00]/5 border border-[#d4ff00]/10">
                    <div>
                      <p className="text-[10px] uppercase font-black text-[#8cb800] dark:text-[#d4ff00] tracking-widest">Pay Now Online</p>
                      <p className="text-xs text-zinc-500">Platform fee</p>
                    </div>
                    <span className="text-lg font-black text-zinc-900 dark:text-white">{formatCurrency(fee)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 mt-2 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700">
                    <div>
                      <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Pay at Stall</p>
                      <p className="text-xs text-zinc-500">Vendor collection</p>
                    </div>
                    <span className="text-lg font-black text-zinc-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>
                </>
              )}
          </div>
        </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" fullWidth disabled={loading} onClick={() => { closeCheckout(); openCart(); }}>
              Adjust Order
            </Button>
            <Button fullWidth loading={loading} onClick={handleContinue} disabled={items.length === 0 || (paymentMethod === 'wallet' && (walletBalance === null || walletBalance < fee))}>
              {loading ? "Processing..." : "Verify & Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
