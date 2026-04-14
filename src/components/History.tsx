import React from 'react';
import { Search, Download, Filter, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="p-8 space-y-8 bg-slate-950 min-h-full">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Event <span className="text-blue-500">History</span></h2>
          <p className="text-slate-400 mt-2 font-medium">Comprehensive log of all maritime activities and system events</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <Input 
              placeholder="Search history..." 
              className="bg-slate-900/50 border-slate-800 rounded-2xl pl-12 pr-4 h-14 text-sm text-white focus:ring-2 focus:ring-blue-500/50 w-72 transition-all"
            />
          </div>
          <Button variant="outline" className="h-14 w-14 p-0 bg-slate-900 border-slate-800 text-slate-400 rounded-2xl hover:text-white hover:bg-slate-800 transition-all">
            <Filter size={20} />
          </Button>
          <Button 
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Download size={18} className="mr-2" />
            Export Intelligence
          </Button>
        </div>
      </header>

      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vessel Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action / Event</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <AnimatePresence mode="popLayout">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <motion.tr 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-800/30 transition-all group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-500 font-black text-xs">
                            {item.shipName.charAt(0)}
                          </div>
                          <span className="text-white font-bold">{item.shipName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-slate-300 font-medium">{item.action}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-700/50">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-slate-500 text-xs font-black font-mono">{item.timestamp}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                          item.status === 'Suspicious' ? 'text-rose-500' : 
                          item.status === 'Warning' ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          <div className={`w-2 h-2 rounded-full shadow-lg ${
                            item.status === 'Suspicious' ? 'bg-rose-500 shadow-rose-500/20' : 
                            item.status === 'Warning' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20'
                          }`} />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-slate-600 group-hover:text-blue-500 group-hover:bg-blue-500/10 rounded-xl transition-all">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr initial={{ opacity: 0 }}>
                    <td colSpan={6} className="px-8 py-24 text-center">
                      <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <HistoryIcon className="text-slate-600" size={32} />
                      </div>
                      <h3 className="text-xl font-black text-white mb-2">No Historical Records</h3>
                      <p className="text-slate-500 max-w-xs mx-auto text-sm">No maritime activity has been logged for the current operational session.</p>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
