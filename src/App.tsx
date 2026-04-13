import { useState, useEffect } from 'react';
import L from 'leaflet';
import { X, MapPin } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import Simulator from './components/Simulator';
import Alerts from './components/Alerts';
import History from './components/History';
import VisionAnalysis from './components/VisionAnalysis';
import CommunityReports from './components/CommunityReports';
import VoiceControl from './components/VoiceControl';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { io } from 'socket.io-client';
import { analyzeVesselBehavior } from './services/aiService';

const socket = io();

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ships, setShips] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [shipTrails, setShipTrails] = useState<Record<string, { pos: [number, number], status: string }[]>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedArea, setSelectedArea] = useState<L.LatLngBounds | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('public');

  const selectedAreaShips = selectedArea 
    ? ships.filter(ship => selectedArea.contains([ship.lat, ship.lon]))
    : [];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            // New user registration
            const newRole = currentUser.email === 'kartiksingh258012@gmail.com' ? 'admin' : 'public';
            await setDoc(doc(db, 'users', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: newRole,
              createdAt: new Date().toISOString()
            });
            setUserRole(newRole);
          }
          toast.success(`Welcome back, ${currentUser.displayName || 'User'}`);
        } catch (error) {
          console.error("Firestore Auth Error:", error);
          toast.error("Failed to sync user profile. Please check permissions.");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Socket.io Real-time updates
  useEffect(() => {
    socket.on('vessel_update', (data) => {
      // In a real app, this would update ship positions from the server
      // For demo, we'll just log it
      console.log('Real-time telemetry received:', data);
    });
    return () => {
      socket.off('vessel_update');
    };
  }, []);

  // Track ship trails
  useEffect(() => {
    setShipTrails(prev => {
      const newTrails = { ...prev };
      ships.forEach(ship => {
        const currentTrail = newTrails[ship.id] || [];
        const lastPosEntry = currentTrail[currentTrail.length - 1];
        
        if (!lastPosEntry || lastPosEntry.pos[0] !== ship.lat || lastPosEntry.pos[1] !== ship.lon) {
          const updatedTrail = [...currentTrail, { pos: [ship.lat, ship.lon] as [number, number], status: ship.status }];
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
          const speedFactor = 0.001;
          const headingRad = (ship.heading * Math.PI) / 180;
          
          let newLat = ship.lat + (ship.speed * speedFactor * Math.cos(headingRad));
          let newLon = ship.lon + (ship.speed * speedFactor * Math.sin(headingRad));

          const WATER_ZONES = [
            { lat: [5, 22], lon: [60, 72] },
            { lat: [5, 20], lon: [82, 95] },
            { lat: [-5, 5], lon: [60, 95] }
          ];

          const isInWater = WATER_ZONES.some(zone => 
            newLat >= zone.lat[0] && newLat <= zone.lat[1] &&
            newLon >= zone.lon[0] && newLon <= zone.lon[1]
          );

          let newHeading = ship.heading;
          if (!isInWater) {
            newHeading = (ship.heading + 180) % 360;
            const newHeadingRad = (newHeading * Math.PI) / 180;
            newLat = ship.lat + (ship.speed * speedFactor * Math.cos(newHeadingRad));
            newLon = ship.lon + (ship.speed * speedFactor * Math.sin(newHeadingRad));
          }

          return { ...ship, lat: newLat, lon: newLon, heading: newHeading };
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // AI Analysis Effect
  useEffect(() => {
    if (!isSimulating || ships.length === 0) return;

    const runAIAnalysis = async () => {
      const suspiciousShips = ships.filter(s => s.speed < 3 || s.riskScore > 50);
      if (suspiciousShips.length === 0) return;

      // Analyze the most suspicious ship to save API quota
      const targetShip = suspiciousShips[0];
      const analysis = await analyzeVesselBehavior(targetShip);
      
      if (analysis) {
        setShips(prev => prev.map(s => s.id === targetShip.id ? { ...s, ...analysis } : s));
        if (analysis.status === 'Suspicious') {
          addAlert({
            id: Date.now(),
            shipName: targetShip.name,
            type: 'AI: Suspicious Behavior',
            severity: 'HIGH',
            timestamp: new Date().toLocaleTimeString(),
            reasoning: analysis.reasoning
          });
        }
      }
    };

    const interval = setInterval(runAIAnalysis, 15000); // AI check every 15s
    return () => clearInterval(interval);
  }, [isSimulating, ships.length]);

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

  const addHistory = (event: any) => {
    setHistory(prev => [event, ...prev]);
  };

  const addAlert = (alert: any) => {
    setAlerts(prev => [alert, ...prev]);
    toast.warning(`Security Alert: ${alert.shipName} - ${alert.type}`, {
      description: alert.reasoning || alert.message
    });
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('map')) setActiveTab('map');
    else if (command.includes('dashboard')) setActiveTab('dashboard');
    else if (command.includes('alert')) setActiveTab('alerts');
    else if (command.includes('vision')) setActiveTab('vision');
    else if (command.includes('report')) setActiveTab('reports');
    else if (command.includes('simulate')) setIsSimulating(true);
    else if (command.includes('stop')) setIsSimulating(false);
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
            setActiveTab={setActiveTab}
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
              </div>
            </div>
          )}
        </div>
      );
      case 'simulator': return <Simulator ships={ships} setShips={setShips} addHistory={addHistory} addAlert={addAlert} isSimulating={isSimulating} setIsSimulating={setIsSimulating} />;
      case 'alerts': return <Alerts alerts={alerts} />;
      case 'history': return <History history={history} />;
      case 'vision': return <VisionAnalysis />;
      case 'reports': return <CommunityReports />;
      default: return <Dashboard ships={ships} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} userRole={userRole} />
      <main className="flex-1 overflow-y-auto relative">
        {renderContent()}
      </main>
      <VoiceControl onCommand={handleVoiceCommand} />
      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}
