import React from 'react';
import { LayoutDashboard, Map as MapIcon, Play, Bell, History, Shield } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapIcon },
    { id: 'simulator', label: 'Simulator', icon: Play },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Shield className="text-blue-500 w-8 h-8" />
        <h1 className="text-xl font-bold text-white tracking-tight">SeaGuard AI</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm text-slate-300">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
