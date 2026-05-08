import { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';


export default function CreateMenuPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form bounds for a single new item entry
  const [formData, setFormData] = useState({ name: '', price: '', category: '', description: '', prepTime: '' });

  useEffect(() => {
    if (user && user.vendorType === 'salon') {
      navigate('/vendor/services');
    }
  }, [user, navigate]);


  const handleAddLocal = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) return;
    
    // Push into localized temporary state
    setItems([...items, { 
      ...formData, 
      id: Date.now(), 
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : 10 
    }]);
    // Reset form
    setFormData({ name: '', price: '', category: '', description: '', prepTime: '' });
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
        category: item.category,
        description: item.description,
        prepTime: item.prepTime
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
      <div className="max-w-5xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Add Item Form */}
          <div className="md:col-span-5">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Add Item</h2>
              <form onSubmit={handleAddLocal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
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
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Prep Time (Min)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="10"
                      value={formData.prepTime}
                      onChange={e => setFormData({...formData, prepTime: e.target.value})}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800]"
                    />
                  </div>
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
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the item..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-[#8cb800] dark:focus:ring-[#d4ff00] focus:border-[#8cb800]"
                  />
                </div>
                <Button type="submit" variant="outline" fullWidth>+ Add to Draft</Button>
              </form>
            </Card>
          </div>

          {/* Draft Preview List */}
          <div className="md:col-span-7">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Draft Menu ({items.length})</h2>
            {items.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-900/30">
                <p className="text-zinc-500 dark:text-zinc-400 font-bold">Your menu is empty.</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Add your first dish to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="group p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-[#d4ff00]/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-black text-zinc-900 dark:text-white">{item.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#8cb800] dark:text-[#d4ff00]">{item.category}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">• {item.prepTime} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-zinc-900 dark:text-white text-lg">₹{item.price}</span>
                        <button 
                          onClick={() => removeLocal(item.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-xs text-zinc-500 line-clamp-2 italic">"{item.description}"</p>
                    )}
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
