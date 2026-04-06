import { useState, useEffect } from 'react';
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
  const [shipTrails, setShipTrails] = useState<Record<string, [number, number][]>>({});

  // Track ship trails
  useEffect(() => {
    setShipTrails(prev => {
      const newTrails = { ...prev };
      ships.forEach(ship => {
        const currentTrail = newTrails[ship.id] || [];
        const lastPos = currentTrail[currentTrail.length - 1];
        
        // Only add if position changed significantly to avoid duplicates
        if (!lastPos || lastPos[0] !== ship.lat || lastPos[1] !== ship.lon) {
          const updatedTrail = [...currentTrail, [ship.lat, ship.lon] as [number, number]];
          // Keep only last 50 positions
          newTrails[ship.id] = updatedTrail.slice(-50);
        }
      });
      return newTrails;
    });
  }, [ships]);

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
    const analyzeShips = async () => {
      const updatedShips = await Promise.all(ships.map(async (ship) => {
        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ship })
          });
          const data = await response.json();
          
          // If new alerts detected, add them
          if (data.alerts.length > 0) {
            data.alerts.forEach((a: any) => {
              const alertExists = alerts.some(existing => 
                existing.type === a.type && 
                existing.shipName === ship.name && 
                new Date(existing.timestamp).getTime() > Date.now() - 5000
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
      
      // Only update if status/risk actually changed to avoid infinite loop
      const hasChanged = JSON.stringify(updatedShips) !== JSON.stringify(ships);
      if (hasChanged) {
        setShips(updatedShips);
      }
    };

    const interval = setInterval(analyzeShips, 3000);
    return () => clearInterval(interval);
  }, [ships, alerts]);

  const addHistory = (event: any) => {
    setHistory(prev => [event, ...prev]);
  };

  const addAlert = (alert: any) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard ships={ships} />;
      case 'map': return <div className="h-full"><Map ships={ships} trails={shipTrails} /></div>;
      case 'simulator': return <Simulator ships={ships} setShips={setShips} addHistory={addHistory} addAlert={addAlert} />;
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
