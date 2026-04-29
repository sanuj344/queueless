import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import api from '../../utils/api';
import Spinner from '../../components/Spinner';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVendors = async () => {
    console.log("[VendorsPage] API HIT: /admin/vendors");
    try {
      const res = await api.get('/admin/vendors');
      console.log("[VendorsPage] Data received:", res.data);
      if (res.data && res.data.success) {
        setVendors(res.data.data || []);
      } else {
        setError('Unexpected API response format');
      }
    } catch (err) {
      console.error("[VendorsPage] Fetch Error:", err);
      setError('Failed to fetch vendors. ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleApproval = async (id, isApproved) => {
    try {
      await api.patch(`/admin/vendor/${id}`, { isApproved });
      setVendors(prev => prev.map(v => v.id === id ? { ...v, isApproved } : v));
    } catch (err) {
      console.error("[VendorsPage] Update Error:", err);
      alert('Failed to update vendor status');
    }
  };

  const filteredVendors = (vendors || []).filter(v => {
    const name = (v.name || '').toLowerCase();
    const outlet = (v.outletName || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || outlet.includes(search);
  });

  const stats = [
    { label: 'Total Vendors', value: (vendors || []).length, icon: '🏪' },
    { label: 'Approved', value: (vendors || []).filter(v => v.isApproved).length, icon: '✅' },
    { label: 'Pending', value: (vendors || []).filter(v => !v.isApproved).length, icon: '⏳' },
  ];

  if (isLoading) return (
    <AdminLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</h3>
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</span>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/50 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Vendors Table */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#8cb800] dark:text-[#d4ff00]">
              Vendor Management <span className="text-sm font-normal text-zinc-500">({filteredVendors.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search vendor or outlet..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#8cb800] dark:focus:border-[#d4ff00] w-full sm:w-64 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Vendor & Outlet</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">GST Info</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-3">🏪</span>
                        <p className="text-zinc-500 text-sm font-medium">No vendors found.</p>
                        {vendors.length > 0 && <p className="text-zinc-400 text-xs mt-1">Try adjusting your search.</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-sm font-bold text-[#8cb800] dark:text-[#d4ff00]">
                            {(vendor.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{vendor.outletName || vendor.name || 'Untitled Outlet'}</p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-tight">{vendor.name || 'Unknown Owner'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{vendor.email}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{vendor.mobile}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={vendor.isApproved ? 'green' : 'zinc'}>
                          {vendor.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{vendor.hasGst ? 'GST Active' : 'No GST'}</p>
                        {vendor.gstNumber && <p className="text-[10px] text-zinc-500 font-mono uppercase mt-0.5">{vendor.gstNumber}</p>}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!vendor.isApproved ? (
                            <Button 
                              size="xs" 
                              onClick={() => handleApproval(vendor.id, true)}
                              className="bg-[#8cb800]/10 dark:bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] hover:bg-[#8cb800]/20 dark:hover:bg-[#d4ff00]/20 border-none px-3"
                            >
                              Approve
                            </Button>
                          ) : (
                            <Button 
                              size="xs" 
                              onClick={() => handleApproval(vendor.id, false)}
                              className="bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20 border-none px-3"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
