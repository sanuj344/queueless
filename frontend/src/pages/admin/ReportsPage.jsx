import { reportsData } from '../../data/adminMockData';
import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import { useTheme } from '../../context/ThemeContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function ReportsPage() {
  const { isDark } = useTheme();
  const stats = [
    { label: 'Total Revenue', value: '₹8,24,500', icon: '💰' },
    { label: 'Total Orders', value: '12,450', icon: '📦' },
    { label: 'Total Customers', value: '4,850', icon: '👥' },
    { label: 'Avg Order Value', value: '₹450', icon: '📈' },
  ];

  const chartColors = {
    grid: isDark ? '#27272a' : '#e4e4e7',
    text: isDark ? '#71717a' : '#a1a1aa',
    tooltipBg: isDark ? '#09090b' : '#ffffff',
    tooltipBorder: isDark ? '#27272a' : '#e4e4e7',
    primary: isDark ? '#d4ff00' : '#8cb800'
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Overview - Line Chart */}
          <Card className="lg:col-span-2 p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <h2 className="text-lg font-bold text-[#8cb800] dark:text-[#d4ff00] mb-6">Revenue Overview</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportsData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke={chartColors.text} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke={chartColors.text} 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: chartColors.tooltipBg, 
                      border: `1px solid ${chartColors.tooltipBorder}`, 
                      borderRadius: '12px',
                      color: isDark ? '#fff' : '#000'
                    }}
                    itemStyle={{ color: chartColors.primary }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={chartColors.primary} 
                    strokeWidth={3} 
                    dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Orders by Status - Pie Chart */}
          <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <h2 className="text-lg font-bold text-[#8cb800] dark:text-[#d4ff00] mb-6">Order Status</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportsData.ordersStatus}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {reportsData.ordersStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: chartColors.tooltipBg, 
                      border: `1px solid ${chartColors.tooltipBorder}`, 
                      borderRadius: '12px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {reportsData.ordersStatus.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-zinc-500">{item.name}</span>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

      </div>
    </AdminLayout>
  );
}
