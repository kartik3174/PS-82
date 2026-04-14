import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { Ship, ShieldCheck, AlertTriangle, Activity, TrendingUp, Anchor, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

const data = [
  { name: '00:00', activity: 40, risk: 10 },
  { name: '04:00', activity: 30, risk: 15 },
  { name: '08:00', activity: 65, risk: 45 },
  { name: '12:00', activity: 85, risk: 30 },
  { name: '16:00', activity: 70, risk: 20 },
  { name: '20:00', activity: 50, risk: 60 },
  { name: '23:59', activity: 45, risk: 25 },
];

interface DashboardProps {
  ships: any[];
  alerts: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ ships, alerts }) => {
  const totalShips = ships.length;
  const suspiciousShips = ships.filter(s => s.status === 'Suspicious').length;
  const warningShips = ships.filter(s => s.status === 'Warning').length;
  const safeShips = totalShips - suspiciousShips - warningShips;

  const stats = [
    { label: 'Active Vessels', value: totalShips, icon: Ship, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12%' },
    { label: 'Secure Zone', value: safeShips, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 'Stable' },
    { label: 'Threat Alerts', value: suspiciousShips, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', trend: '+2' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-8 bg-slate-950 min-h-full"
    >
      <header className="flex justify-between items-end">
        <div>
          <motion.h2 variants={itemVariants} className="text-4xl font-black text-white tracking-tight">
            Security <span className="text-blue-500">Overview</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-slate-400 mt-2 font-medium">
            Real-time maritime intelligence & predictive threat analysis
          </motion.p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-300">LIVE FEED</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label} 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-3xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon size={80} />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`${stat.bg} p-4 rounded-2xl`}>
                <stat.icon className={stat.color} size={28} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <span className={`text-[10px] font-bold ${stat.trend.includes('+') ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="text-blue-500" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Vessel Traffic Density</h3>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-400">24H WINDOW</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="activity" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorActivity)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <TrendingUp className="text-rose-500" size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Risk Profile</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Safe', count: safeShips, color: '#10b981' },
                { name: 'Warning', count: warningShips, color: '#f59e0b' },
                { name: 'Critical', count: suspiciousShips, color: '#f43f5e' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1500}>
                  {[safeShips, warningShips, suspiciousShips].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Speed', value: '14.2 kn', icon: Navigation },
          { label: 'Active Alerts', value: alerts.length || 0, icon: AlertTriangle },
          { label: 'System Load', value: '24%', icon: Activity },
          { label: 'Port Status', value: 'Open', icon: Anchor },
        ].map((item) => (
          <motion.div 
            key={item.label}
            variants={itemVariants}
            className="bg-slate-900/30 border border-slate-800/30 p-4 rounded-2xl flex items-center gap-4"
          >
            <div className="p-2 bg-slate-800 rounded-lg">
              <item.icon size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">{item.label}</p>
              <p className="text-lg font-bold text-white">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Dashboard;
