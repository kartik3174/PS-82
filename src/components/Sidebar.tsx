import React from 'react';
import { LayoutDashboard, Map as MapIcon, Play, Bell, History, Shield, Eye, MessageSquare, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  userRole: string;
  isDemoMode: boolean;
  setIsDemoMode: (mode: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, userRole, isDemoMode, setIsDemoMode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapIcon },
    { id: 'simulator', label: 'Simulator', icon: Play },
    { id: 'vision', label: 'AI Vision', icon: Eye },
    { id: 'reports', label: 'Community', icon: MessageSquare },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleLogin = () => signInWithPopup(auth, googleProvider);
  const handleLogout = () => signOut(auth);

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800/50 h-screen flex flex-col sticky top-0 z-[1001]">
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
          <Shield className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter leading-none">SEAGUARD</h1>
          <p className="text-[10px] font-bold text-blue-500 tracking-[0.2em]">AI CORE</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
              activeTab === item.id
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-600 rounded-xl shadow-xl shadow-blue-600/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon size={20} className={`relative z-10 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-bold text-sm relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 space-y-6">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-2xl border border-slate-800/50">
              <Avatar className="w-10 h-10 border-2 border-slate-800 shadow-inner">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="bg-slate-800 text-slate-400">
                  <UserIcon size={20} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{user.displayName?.split(' ')[0]}</p>
                <Badge variant="outline" className="text-[9px] h-4 border-blue-500/30 text-blue-400 font-black px-1.5">
                  {userRole.toUpperCase()}
                </Badge>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-500 rounded-2xl h-12 font-bold shadow-lg shadow-blue-600/20 gap-2"
            onClick={handleLogin}
          >
            <LogIn size={18} />
            Sign In
          </Button>
        )}

        <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Demo Mode</p>
            <button 
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`w-10 h-5 rounded-full transition-all relative ${isDemoMode ? 'bg-blue-600' : 'bg-slate-800'}`}
            >
              <motion.div 
                animate={{ x: isDemoMode ? 20 : 2 }}
                className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">
            {isDemoMode ? 'Accelerated simulation with auto-alerts enabled.' : 'Standard operational monitoring.'}
          </p>
        </div>

        <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Core Status</p>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
          <p className="text-xs font-bold text-slate-300">Operational</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
