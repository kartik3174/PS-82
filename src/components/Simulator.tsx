import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, Compass, Gauge, MapPin, AlertCircle } from 'lucide-react';

interface SimulatorProps {
  ships: any[];
  setShips: React.Dispatch<React.SetStateAction<any[]>>;
  addHistory: (event: any) => void;
  addAlert: (alert: any) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
}

const Simulator: React.FC<SimulatorProps> = ({ ships, setShips, addHistory, addAlert, isSimulating, setIsSimulating }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(ships[0]?.id || null);

  const selectedShip = ships.find(s => s.id === selectedShipId);

  const handlePredict = async () => {
    if (!selectedShip) return;
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
    }
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Mission Simulator</h2>
          <p className="text-slate-400">Control and predict maritime trajectories</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              isSimulating 
                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20'
            }`}
          >
            {isSimulating ? <><Square size={20} /> Stop SIM</> : <><Play size={20} /> Start SIM</>}
          </button>
          <button 
            onClick={() => {
              setShips([
                { id: 'S-101', name: 'Ever Given', lat: 12.5, lon: 80.5, speed: 12, heading: 45, status: 'Safe', riskScore: 10 },
                { id: 'S-102', name: 'Blue Whale', lat: 13.0, lon: 81.0, speed: 8, heading: 180, status: 'Safe', riskScore: 15 },
                { id: 'S-103', name: 'Ocean Nomad', lat: 12.2, lon: 80.2, speed: 4, heading: 90, status: 'Suspicious', riskScore: 75 },
                { id: 'S-104', name: 'Arctic Star', lat: 13.8, lon: 80.8, speed: 15, heading: 270, status: 'Safe', riskScore: 5 },
              ]);
              setPrediction(null);
            }}
            className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white border border-slate-700"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
              <h3 className="font-bold text-white">Active Simulation Fleet</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {ships.map(ship => (
                <div 
                  key={ship.id}
                  onClick={() => setSelectedShipId(ship.id)}
                  className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedShipId === ship.id ? 'bg-blue-600/10 border-l-4 border-blue-600' : 'hover:bg-slate-800/50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${ship.status === 'Suspicious' ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                      <Compass size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{ship.name}</h4>
                      <p className="text-xs text-slate-500 uppercase font-bold">{ship.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-8 text-right">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Speed</p>
                      <p className="text-white font-mono">{ship.speed} kn</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Heading</p>
                      <p className="text-white font-mono">{ship.heading}°</p>
                    </div>
                    <div className="w-24">
                      <p className="text-xs text-slate-500 uppercase font-bold">Risk</p>
                      <div className="mt-1 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${ship.riskScore > 70 ? 'bg-red-500' : ship.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${ship.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="text-blue-500" size={20} />
              AI Prediction Panel
            </h3>
            
            {selectedShip ? (
              <div className="space-y-6">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Selected Vessel</p>
                  <p className="text-white font-bold">{selectedShip.name}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Gauge size={14} />
                      <span className="text-sm">{selectedShip.speed} kn</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Compass size={14} />
                      <span className="text-sm">{selectedShip.heading}°</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePredict}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Run AI Prediction (5m)
                </button>

                {prediction && (
                  <div className={`p-6 rounded-xl border animate-in slide-in-from-bottom-4 duration-300 ${
                    prediction.risk === 'Safe' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-4">
                      {prediction.risk === 'Safe' ? (
                        <ShieldCheck className="text-green-500" size={20} />
                      ) : (
                        <AlertCircle className="text-red-500" size={20} />
                      )}
                      <h4 className={`font-bold ${prediction.risk === 'Safe' ? 'text-green-500' : 'text-red-500'}`}>
                        {prediction.risk === 'Safe' ? 'Trajectory Safe' : 'Threat Detected'}
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Future Lat</span>
                        <span className="text-white font-mono text-sm">{prediction.future_lat}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Future Lon</span>
                        <span className="text-white font-mono text-sm">{prediction.future_lon}</span>
                      </div>
                    </div>

                    {prediction.risk !== 'Safe' && (
                      <div className="mt-4 p-3 bg-red-500/20 rounded-lg text-red-200 text-xs font-medium leading-relaxed">
                        ⚠️ Vessel trajectory indicates entry into restricted zone in approximately 5 minutes. Interception recommended.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm italic">Select a ship to run prediction</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { Shield, ShieldCheck } from 'lucide-react';
export default Simulator;
