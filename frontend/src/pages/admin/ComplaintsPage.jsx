import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import api from '../../utils/api';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/admin/complaints');
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: '⚠️' },
    { label: 'Open', value: complaints.filter(c => c.status === 'open').length, icon: '🔓' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, icon: '✅' },
    { label: 'High Priority', value: complaints.filter(c => c.priority === 'high').length, icon: '🔥' },
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'open': return 'red';
      case 'in-progress': return 'orange';
      case 'resolved': return 'green';
      default: return 'zinc';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'zinc';
      default: return 'zinc';
    }
  };

  const filtered = complaints.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Complaints Table */}
        <Card className="border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-[#d4ff00]">Customer Complaints</h2>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Search complaints..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d4ff00] w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2">
                <Spinner />
                <span className="text-sm font-medium text-zinc-400">Loading complaints...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-sm font-medium">No complaints found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/50 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                    <th className="px-6 py-4">Complaint ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Vendor</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filtered.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-zinc-400">#{complaint.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{complaint.customer?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{complaint.vendor?.outletName || complaint.vendor?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        <span className="font-bold block text-zinc-200">{complaint.subject}</span>
                        <span className="text-xs text-zinc-500 leading-normal">{complaint.description}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getPriorityVariant(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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
