import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FoodSlotPicker({ vendorId, onSelect }) {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: d.toISOString().split('T')[0],
        dateNum: d.getDate()
      });
    }
    setDates(days);
    setSelectedDate(days[0].value);
  }, []);

  useEffect(() => {
    if (selectedDate && vendorId) {
      setLoading(true);
      api.get(`/vendors/${vendorId}/available-food-slots?date=${selectedDate}`)
        .then(res => {
          setSlots(res.data.data || []);
        })
        .catch(() => toast.error('Failed to load slots'))
        .finally(() => setLoading(false));
    }
  }, [selectedDate, vendorId]);

  const handleSlotClick = (slot) => {
    if (slot.status === 'full' || slot.status === 'unavailable') return;
    setSelectedSlot(slot);
    onSelect({
      date: selectedDate,
      time: slot.time,
      dateTime: slot.dateTime
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => {
              setSelectedDate(d.value);
              setSelectedSlot(null);
            }}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all ${
              selectedDate === d.value
                ? 'border-[#d4ff00] bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00]'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{d.label}</span>
            <span className="text-lg font-black mt-1">{d.dateNum}</span>
          </button>
        ))}
      </div>

      {/* Slot Grid */}
      <div>
        <h4 className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-3 ml-1">Available Pickup Slots</h4>
        {loading ? (
          <div className="grid grid-cols-4 gap-2 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 text-xs italic">No slots available for this date.</div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                disabled={slot.status === 'full' || slot.status === 'unavailable'}
                onClick={() => handleSlotClick(slot)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedSlot?.time === slot.time
                    ? 'bg-[#d4ff00] text-black border-[#d4ff00]'
                    : slot.status === 'full' || slot.status === 'unavailable'
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 cursor-not-allowed opacity-40'
                    : slot.status === 'limited'
                    ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {slot.time}
                {slot.status === 'full' && <div className="text-[8px] opacity-60">Full</div>}
                {slot.status === 'unavailable' && <div className="text-[8px] opacity-60">Closed</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
