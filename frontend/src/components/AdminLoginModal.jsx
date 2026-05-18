import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { loginAsAdmin } = useAuth();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  // Handle countdown if locked out
  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimeLeft]);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setError('');
    }
  }, [isOpen]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password.');
      return;
    }
    if (lockoutTimeLeft > 0) {
      setError(`Too many failed attempts. Try again in ${lockoutTimeLeft}s.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginAsAdmin(password);
      toast.success('Super Admin verified successfully!');
      setFailedAttempts(0);
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      const nextFailCount = failedAttempts + 1;
      setFailedAttempts(nextFailCount);
      
      if (nextFailCount >= 5) {
        setLockoutTimeLeft(30); // 30-second lockout
        setFailedAttempts(0);
        setError('Too many failed attempts. Access locked for 30 seconds.');
        toast.error('Too many failed attempts. Access locked.');
      } else {
        const msg = err.message || 'Invalid admin password';
        setError(`${msg}. (${5 - nextFailCount} attempts remaining)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Authentication" size="sm">
      <form onSubmit={handleVerify} className="py-4">
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 bg-[#d4ff00]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d4ff00]/25 animate-pulse">
          <span className="text-3xl">🛡️</span>
        </div>
        
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Verify Admin Privileges</h3>
          <p className="text-sm text-zinc-500 mt-1">Please enter your secure administrative password to access the panel.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading || lockoutTimeLeft > 0}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all font-mono text-zinc-900 dark:text-white disabled:opacity-50"
              />
              <button
                type="button"
                disabled={lockoutTimeLeft > 0}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-black uppercase tracking-widest disabled:opacity-50 select-none"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            fullWidth
            disabled={loading || !password || lockoutTimeLeft > 0}
          >
            {loading ? 'Verifying Privileges...' : lockoutTimeLeft > 0 ? `Locked (${lockoutTimeLeft}s)` : 'Verify & Continue'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
