import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import Button from './Button';
import api from '../utils/api';

export default function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    const customer = JSON.parse(localStorage.getItem('ql_customer'));
    if (!customer?.phone) {
      setError('You must be signed in as a customer.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.post('/reviews', {
        orderId: order.id,
        rating,
        comment,
        customerPhone: customer.phone
      });
      toast.success('Thank you! Your review has been recorded.');
      setRating(0);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review Your Order #${order.id.slice(0, 8)}`} size="sm">
      <form onSubmit={handleSubmit} className="py-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center mb-6">
          <label className="block text-xs uppercase font-black text-zinc-500 tracking-wider mb-3">Overall Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              >
                {star <= (hoverRating || rating) ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs font-bold text-[#d4ff00] mt-2 capitalize">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
            </p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1.5 ml-1">Write your review</label>
            <textarea
              rows={4}
              placeholder="What did you love about this order? Any feedback?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
