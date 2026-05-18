import AdminLayout from '../../layouts/AdminLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useState } from 'react';

const settingsNav = [
  { name: 'General Settings', icon: '⚙️', active: true },
  { name: 'Payment Settings', icon: '💳' },
  { name: 'Email Settings', icon: '📧' },
  { name: 'SMS Settings', icon: '📱' },
  { name: 'Notification Settings', icon: '🔔' },
  { name: 'Security Settings', icon: '🔒' },
  { name: 'Backup Settings', icon: '💾' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General Settings');

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
        
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {settingsNav.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.name
                  ? 'bg-[#d4ff00] text-black shadow-[0_0_20px_rgba(212,255,0,0.2)]'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        {/* Main Settings Form */}
        <div className="lg:col-span-3">
          <Card className="p-8 border-zinc-800 bg-zinc-900/40">
            <h2 className="text-xl font-bold text-[#d4ff00] mb-6">{activeTab}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="Qzaam"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@qzaam.com"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Support Phone</label>
                <input 
                  type="text" 
                  defaultValue="+91 98765 43210"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Timezone</label>
                <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] text-white appearance-none">
                  <option>Asia/Kolkata (IST)</option>
                  <option>UTC</option>
                  <option>America/New_York (EST)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Currency</label>
                <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] text-white appearance-none">
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Platform Description</label>
                <textarea 
                  rows={3}
                  defaultValue="Qzaam is a next-gen digital ordering platform for restaurants and food courts."
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00] text-white resize-none"
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Button className="px-10 bg-[#d4ff00] text-black font-black hover:bg-[#c0e600] shadow-[0_0_30px_rgba(212,255,0,0.2)]">
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
