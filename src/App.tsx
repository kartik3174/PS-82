import { useState, useEffect, Suspense, lazy } from 'react';
import L from 'leaflet';
import { X, MapPin, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
const Map = lazy(() => import('@/components/Map'));
const Simulator = lazy(() => import('@/components/Simulator'));
const Alerts = lazy(() => import('@/components/Alerts'));
const History = lazy(() => import('@/components/History'));
const VisionAnalysis = lazy(() => import('@/components/VisionAnalysis'));
const CommunityReports = lazy(() => import('@/components/CommunityReports'));
import VoiceControl from '@/components/VoiceControl';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { io } from 'socket.io-client';
import { analyzeVesselBehavior } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const socket = io();

// Error Boundary Fallback
const ErrorFallback = ({ error, reset }: { error: Error, reset: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 bg-slate-950">
    <div className="p-4 bg-red-500/10 rounded-full">
      <AlertCircle className="w-12 h-12 text-red-500" />
    </div>
    <h2 className="text-2xl font-bold text-white">System Error</h2>
    <p className="text-slate-400 max-w-md">{error.message || "An unexpected error occurred in the SeaGuard AI core."}</p>
    <Button onClick={reset} variant="outline" className="gap-2">
      <RefreshCw size={18} />
      Restart System
    </Button>
  </div>
);

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-4 bg-slate-950">
    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
    <p className="text-slate-400 font-medium animate-pulse">Initializing SeaGuard AI...</p>
  </div>
);

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
        } catch (err) {
          console.error("Firestore Auth Error:", err);
          toast.error("Failed to sync user profile. Operating in guest mode.");
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Socket.io Real-time updates
  useEffect(() => {
    socket.on('vessel_update', (data) => {
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
      try {
        const suspiciousShips = ships.filter(s => s.speed < 3 || s.riskScore > 50);
        if (suspiciousShips.length === 0) return;

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
      } catch (err) {
        console.error("AI Analysis Error:", err);
      }
    };

    const interval = setInterval(runAIAnalysis, 15000);
    return () => clearInterval(interval);
  }, [isSimulating, ships.length]);

  // Initial Data Fetch with Mock Fallback
  useEffect(() => {
    const fetchShips = async () => {
      try {
        const response = await fetch('/api/ships');
        if (!response.ok) throw new Error("API Unavailable");
        const data = await response.json();
        setShips(data);
      } catch (err) {
        console.warn("API failed, using mock data fallback");
        const mockShips = [
          { id: 'S-101', name: 'Ocean Voyager', type: 'Cargo', lat: 18.5, lon: 72.5, speed: 12, heading: 45, status: 'Safe', riskScore: 10 },
          { id: 'S-102', name: 'Sea Breeze', type: 'Tanker', lat: 15.2, lon: 68.1, speed: 8, heading: 120, status: 'Warning', riskScore: 45 },
          { id: 'S-103', name: 'Midnight Star', type: 'Fishing', lat: 12.8, lon: 70.4, speed: 2, heading: 270, status: 'Suspicious', riskScore: 85 },
          { id: 'S-104', name: 'Blue Horizon', type: 'Cargo', lat: 10.5, lon: 75.2, speed: 15, heading: 10, status: 'Safe', riskScore: 5 },
        ];
        setShips(mockShips);
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
    const cmd = command.toLowerCase();
    if (cmd.includes('map')) setActiveTab('map');
    else if (cmd.includes('dashboard')) setActiveTab('dashboard');
    else if (cmd.includes('alert')) setActiveTab('alerts');
    else if (cmd.includes('vision')) setActiveTab('vision');
    else if (cmd.includes('report')) setActiveTab('reports');
    else if (cmd.includes('simulate')) setIsSimulating(true);
    else if (cmd.includes('stop')) setIsSimulating(false);
  };

  const renderContent = () => {
    if (error) return <ErrorFallback error={error} reset={() => setError(null)} />;

    return (
      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {(() => {
              switch (activeTab) {
                case 'dashboard': return <Dashboard ships={ships} alerts={alerts} />;
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
                      <motion.div 
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-6 right-6 z-[1000] bg-slate-900/95 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-2xl w-80"
                      >
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
                      </motion.div>
                    )}
                  </div>
                );
                case 'simulator': return <Simulator ships={ships} setShips={setShips} addHistory={addHistory} addAlert={addAlert} isSimulating={isSimulating} setIsSimulating={setIsSimulating} />;
                case 'alerts': return <Alerts alerts={alerts} />;
                case 'history': return <History history={history} />;
                case 'vision': return <VisionAnalysis />;
                case 'reports': return <CommunityReports />;
                default: return <Dashboard ships={ships} alerts={alerts} />;
              }
            })()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    );
  };

  if (isLoading) return <LoadingScreen />;

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
