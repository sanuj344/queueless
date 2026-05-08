import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

export default function OTPModal({ isOpen, onClose, onVerify, phone, isCheckoutFlow = false }) {

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setError('');
    
    // Mock OTP verification
    setTimeout(() => {
      if (otp === '1234') {
        onVerify();
      } else {
        setError('Invalid OTP. Please enter 1234.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Phone Verification" size="sm">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-[#d4ff00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Verify your number</h3>
        <p className="text-sm text-zinc-500 mt-1">Enter the 4-digit code sent to<br/><span className="font-bold text-zinc-900 dark:text-zinc-300">+91 {phone}</span></p>
        
        <div className="mt-8 mb-6">
          <input
            type="text"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="0000"
            className="w-32 text-center text-3xl font-black tracking-[10px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 focus:outline-none focus:border-[#d4ff00] transition-all text-[#8cb800] dark:text-[#d4ff00]"
          />
          {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
        </div>

        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-6">Enter <span className="text-[#d4ff00] font-bold">1234</span> for demo</p>

        <Button
          fullWidth
          loading={loading}
          onClick={handleVerify}
          disabled={otp.length !== 4}
        >
          {isCheckoutFlow ? "Verify & Place Order" : "Verify"}
        </Button>

        
        <button 
          onClick={onClose}
          className="mt-4 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors"
        >
          Change Phone Number
        </button>
      </div>
    </Modal>
  );
}
