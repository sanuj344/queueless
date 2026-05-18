import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
  { name: 'Vendors', icon: '🏪', path: '/admin/vendors' },
  { name: 'Orders', icon: '🛍️', path: '/admin/orders' },
  { name: 'Customers', icon: '👥', path: '/admin/customers' },
  { name: 'Payments', icon: '💳', path: '/admin/payments' },
  { name: 'Commission', icon: '💰', path: '/admin/commission' },
  { name: 'Reports', icon: '📈', path: '/admin/reports' },
  { name: 'Complaints', icon: '⚠️', path: '/admin/complaints' },
];

export default function AdminSidebar({ onClose }) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen sticky top-0 transition-all duration-300">
      {/* Brand */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 select-none">
          <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">Qz</span>
          <span className="text-xl font-black tracking-tight text-[#8cb800] dark:text-[#d4ff00]">aam</span>
        </Link>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#d4ff00] text-black shadow-[0_0_20px_rgba(212,255,0,0.2)]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'filter invert' : ''}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          to="/admin/logout"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            location.pathname === '/admin/logout'
              ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'text-red-500 dark:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <span className="text-lg">🚪</span>
          Logout
        </Link>
      </div>
    </aside>
  );
}
