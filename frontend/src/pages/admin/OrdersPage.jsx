import { adminOrders } from '../../data/adminMockData';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function OrdersPage() {
  const stats = [
    { label: 'Total Orders', value: '1,284', icon: '🛍️' },
    { label: "Today's", value: '42', icon: '📅' },
    { label: 'Completed', value: '1,150', icon: '✅' },
    { label: 'Cancelled', value: '34', icon: '❌' },
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

        {/* Orders Table */}
        <Card className="border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#d4ff00]">Recent Orders</h2>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d4ff00] w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Vendor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {adminOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-zinc-400">{order.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{order.vendor}</td>
                    <td className="px-6 py-4">
                      <Badge variant={order.status === 'completed' ? 'green' : order.status === 'pending' ? 'orange' : 'red'}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">₹{order.amount}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{order.time}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-[#d4ff00] transition-colors">
                        👁️
                      </button>
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
