import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Ship, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';

const data = [
  { name: '00:00', activity: 40 },
  { name: '04:00', activity: 30 },
  { name: '08:00', activity: 65 },
  { name: '12:00', activity: 85 },
  { name: '16:00', activity: 70 },
  { name: '20:00', activity: 50 },
  { name: '23:59', activity: 45 },
];

interface DashboardProps {
  ships: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ ships }) => {
  const totalShips = ships.length;
  const suspiciousShips = ships.filter(s => s.status === 'Suspicious').length;
  const safeShips = totalShips - suspiciousShips;

  const stats = [
    { label: 'Total Ships', value: totalShips, icon: Ship, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Safe Ships', value: safeShips, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Suspicious', value: suspiciousShips, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-white">Security Overview</h2>
        <p className="text-slate-400">Real-time maritime analytics and threat detection</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-6">
            <div className={`${stat.bg} p-4 rounded-xl`}>
              <stat.icon className={stat.color} size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-blue-500" size={20} />
            <h3 className="text-lg font-bold text-white">Ship Activity (24h)</h3>
          </div>
          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="activity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActivity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Risk Distribution</h3>
          <div className="h-64 w-full min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={[
                { name: 'Safe', count: safeShips },
                { name: 'Warning', count: ships.filter(s => s.status === 'Warning').length },
                { name: 'Suspicious', count: suspiciousShips }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  cursor={{ fill: '#1e293b' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
