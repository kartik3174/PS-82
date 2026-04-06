import React from 'react';
import { Search, Download, Filter, ChevronRight } from 'lucide-react';

interface HistoryProps {
  history: any[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['Vessel Name', 'Action', 'Type', 'Timestamp', 'Status'];
    const csvContent = [
      headers.join(','),
      ...history.map(item => [
        `"${item.shipName}"`,
        `"${item.action}"`,
        `"${item.type}"`,
        `"${item.timestamp}"`,
        `"${item.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seaguard_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Event History</h2>
          <p className="text-slate-400">Comprehensive log of all maritime activities and system events</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search history..." 
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
            />
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-white">
            <Filter size={20} />
          </button>
          <button 
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vessel Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action / Event</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {history.length > 0 ? (
              history.map((item, index) => (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{item.shipName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300">{item.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-sm font-mono">{item.timestamp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-sm ${
                      item.status === 'Suspicious' ? 'text-red-500' : 
                      item.status === 'Warning' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Suspicious' ? 'bg-red-500' : 
                        item.status === 'Warning' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-600 group-hover:text-blue-500 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                  No historical data available for the current session.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
