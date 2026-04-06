import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Info } from 'lucide-react';

interface AlertsProps {
  alerts: any[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white border-red-600';
      case 'HIGH': return 'bg-orange-500 text-white border-orange-600';
      case 'MEDIUM': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-blue-500 text-white border-blue-600';
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
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Alert Center</h2>
          <p className="text-slate-400">Real-time security notifications and threat logs</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-slate-300 font-medium">Monitoring Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl ${getSeverityColor(alert.severity)} shadow-lg`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-bold text-white">{alert.type}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    Vessel <span className="text-white font-medium">{alert.shipName}</span> detected in violation of security protocols.
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock size={14} />
                  <span>{alert.timestamp}</span>
                </div>
                <button className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Acknowledge
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="text-slate-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Active Threats</h3>
            <p className="text-slate-500">System is clear. No security violations detected in the last 24 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
