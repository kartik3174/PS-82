import { useState, useEffect } from 'react';
import L from 'leaflet';
import { X, MapPin } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import Simulator from './components/Simulator';
import Alerts from './components/Alerts';
import History from './components/History';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ships, setShips] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [shipTrails, setShipTrails] = useState<Record<string, { pos: [number, number], status: string }[]>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedArea, setSelectedArea] = useState<L.LatLngBounds | null>(null);

  const selectedAreaShips = selectedArea 
    ? ships.filter(ship => selectedArea.contains([ship.lat, ship.lon]))
    : [];

  // Track ship trails
  useEffect(() => {
    setShipTrails(prev => {
      const newTrails = { ...prev };
      ships.forEach(ship => {
        const currentTrail = newTrails[ship.id] || [];
        const lastPosEntry = currentTrail[currentTrail.length - 1];
        
        // Only add if position changed significantly to avoid duplicates
        if (!lastPosEntry || lastPosEntry.pos[0] !== ship.lat || lastPosEntry.pos[1] !== ship.lon) {
          const updatedTrail = [...currentTrail, { pos: [ship.lat, ship.lon] as [number, number], status: ship.status }];
          // Keep only last 10 positions as requested
          newTrails[ship.id] = updatedTrail.slice(-10);
        }
      });
      return newTrails;
    });
  }, [ships]);

  // Global Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setShips(prevShips => prevShips.map(ship => {
          // Update position based on speed and heading
          const speedFactor = 0.001; // Scale for simulation speed
          const headingRad = (ship.heading * Math.PI) / 180;
          
          let newLat = ship.lat + (ship.speed * speedFactor * Math.cos(headingRad));
          let newLon = ship.lon + (ship.speed * speedFactor * Math.sin(headingRad));

          // Water Boundary Check (Keep ships in water)
          const WATER_ZONES = [
            { lat: [5, 22], lon: [60, 72] },  // Arabian Sea
            { lat: [5, 20], lon: [82, 95] },  // Bay of Bengal
            { lat: [-5, 5], lon: [60, 95] }   // Central Indian Ocean
          ];

          const isInWater = WATER_ZONES.some(zone => 
            newLat >= zone.lat[0] && newLat <= zone.lat[1] &&
            newLon >= zone.lon[0] && newLon <= zone.lon[1]
          );

          let newHeading = ship.heading;
          if (!isInWater) {
            // Turn around if hitting land/boundary
            newHeading = (ship.heading + 180) % 360;
            // Recalculate position with new heading to avoid getting stuck
            const newHeadingRad = (newHeading * Math.PI) / 180;
            newLat = ship.lat + (ship.speed * speedFactor * Math.cos(newHeadingRad));
            newLon = ship.lon + (ship.speed * speedFactor * Math.sin(newHeadingRad));
          }

          // Random events
          let newSpeed = ship.speed;
          let newStatus = ship.status;
          let newRiskScore = ship.riskScore;

          const random = Math.random();
          if (random < 0.05) { // 5% chance of event
            const eventType = Math.floor(Math.random() * 3);
            if (eventType === 0) { // Sudden stop
              newSpeed = 2;
              addAlert({ id: Date.now(), shipName: ship.name, type: 'Suspicious Stop', severity: 'MEDIUM', timestamp: new Date().toLocaleTimeString() });
              addHistory({ shipName: ship.name, action: 'Sudden deceleration', type: 'Movement', timestamp: new Date().toLocaleTimeString(), status: 'Warning' });
            } else if (eventType === 1) { // Route deviation
              newHeading = (ship.heading + 45) % 360;
              addHistory({ shipName: ship.name, action: 'Course deviation', type: 'Navigation', timestamp: new Date().toLocaleTimeString(), status: 'Safe' });
            }
          }

          return { ...ship, lat: newLat, lon: newLon, speed: newSpeed, heading: newHeading, status: newStatus, riskScore: newRiskScore };
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const response = await fetch('/api/ships');
        const data = await response.json();
        setShips(data);
      } catch (error) {
        console.error("Failed to fetch ships", error);
      }
    };
    fetchShips();
  }, []);

  // Real-time analysis during simulation
  useEffect(() => {
    if (!isSimulating) return;

    const analyzeShips = async () => {
      try {
        const updatedShips = await Promise.all(ships.map(async (ship) => {
          try {
            const response = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ship })
            });
            const data = await response.json();
            
            // Handle alerts
            if (data.alerts && data.alerts.length > 0) {
              data.alerts.forEach((a: any) => {
                const alertExists = alerts.some(existing => 
                  existing.type === a.type && 
                  existing.shipName === ship.name && 
                  (Date.now() - new Date(existing.timestamp).getTime()) < 10000
                );
                if (!alertExists) {
                  setAlerts(prev => [{ ...a, id: Date.now() + Math.random(), shipName: ship.name }, ...prev]);
                }
              });
            }

            return { ...ship, status: data.status, riskScore: data.riskScore };
          } catch (error) {
            return ship;
          }
        }));
        
        // Check if anything actually changed before updating state
        const hasChanged = updatedShips.some((ship, i) => 
          ship.status !== ships[i]?.status || ship.riskScore !== ships[i]?.riskScore
        );

        if (hasChanged) {
          setShips(updatedShips);
        }
      } catch (error) {
        console.error("Analysis failed", error);
      }
    };

    const interval = setInterval(analyzeShips, 5000); // Analyze every 5 seconds
    return () => clearInterval(interval);
  }, [isSimulating, ships.length, alerts.length]); // Only re-run if simulation state or counts change

  const addHistory = (event: any) => {
    setHistory(prev => [event, ...prev]);
  };

  const addAlert = (alert: any) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard ships={ships} />;
      case 'map': return (
        <div className="h-full relative">
          <Map 
            ships={ships} 
            trails={shipTrails} 
            onAreaSelect={setSelectedArea}
            selectedArea={selectedArea}
          />
          {selectedArea && (
            <div className="absolute top-6 right-6 z-[1000] bg-slate-900/95 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-2xl w-80 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-blue-500" />
                  Selected Area Data
                </h3>
                <button 
                  onClick={() => setSelectedArea(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ships in Area</p>
                    <p className="text-xl font-bold text-white">{selectedAreaShips.length}</p>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Avg Speed</p>
                    <p className="text-xl font-bold text-white">
                      {selectedAreaShips.length > 0 
                        ? (selectedAreaShips.reduce((acc, s) => acc + s.speed, 0) / selectedAreaShips.length).toFixed(1)
                        : 0} kn
                    </p>
                  </div>
                </div>

                {selectedAreaShips.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {selectedAreaShips.map(ship => (
                      <div key={ship.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <span className="text-sm font-medium text-slate-300">{ship.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ship.status === 'Suspicious' ? 'bg-red-500/20 text-red-400' : 
                          ship.status === 'Warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {ship.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
      case 'simulator': return <Simulator ships={ships} setShips={setShips} addHistory={addHistory} addAlert={addAlert} isSimulating={isSimulating} setIsSimulating={setIsSimulating} />;
      case 'alerts': return <Alerts alerts={alerts} />;
      case 'history': return <History history={history} />;
      default: return <Dashboard ships={ships} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto relative">
        {renderContent()}
      </main>
    </div>
  );
}
