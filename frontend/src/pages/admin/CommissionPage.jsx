import { adminCommissions } from '../../data/adminMockData';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function CommissionPage() {
  const stats = [
    { label: 'Total Commission', value: '₹1,24,500', icon: '💰' },
    { label: "Today's", value: '₹2,450', icon: '📅' },
    { label: 'This Month', value: '₹34,800', icon: '📊' },
    { label: 'Pending', value: '₹8,250', icon: '⏳' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Commission Table */}
        <Card className="border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#d4ff00]">Vendor Commissions</h2>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search vendor..." 
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d4ff00] w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Total Sales</th>
                  <th className="px-6 py-4">Rate (%)</th>
                  <th className="px-6 py-4">Commission</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Earned On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {adminCommissions.map((comm, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-semibold">{comm.vendor}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">₹{comm.totalSales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500">{comm.rate}%</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#d4ff00]">₹{comm.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={comm.status === 'paid' ? 'green' : 'orange'}>
                        {comm.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{comm.date}</td>
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
