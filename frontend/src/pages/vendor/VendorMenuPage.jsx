import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../../utils/api';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';


export default function VendorMenuPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '' });

  useEffect(() => {
    if (user && user.vendorType === 'salon') {
      navigate('/vendor/services');
    }
    fetchMenu();
  }, [user, navigate]);


  const fetchMenu = async () => {
    try {
      const res = await api.get('/vendor/menu');
      setItems(res.data.data);
    } catch (err) {
      setError('Failed to fetch menu items.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/vendor/menu/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  const openEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({ name: item.name, price: item.price, category: item.category });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/vendor/menu/${editingItem}`, editForm);
      setItems(items.map(i => i.id === editingItem ? res.data.data : i));
      setEditingItem(null);
    } catch (err) {
      setError('Failed to update item.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-24 px-4 flex justify-center text-zinc-500">
        Loading menu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Menu Management</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage all your active products and offerings.</p>
          </div>
          <Link to="/vendor/menu/create">
            <Button>+ Add New Items</Button>
          </Link>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
        )}

        {items.length === 0 ? (
           <div className="p-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-center">
             <p className="text-zinc-500 dark:text-zinc-400">Your menu is currently empty.</p>
             <Link to="/vendor/menu/create" className="mt-4 text-[#8cb800] dark:text-[#d4ff00] font-bold hover:underline">
               Get started by adding items
             </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <Card key={item.id} className="p-6 flex flex-col justify-between">
                {editingItem === item.id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      placeholder="Item Name"
                    />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editForm.price}
                      onChange={e => setEditForm({...editForm, price: e.target.value})}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      placeholder="Price"
                    />
                    <input
                      type="text"
                      required
                      value={editForm.category}
                      onChange={e => setEditForm({...editForm, category: e.target.value})}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      placeholder="Category"
                    />
                    <div className="flex gap-2 pt-2">
                       <Button type="submit" className="flex-1 text-sm py-1.5">Save</Button>
                       <Button type="button" variant="outline" className="flex-1 text-sm py-1.5" onClick={() => setEditingItem(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{item.name}</h3>
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-md text-xs font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[#8cb800] dark:text-[#d4ff00] font-black text-xl mb-4">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => openEdit(item)}>Edit</Button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-xl font-medium transition-colors border border-red-200 dark:border-red-900/50"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
