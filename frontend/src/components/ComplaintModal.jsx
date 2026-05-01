import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import Button from './Button';
import api from '../utils/api';

export default function ComplaintModal({ isOpen, onClose, order, customerPhone }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please fill in both the subject and description.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await api.post('/complaints', {
        orderId: order.id,
        customerPhone,
        subject,
        description,
        priority
      });
      toast.success('Your complaint has been successfully registered!');
      setSubject('');
      setDescription('');
      setPriority('medium');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Raise Complaint #${order.id.slice(0, 8)}`} size="md">
      <form onSubmit={handleSubmit} className="py-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1.5 ml-1">Subject</label>
            <input
              type="text"
              placeholder="e.g., Delayed Preparation, Missing items"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1.5 ml-1">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all cursor-pointer capitalize font-semibold"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1.5 ml-1">Details & Context</label>
            <textarea
              rows={4}
              placeholder="Please describe exactly what happened or what went wrong with your order."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Register Complaint'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
