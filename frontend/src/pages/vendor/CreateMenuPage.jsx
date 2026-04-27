import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function CreateMenuPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form bounds for a single new item entry
  const [formData, setFormData] = useState({ name: '', price: '', category: '' });

  const handleAddLocal = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) return;
    
    // Push into localized temporary state
    setItems([...items, { ...formData, id: Date.now() }]);
    // Reset form
    setFormData({ name: '', price: '', category: '' });
  };

  const removeLocal = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const submitMenuToBackend = async () => {
    if (items.length === 0) {
      setError('Please add at least one item to your menu.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create all items securely through API parallel flow
      await Promise.all(items.map(item => api.post('/vendor/menu', {
        name: item.name,
        price: item.price,
        category: item.category
      })));
      setSuccessMsg('Menu securely saved! Redirecting...');
      setTimeout(() => navigate('/vendor/menu'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync menu with server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Build Your Menu</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Add the items you want to serve to your customers.</p>
          </div>
          {items.length > 0 && (
             <Button onClick={submitMenuToBackend} disabled={isSubmitting}>
               {isSubmitting ? 'Saving Menu...' : 'Publish Menu'}
             </Button>
          )}
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
        )}
        
        {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium rounded-xl border border-emerald-200 dark:border-emerald-900/50">
              {successMsg}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Add Item</h2>
              <form onSubmit={handleAddLocal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Main, Drinks, Sides"
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800]"
                  />
                </div>
                <Button type="submit" variant="outline" fullWidth>+ Add to Draft</Button>
              </form>
            </Card>
          </div>

          {/* Draft Preview List */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Draft Menu ({items.length})</h2>
            {items.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-zinc-500 dark:text-zinc-400">Your menu is empty.</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Use the form to add items.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[#8cb800] dark:text-[#d4ff00]">${Number(item.price).toFixed(2)}</span>
                      <button 
                        onClick={() => removeLocal(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
