import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import OTPModal from './OTPModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

export default function CustomerLoginModal({ isOpen, onClose, isCheckoutFlow = false }) {
  const { setCustomerSession } = useAuth();

  const [info, setInfo] = useState({ name: '', phone: '' });
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!info.phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!/^\d{10}$/.test(info.phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    try {
      const res = await api.get(`/customer/profile?phone=${info.phone}`);
      if (res.data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      // 1. Start with name from form (if any) or fallback
      let finalName = info.name.trim() || 'Guest User';
      let customerId = null;
      // 2. Try to fetch real name and ID from DB
      try {
        const res = await api.get(`/customer/profile?phone=${info.phone}`);
        if (res.data.success && res.data.data) {
          finalName = res.data.data.name || finalName;
          customerId = res.data.data.id;
        }
      } catch (profileErr) {
        console.error("Could not fetch profile, using form name:", profileErr);
      }

      const customerData = {
        id: customerId,
        name: finalName,
        phone: info.phone
      };
      
      setCustomerSession(customerData);
      toast.success(`Welcome back, ${finalName.split(' ')[0]}!`);
      onClose();
      // Brief delay to allow toast to be seen before reload
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <OTPModal
        isOpen={isOpen}
        onClose={() => setStep(1)}
        onVerify={handleVerify}
        phone={info.phone}
        isCheckoutFlow={isCheckoutFlow}
      />
    );

  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Login" size="sm">
      <div className="py-4">
        <div className="w-16 h-16 bg-[#d4ff00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">👤</span>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Sign in as Customer</h3>
          <p className="text-sm text-zinc-500 mt-1">Enter your details to access your order history and active orders.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1.5 ml-1">Your Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={info.name}
              onChange={(e) => setInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1.5 ml-1">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-sm">+91</span>
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={info.phone}
                onChange={(e) => setInfo(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all font-mono"
              />
            </div>
          </div>
        </div>

        <Button
          fullWidth
          onClick={handleContinue}
          disabled={info.phone.length !== 10}
        >
          {isCheckoutFlow ? "Verify & Place Order" : "Verify"}
        </Button>

        
        <p className="text-[10px] text-zinc-400 text-center mt-6 uppercase tracking-widest">
          Secure login via <span className="text-[#8cb800] dark:text-[#d4ff00] font-bold">Qzaam OTP</span>
        </p>
      </div>
    </Modal>
  );
}
