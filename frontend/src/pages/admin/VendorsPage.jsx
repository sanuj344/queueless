import { adminVendors } from '../../data/adminMockData';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function VendorsPage() {
  const stats = [
    { label: 'Total Vendors', value: adminVendors.length, icon: '🏪' },
    { label: 'Verified', value: adminVendors.filter(v => v.status === 'verified').length, icon: '✅' },
    { label: 'Unverified', value: adminVendors.filter(v => v.status === 'unverified').length, icon: '⏳' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-5 border-zinc-800 bg-zinc-900/40">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">{stat.label}</h3>
                  <span className="text-2xl font-black text-white">{stat.value}</span>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Vendors Table */}
        <Card className="border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#d4ff00]">All Vendors</h2>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d4ff00] w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Total Orders</th>
                  <th className="px-6 py-4">Total Earnings</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {adminVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-[#d4ff00]">
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{vendor.name}</p>
                          <p className="text-[10px] text-zinc-500">{vendor.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={vendor.status === 'verified' ? 'green' : 'zinc'}>
                        {vendor.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{vendor.joined}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{vendor.orders}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white">₹{vendor.earnings.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {vendor.status === 'verified' ? (
                          <Button size="xs" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none">
                            Terminate
                          </Button>
                        ) : (
                          <>
                            <Button size="xs" className="bg-[#d4ff00]/10 text-[#d4ff00] hover:bg-[#d4ff00]/20 border-none">
                              Approve
                            </Button>
                            <Button size="xs" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-none">
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
        </Card>
      </div>
    </AdminLayout>
  );
}
