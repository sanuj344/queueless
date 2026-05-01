import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/admin/payments');
        setPayments(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { 
      label: 'Total Payments', 
      value: `₹${payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}`, 
      icon: '💳' 
    },
    { 
      label: "Today's", 
      value: `₹${payments.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}`, 
      icon: '📅' 
    },
    { 
      label: 'Successful', 
      value: `₹${payments.filter(p => p.status === 'success').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}`, 
      icon: '✅' 
    },
    { 
      label: 'Failed/Pending', 
      value: `₹${payments.filter(p => p.status !== 'success').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('en-IN')}`, 
      icon: '⏳' 
    },
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

        {/* Payments Table */}
        <Card className="border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#d4ff00]">Transaction History</h2>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search payments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d4ff00] w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20">
                <Spinner />
              </div>
            ) : filteredPayments.length === 0 ? (
              <EmptyState text={searchQuery ? "No results found" : "No payments yet"} />
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                    <th className="px-6 py-4">Payment ID</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Paid On</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-zinc-400">{payment.id}</td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-500">{payment.orderId.slice(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm font-semibold">{payment.vendorName || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-white">₹{payment.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <Badge variant={payment.status === 'success' ? 'green' : payment.status === 'pending' ? 'orange' : 'red'}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-[#d4ff00] transition-colors">
                          📄
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
