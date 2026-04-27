import { useAuth } from '../../context/AuthContext';
import { adminKPIs, mockVendorsExt, mockOrders, mockComplaints } from '../../data/mockData';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className="text-zinc-500">Welcome back, {user?.name}</p>
          </div>
          <Badge variant="neon">System Online</Badge>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {adminKPIs.map((kpi, idx) => (
            <Card key={idx} className="p-6">
              <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{kpi.label}</h3>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-zinc-900 dark:text-white">{kpi.value}</span>
                <span className={`text-sm font-bold mb-1 ${kpi.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                  {kpi.trend}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vendors */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Manage Vendors</h2>
            <div className="space-y-4">
              {mockVendorsExt.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div>
                    <h4 className="font-semibold">{v.name}</h4>
                    <p className="text-xs text-zinc-500">Sales: ₹{(v.sales).toLocaleString()} · Rating: {v.rating}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <Badge variant={v.status === 'active' ? 'green' : v.status === 'pending' ? 'orange' : 'red'}>
                      {v.status}
                    </Badge>
                    {v.status === 'pending' && <Button size="xs" variant="outline">Approve</Button>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Orders */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Live Orders Monitor</h2>
            <div className="space-y-4">
              {mockOrders.map(o => (
                <div key={o.id} className="flex p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{o.id} - {o.customer}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">{o.items}</p>
                  </div>
                  <Badge variant={o.status === 'completed' ? 'zinc' : o.status === 'ready' ? 'green' : 'orange'}>
                    {o.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Complaints */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Customer Complaints</h2>
          <div className="space-y-4">
            {mockComplaints.map(c => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div>
                  <p className="font-medium">"{c.text}"</p>
                  <p className="text-xs text-zinc-500 mt-1">From: {c.user}</p>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                  <Badge variant={c.status === 'open' ? 'red' : 'green'}>{c.status}</Badge>
                  {c.status === 'open' && <Button size="xs" variant="outline">Resolve</Button>}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
