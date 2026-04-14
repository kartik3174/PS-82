import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertsProps {
  alerts: any[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-600 shadow-orange-500/20';
      case 'MEDIUM': return 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20';
      default: return 'bg-blue-500 text-white border-blue-600 shadow-blue-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <ShieldAlert size={20} />;
      case 'HIGH': return <AlertTriangle size={20} />;
      case 'MEDIUM': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-full">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Alert <span className="text-rose-500">Center</span></h2>
          <p className="text-slate-400 mt-2 font-medium">Real-time security notifications and threat logs</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs text-slate-300 font-black tracking-widest uppercase">Monitoring Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <motion.div 
                key={alert.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-6 flex items-center justify-between hover:border-slate-700/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${getSeverityColor(alert.severity)} shadow-lg`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-white">{alert.type}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Vessel <span className="text-white font-bold">{alert.shipName}</span> detected in violation of security protocols.
                    </p>
                    {alert.reasoning && (
                      <p className="text-xs text-slate-500 mt-2 italic">"{alert.reasoning}"</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <Clock size={14} />
                    <span>{alert.timestamp}</span>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all opacity-0 group-hover:opacity-100">
                    <CheckCircle2 size={14} />
                    Acknowledge
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-900/30 border border-slate-800/30 rounded-3xl p-20 text-center"
            >
              <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldAlert className="text-slate-600" size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">No Active Threats</h3>
              <p className="text-slate-500 max-w-sm mx-auto">System is clear. No security violations detected in the last 24 hours.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Alerts;
