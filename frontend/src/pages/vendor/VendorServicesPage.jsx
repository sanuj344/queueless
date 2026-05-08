import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const CATEGORIES = ['General', 'Hair', 'Skin', 'Nails', 'Massage', 'Makeup', 'Beard'];

export default function VendorServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', duration: '30', category: 'General' });

  useEffect(() => {
    if (user && user.vendorType !== 'salon') {
      navigate('/vendor/dashboard');
    }
    fetchServices();
  }, [user, navigate]);


  const fetchServices = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/services/${user.id}`);
      setServices(res.data.data || []);
    } catch {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const resetForm = () => { setForm({ name: '', price: '', duration: '30', category: 'General' }); setEditingId(null); setShowForm(false); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Name and price are required');
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/services/${editingId}`, form);
        toast.success('Service updated!');
      } else {
        await api.post('/services', form);
        toast.success('Service added!');
      }
      resetForm();
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setForm({ name: service.name, price: String(service.price), duration: String(service.duration), category: service.category });
    setEditingId(service.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deleted');
      fetchServices();
    } catch {
      toast.error('Failed to delete service');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Manage Services</h1>
            <p className="text-zinc-500 text-sm mt-1">Add and manage your salon service offerings</p>
          </div>
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? '✕ Cancel' : '+ Add Service'}
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="rounded-3xl border border-[#d4ff00]/20 bg-[#d4ff00]/5 p-6 mb-8 animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-sm font-black text-[#8cb800] dark:text-[#d4ff00] uppercase tracking-widest mb-5">
              {editingId ? 'Edit Service' : 'New Service'}
            </h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Service Name</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Men's Haircut" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required placeholder="e.g. 250" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Duration (minutes)</label>
                <input name="duration" type="number" min="5" step="5" value={form.duration} onChange={handleChange} placeholder="30" className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${form.category === cat ? 'bg-[#d4ff00] text-black border-[#d4ff00]' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
                </Button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        {loading ? (
          <div className="text-center py-20 text-zinc-400 animate-pulse">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✂️</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No services yet</h3>
            <p className="text-zinc-500 mt-2">Add your first salon service to start accepting bookings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map(service => (
              <div key={service.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 flex flex-col gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-zinc-900 dark:text-white">{service.name}</h3>
                    <span className="text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-wider">{service.category}</span>
                  </div>
                  <span className="text-lg font-black text-zinc-900 dark:text-white shrink-0">{formatCurrency(service.price)}</span>
                </div>
                <p className="text-xs text-zinc-500">⏱ {service.duration} minutes</p>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => handleEdit(service)} className="flex-1 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Edit</button>
                  <button onClick={() => handleDelete(service.id)} className="flex-1 py-2 text-xs font-bold border border-red-200 dark:border-red-500/20 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/5 transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
