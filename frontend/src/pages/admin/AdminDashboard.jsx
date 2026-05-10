import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.success) {
        setData(res.data.data);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApproval = async (id, isApproved) => {
    try {
      await api.patch(`/admin/vendor/${id}`, { isApproved });
      // update the state without refetching entirely if needed or refetch for consistency
      fetchDashboard();
    } catch (err) {
      console.error("[AdminDashboard] Update Error:", err);
      alert('Failed to update vendor status');
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/50 text-sm">
        ⚠️ {error}
      </div>
    </AdminLayout>
  );

  const stats = [
    { label: "Commission Earned", value: `₹${(data?.commission || 0).toLocaleString()}`, icon: "💰" },
    { label: "Total Vendors", value: data?.totalVendors || 0, icon: "🏪" },
    { label: "Verified Vendors", value: data?.verifiedVendors || 0, icon: "✅" },
    { label: "Unverified Vendors", value: data?.unverifiedVendors || 0, icon: "⏳" }
  ];

  const filteredVendors = (data?.vendors || []).filter(v => {
    const name = (v.name || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search);
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((kpi, idx) => (
            <Card key={idx} className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all group flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{kpi.label}</h3>
                <span className="text-xl select-none">{kpi.icon}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-[#8cb800] dark:group-hover:text-[#d4ff00] transition-colors">
                  {kpi.value}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Vendors Table Section */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Vendor Management</h2>
              <p className="text-xs text-zinc-500">Monitor and manage all onboarded vendors</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search vendors..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-9 py-2 text-xs focus:outline-none focus:border-[#8cb800] dark:focus:border-[#d4ff00] transition-colors w-full sm:w-64 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Transactions</th>
                  <th className="px-6 py-4">Cancelled</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filteredVendors.map((vendor, i) => {
                  const isSalon = vendor.vendorType === 'salon';
                  return (
                  <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-[#8cb800] dark:text-[#d4ff00]">
                          {(vendor.name || '').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={isSalon ? 'purple' : 'orange'}>
                        {isSalon ? 'SALON' : 'FOOD'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={vendor.status === 'verified' ? 'green' : 'zinc'}>
                        {vendor.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{vendor.totalOrders || 0}</td>
                    <td className="px-6 py-4 text-sm text-red-500 dark:text-red-400/80">{vendor.cancelled || 0}</td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">₹{(vendor.revenue || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {vendor.joinedAt ? new Date(vendor.joinedAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Showing {filteredVendors.length} of {data?.vendors?.length || 0} vendors
            </p>
          </div>
        </Card>

      </div>
    </AdminLayout>
  );
}
