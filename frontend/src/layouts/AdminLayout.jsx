import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('vendors')) return 'Vendors Management';
    if (path.includes('orders')) return 'Orders History';
    if (path.includes('customers')) return 'Customers Database';
    if (path.includes('payments')) return 'Financial Transactions';
    if (path.includes('commission')) return 'Commission & Payouts';
    if (path.includes('reports')) return 'Analytics & Reports';
    if (path.includes('complaints')) return 'Customer Support';
    if (path.includes('settings')) return 'System Settings';
    return 'Dashboard Overview';
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Sidebar - Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-8 bg-white/80 dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              ☰
            </button>
            <h2 className="text-zinc-600 dark:text-zinc-400 font-medium text-sm sm:text-base truncate">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-[#8cb800] dark:text-[#d4ff00]">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
