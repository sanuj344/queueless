import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatCurrency';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    console.log("API HIT: /admin/orders");
    try {
      const res = await api.get('/admin/orders');
      console.log("Orders data received:", res.data);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Fetch Orders Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: '🛍️' },
    { label: "Today's Orders", value: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length, icon: '📅' },
    { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: '✅' },
    { label: 'Active', value: orders.filter(o => ['pending', 'accepted', 'preparing', 'ready'].includes(o.status)).length, icon: '🔥' },
  ];

  if (isLoading) return <AdminLayout><div className="pt-20 text-center text-zinc-500">Loading orders...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Orders Table */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#8cb800] dark:text-[#d4ff00]">All Orders</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#8cb800] dark:focus:border-[#d4ff00] text-zinc-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
              </select>
              
              <input 
                type="text" 
                placeholder="Search customer or Order ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#8cb800] dark:focus:border-[#d4ff00] w-full sm:w-64 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-zinc-500 text-sm">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-xs font-mono text-zinc-400">{order.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{order.customerName}</p>
                        <p className="text-[10px] text-zinc-500">{order.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={order.status === 'completed' ? 'green' : ['pending', 'accepted'].includes(order.status) ? 'orange' : 'blue'}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-[#8cb800] dark:hover:text-[#d4ff00] transition-colors">
                          👁️
                        </button>
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
