import React, { useState } from 'react';
import { Play, Square, RefreshCw, Compass, Gauge, AlertCircle, Shield, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface SimulatorProps {
  ships: any[];
  setShips: React.Dispatch<React.SetStateAction<any[]>>;
  addHistory: (event: any) => void;
  addAlert: (alert: any) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
}

const Simulator: React.FC<SimulatorProps> = ({ ships, setShips, isSimulating, setIsSimulating }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(ships[0]?.id || null);

  const selectedShip = ships.find(s => s.id === selectedShipId);

  const handlePredict = async () => {
    if (!selectedShip) return;
    setIsPredicting(true);
    try {
      const response = await fetch('/api/predict-future', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: selectedShip.lat,
          lon: selectedShip.lon,
          speed: selectedShip.speed,
          heading: selectedShip.heading
        })
      });
      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-full">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Mission <span className="text-blue-500">Simulator</span></h2>
          <p className="text-slate-400 mt-2 font-medium">Control and predict maritime trajectories in real-time</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`h-14 px-8 rounded-2xl font-black transition-all shadow-lg ${
              isSimulating 
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:bg-rose-500/20' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'
            }`}
          >
            {isSimulating ? <><Square size={20} className="mr-2" /> Stop Simulation</> : <><Play size={20} className="mr-2" /> Start Simulation</>}
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setShips([
                { id: 'S-101', name: 'Ever Given', lat: 12.5, lon: 80.5, speed: 12, heading: 45, status: 'Safe', riskScore: 10 },
                { id: 'S-102', name: 'Blue Whale', lat: 13.0, lon: 81.0, speed: 8, heading: 180, status: 'Safe', riskScore: 15 },
                { id: 'S-103', name: 'Ocean Nomad', lat: 12.2, lon: 80.2, speed: 4, heading: 90, status: 'Suspicious', riskScore: 75 },
                { id: 'S-104', name: 'Arctic Star', lat: 13.8, lon: 80.8, speed: 15, heading: 270, status: 'Safe', riskScore: 5 },
              ]);
              setPrediction(null);
            }}
            className="h-14 w-14 p-0 bg-slate-900 border-slate-800 text-slate-400 rounded-2xl hover:text-white hover:bg-slate-800 transition-all"
          >
            <RefreshCw size={20} />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
              <h3 className="font-black text-white uppercase tracking-widest text-xs">Active Simulation Fleet</h3>
              <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {ships.length} Vessels
              </span>
            </div>
            <div className="divide-y divide-slate-800/50">
              {ships.map((ship, idx) => (
                <motion.div 
                  key={ship.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedShipId(ship.id)}
                  className={`p-6 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden group ${
                    selectedShipId === ship.id ? 'bg-blue-600/10' : 'hover:bg-slate-800/30'
                  }`}
                >
                  {selectedShipId === ship.id && (
                    <motion.div layoutId="active-indicator" className="absolute left-0 top-0 w-1 h-full bg-blue-500" />
                  )}
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-all ${
                      ship.status === 'Suspicious' 
                        ? 'bg-rose-500/20 text-rose-500 shadow-lg shadow-rose-500/10' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Compass size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg">{ship.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{ship.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-10 text-right">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Speed</p>
                      <p className="text-white font-black text-lg font-mono">{ship.speed} <span className="text-xs text-slate-500">kn</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Heading</p>
                      <p className="text-white font-black text-lg font-mono">{ship.heading}°</p>
                    </div>
                    <div className="w-32">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Risk Index</p>
                      <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${ship.riskScore}%` }}
                          className={`h-full rounded-full ${
                            ship.riskScore > 70 ? 'bg-rose-500' : ship.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-3xl p-8 shadow-2xl sticky top-8">
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Shield className="text-blue-500" size={20} />
              </div>
              AI Prediction Core
            </h3>
            
            <AnimatePresence mode="wait">
              {selectedShip ? (
                <motion.div 
                  key={selectedShip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="p-6 bg-slate-950/50 rounded-2xl border border-slate-800/50 shadow-inner">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Target Analysis</p>
                    <p className="text-2xl font-black text-white">{selectedShip.name}</p>
                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <Gauge size={16} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-bold">{selectedShip.speed} kn</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="p-2 bg-slate-800 rounded-lg">
                          <Compass size={16} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-bold">{selectedShip.heading}°</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePredict}
                    disabled={isPredicting}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                  >
                    {isPredicting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing Neural Path...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap size={20} />
                        <span>Run AI Prediction (5m)</span>
                      </div>
                    )}
                  </Button>

                  <AnimatePresence>
                    {prediction && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-8 rounded-3xl border-2 shadow-2xl ${
                          prediction.risk === 'Safe' 
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/5' 
                            : 'bg-rose-500/10 border-rose-500/30 shadow-rose-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-2 rounded-lg ${prediction.risk === 'Safe' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                            {prediction.risk === 'Safe' ? (
                              <ShieldCheck className="text-emerald-500" size={24} />
                            ) : (
                              <AlertCircle className="text-rose-500" size={24} />
                            )}
                          </div>
                          <h4 className={`text-xl font-black ${prediction.risk === 'Safe' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {prediction.risk === 'Safe' ? 'Trajectory Safe' : 'Threat Detected'}
                          </h4>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Future Lat</span>
                            <span className="text-white font-black font-mono">{prediction.future_lat.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Future Lon</span>
                            <span className="text-white font-black font-mono">{prediction.future_lon.toFixed(4)}</span>
                          </div>
                        </div>

                        {prediction.risk !== 'Safe' && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 p-4 bg-rose-500/20 rounded-2xl text-rose-200 text-xs font-bold leading-relaxed border border-rose-500/20"
                          >
                            ⚠️ Vessel trajectory indicates entry into restricted zone in approximately 5 minutes. Interception recommended.
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Compass className="text-slate-600" size={32} />
                  </div>
                  <p className="text-slate-500 text-sm font-bold italic">Select a vessel to initialize AI prediction</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
