import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import toast from 'react-hot-toast';

export default function DelayModal({ isOpen, onClose, onUpdate, currentDelay }) {
  const [selectedMinutes, setSelectedMinutes] = useState(currentDelay || 10);
  const [customInput, setCustomInput] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const quickOptions = [5, 10, 15, 20];

  const handleUpdate = () => {
    let finalMinutes = useCustom ? parseInt(customInput) : selectedMinutes;

    if (useCustom) {
      if (!customInput || isNaN(finalMinutes) || finalMinutes <= 0) {
        return toast.error('Please enter a valid number of minutes');
      }
      if (finalMinutes > 120) {
        return toast.error('Maximum delay allowed is 120 minutes');
      }
      if (customInput.includes('.') || customInput.includes('-')) {
        return toast.error('Please enter a positive whole number');
      }
    }

    onUpdate(finalMinutes);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How long will you be delayed?" size="sm">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Quick Select</p>
          <div className="grid grid-cols-4 gap-2">
            {quickOptions.map((min) => (
              <button
                key={min}
                onClick={() => {
                  setSelectedMinutes(min);
                  setUseCustom(false);
                }}
                className={[
                  'py-3 rounded-2xl border-2 font-bold transition-all',
                  !useCustom && selectedMinutes === min
                    ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-amber-500/30'
                ].join(' ')}
              >
                {min}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Custom Delay</p>
          <div className="relative group">
            <input
              type="number"
              placeholder="Enter minutes (e.g. 45)"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setUseCustom(true);
              }}
              onFocus={() => setUseCustom(true)}
              className={[
                'w-full bg-zinc-50 dark:bg-zinc-950 border-2 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none transition-all',
                useCustom
                  ? 'border-amber-500 ring-4 ring-amber-500/10 text-zinc-900 dark:text-white'
                  : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:border-zinc-200 dark:group-hover:border-zinc-700'
              ].join(' ')}
            />
            {useCustom && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                Minutes
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button fullWidth size="lg" onClick={handleUpdate} className="bg-amber-500 hover:bg-amber-600 border-none shadow-xl shadow-amber-500/20">
            Update Delay
          </Button>
          <p className="text-[10px] text-zinc-400 text-center mt-4 font-medium uppercase tracking-widest leading-relaxed">
            ⏰ Vendor will be notified immediately
          </p>
        </div>
      </div>
    </Modal>
  );
}
