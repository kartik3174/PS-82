import React from 'react';
import { LayoutDashboard, Map as MapIcon, Play, Bell, History, Shield, Eye, MessageSquare, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, userRole }) => {
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
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <Shield className="text-blue-500 w-8 h-8" />
        <h1 className="text-xl font-bold text-white tracking-tight">SeaGuard AI</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

      <div className="p-4 border-t border-slate-800 space-y-4">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="w-10 h-10 border border-slate-700">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="bg-slate-800 text-slate-400">
                  <UserIcon size={20} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
                <Badge variant="outline" className="text-[10px] h-4 border-blue-500/50 text-blue-400 uppercase">
                  {userRole.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 border-slate-800 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/50"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-500 gap-2"
            onClick={handleLogin}
          >
            <LogIn size={18} />
            Sign In with Google
          </Button>
        )}

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
