import { adminVendors, adminKPIs } from '../../data/adminMockData';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminKPIs.map((kpi, idx) => (
            <Card key={idx} className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{kpi.label}</h3>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${kpi.positive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-[#8cb800] dark:group-hover:text-[#d4ff00] transition-colors">{kpi.value}</span>
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
                  className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-9 py-2 text-xs focus:outline-none focus:border-[#8cb800] dark:focus:border-[#d4ff00] transition-colors w-full sm:w-64 text-zinc-900 dark:text-white"
                />
              </div>
              <Button size="sm" variant="outline" className="text-xs border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                <span>⚡</span> Filter
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Orders (Today)</th>
                  <th className="px-6 py-4">Cancelled</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {adminVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-[#8cb800] dark:text-[#d4ff00]">
                          {vendor.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={vendor.status === 'verified' ? 'green' : 'zinc'}>
                        {vendor.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{vendor.orders || 0}</td>
                    <td className="px-6 py-4 text-sm text-red-500 dark:text-red-400/80">{vendor.cancelled || 0}</td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">₹{(vendor.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{vendor.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {vendor.status === 'verified' ? (
                          <Button size="xs" className="bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20 border-none px-3">
                            Terminate
                          </Button>
                        ) : (
                          <>
                            <Button size="xs" className="bg-[#8cb800]/10 dark:bg-[#d4ff00]/10 text-[#8cb800] dark:text-[#d4ff00] hover:bg-[#8cb800]/20 dark:hover:bg-[#d4ff00]/20 border-none px-3">
                              Approve
                            </Button>
                            <Button size="xs" className="bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20 border-none px-3">
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Showing {adminVendors.length} of 32 vendors</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((page) => (
                <button 
                  key={page}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === 1 
                      ? 'bg-[#8cb800] dark:bg-[#d4ff00] text-white dark:text-black shadow-[0_0_15px_rgba(212,255,0,0.3)]' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </AdminLayout>
  );
}
