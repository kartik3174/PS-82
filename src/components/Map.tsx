import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Rectangle, CircleMarker, useMapEvents, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { MousePointer2, Square, Trash2, Navigation, Activity, Shield, Zap, ChevronRight, Clock, Target, Info, X, Gauge, Compass, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { analyzeVesselBehavior } from '@/services/aiService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Fix for default marker icons in Leaflet with React
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const createShipIcon = (status: string, heading: number) => {
  const color = status === 'Suspicious' ? '#ef4444' : status === 'Warning' ? '#f59e0b' : '#10b981';
  // Professional maritime vessel shape
  const shipSvg = `
    <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease-out; display: flex; align-items: center; justify-content: center;">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="${color}" stroke="#0f172a" stroke-width="1" style="filter: drop-shadow(0 0 6px ${color}aa);">
        <path d="M12 2L18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8L12 2Z" />
        <rect x="10" y="10" width="4" height="6" fill="#0f172a" opacity="0.3" />
      </svg>
    </div>
  `;
  return L.divIcon({
    className: 'custom-ship-icon',
    html: shipSvg,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createPredictedIcon = () => {
  return L.divIcon({
    className: 'predicted-icon',
    html: `<div style="width: 14px; height: 14px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 15px #3b82f6; animation: pulse 2s infinite;"></div>
           <style>
             @keyframes pulse {
               0% { transform: scale(1); opacity: 1; }
               50% { transform: scale(1.5); opacity: 0.5; }
               100% { transform: scale(1); opacity: 1; }
             }
           </style>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

interface MapProps {
  ships: any[];
  trails?: Record<string, { pos: [number, number], status: string }[]>;
  onAreaSelect?: (bounds: L.LatLngBounds | null) => void;
  selectedArea?: L.LatLngBounds | null;
  setActiveTab?: (tab: string) => void;
}

const RESTRICTED_ZONE: [number, number][] = [
  [12.0, 80.0],
  [13.5, 80.0],
  [13.5, 81.5],
  [12.0, 81.5]
];

const SHIP_COLORS: Record<string, string> = {
  'S-101': '#3b82f6', // Blue
  'S-102': '#a855f7', // Purple
  'S-103': '#f97316', // Orange
  'S-104': '#06b6d4', // Cyan
};

const SmoothMarker: React.FC<{ ship: any, onClick?: () => void, children: React.ReactNode }> = ({ ship, onClick, children }) => {
  const [currentPos, setCurrentPos] = React.useState<[number, number]>([ship.lat, ship.lon]);
  const lastPos = React.useRef<[number, number]>([ship.lat, ship.lon]);
  const targetPos = React.useRef<[number, number]>([ship.lat, ship.lon]);
  const startTime = React.useRef<number>(0);
  const duration = 2000; // Match simulator interval

  const icon = React.useMemo(() => createShipIcon(ship.status, ship.heading), [ship.status, ship.heading]);

  React.useEffect(() => {
    lastPos.current = currentPos;
    targetPos.current = [ship.lat, ship.lon];
    startTime.current = performance.now();
    
    let animationFrame: number;
    const animate = (time: number) => {
      const elapsed = time - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Linear interpolation
      const nextLat = lastPos.current[0] + (targetPos.current[0] - lastPos.current[0]) * progress;
      const nextLon = lastPos.current[1] + (targetPos.current[1] - lastPos.current[1]) * progress;
      
      setCurrentPos([nextLat, nextLon]);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [ship.lat, ship.lon]);

  return (
    <Marker 
      position={currentPos} 
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onClick?.();
        }
      }}
    >
      {children}
    </Marker>
  );
};

// Component to handle map clicks for selection
const SelectionHandler: React.FC<{ 
  isSelecting: boolean, 
  onSelect: (bounds: L.LatLngBounds | null) => void 
}> = ({ isSelecting, onSelect }) => {
  const [startPos, setStartPos] = useState<L.LatLng | null>(null);
  const [tempBounds, setTempBounds] = useState<L.LatLngBounds | null>(null);

  useMapEvents({
    mousedown(e) {
      if (!isSelecting) return;
      setStartPos(e.latlng);
      onSelect(null);
    },
    mousemove(e) {
      if (!isSelecting || !startPos) return;
      const bounds = L.latLngBounds(startPos, e.latlng);
      setTempBounds(bounds);
    },
    mouseup(e) {
      if (!isSelecting || !startPos) return;
      const bounds = L.latLngBounds(startPos, e.latlng);
      onSelect(bounds);
      setStartPos(null);
      setTempBounds(null);
    }
  });

  return tempBounds ? (
    <Rectangle 
      bounds={tempBounds} 
      pathOptions={{ color: '#3b82f6', weight: 1, fillOpacity: 0.1, dashArray: '5, 5' }} 
    />
  ) : null;
};

const MapClickHandler: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  useMapEvents({
    click: () => onClick(),
  });
  return null;
};

const Map: React.FC<MapProps> = ({ ships, trails = {}, onAreaSelect, selectedArea, setActiveTab }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [pendingArea, setPendingArea] = useState<L.LatLngBounds | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedShip = ships.find(s => s.id === selectedShipId);

  const areaShips = pendingArea 
    ? ships.filter(ship => pendingArea.contains([ship.lat, ship.lon]))
    : [];

  const avgSpeed = areaShips.length > 0
    ? (areaShips.reduce((acc, s) => acc + s.speed, 0) / areaShips.length).toFixed(1)
    : 0;

  useEffect(() => {
    if (selectedShipId && selectedShip) {
      const fetchPrediction = async () => {
        try {
          const response = await fetch('/api/ships/predict-future', {
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
      fetchPrediction();
    } else {
      setPrediction(null);
    }
  }, [selectedShipId, selectedShip?.lat, selectedShip?.lon]);

  const handleAnalyze = async () => {
    if (!selectedShip) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeVesselBehavior(selectedShip);
      if (result) {
        toast.success(`AI Analysis Complete for ${selectedShip.name}`, {
          description: result.reasoning
        });
      }
    } catch (error) {
      toast.error("AI Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[15, 80]} 
        zoom={5} 
        className="h-full w-full z-0"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapClickHandler onClick={() => setSelectedShipId(null)} />

        <SelectionHandler isSelecting={isSelecting} onSelect={(bounds) => {
          if (bounds) {
            setPendingArea(bounds);
            setIsSelecting(false);
          }
        }} />

        {selectedArea && (
          <Rectangle 
            bounds={selectedArea} 
            pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.2 }} 
          />
        )}

        <Polygon 
          positions={RESTRICTED_ZONE} 
          pathOptions={{ 
            color: '#ef4444', 
            fillColor: '#ef4444', 
            fillOpacity: 0.15,
            weight: 3,
            dashArray: '10, 15'
          }}
        >
          <LeafletTooltip permanent direction="center" className="bg-transparent border-none shadow-none text-red-500 font-black text-[10px] uppercase tracking-widest">
            RESTRICTED ZONE Alpha-9
          </LeafletTooltip>
        </Polygon>

        {/* Heatmap-like pulsing effect */}
        <CircleMarker 
          center={[12.75, 80.75]} 
          radius={80} 
          pathOptions={{ 
            color: 'transparent', 
            fillColor: '#ef4444', 
            fillOpacity: 0.08 
          }} 
        />
        <CircleMarker 
          center={[12.75, 80.75]} 
          radius={120} 
          pathOptions={{ 
            color: 'transparent', 
            fillColor: '#ef4444', 
            fillOpacity: 0.04 
          }} 
        />

        {/* Render Trails */}
        {(Object.entries(trails) as [string, { pos: [number, number], status: string }[]][]).map(([shipId, entries]) => {
          if (entries.length < 2) return null;
          
          return entries.slice(1).map((entry, idx) => {
            const prevEntry = entries[idx];
            const color = entry.status === 'Suspicious' ? '#ef4444' : entry.status === 'Warning' ? '#f59e0b' : '#10b981';
            
            return (
              <Polyline
                key={`trail-${shipId}-${idx}`}
                positions={[prevEntry.pos, entry.pos]}
                pathOptions={{
                  color: color,
                  weight: 3,
                  opacity: 0.2 + (0.6 * (idx / entries.length)), // Fading effect: older segments are more transparent
                  lineJoin: 'round'
                }}
              />
            );
          });
        })}

        {/* Render Predicted Position */}
        {prediction && selectedShip && (
          <>
            <Marker 
              position={[prediction.future_lat, prediction.future_lon]} 
              icon={createPredictedIcon()}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-bold text-blue-600">Predicted Position</p>
                  <p className="text-xs text-slate-500">Estimated arrival in 1 hour</p>
                  <p className="text-xs font-medium mt-1">Risk: {prediction.risk}</p>
                </div>
              </Popup>
            </Marker>
            <Polyline 
              positions={[[selectedShip.lat, selectedShip.lon], [prediction.future_lat, prediction.future_lon]]}
              pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '10, 10', opacity: 0.5 }}
            />
          </>
        )}

        {ships.map((ship) => (
          <SmoothMarker 
            key={ship.id} 
            ship={ship}
            onClick={() => setSelectedShipId(ship.id)}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[150px]">
                <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">{ship.name}</h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <p><span className="font-medium">ID:</span> {ship.id}</p>
                  <p><span className="font-medium">Speed:</span> {ship.speed} knots</p>
                  <p><span className="font-medium">Heading:</span> {ship.heading}°</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 font-bold ${
                      ship.status === 'Suspicious' ? 'text-red-500' : 
                      ship.status === 'Warning' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {ship.status}
                    </span>
                  </p>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">Risk Score</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          ship.riskScore > 70 ? 'bg-red-500' : 
                          ship.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${ship.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </SmoothMarker>
        ))}
      </MapContainer>
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-20 z-[1000] flex gap-2"
      >
        <button 
          onClick={() => setIsSelecting(!isSelecting)}
          className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-bold text-sm ${
            isSelecting 
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
              : 'bg-slate-900/90 backdrop-blur border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Select Area"
        >
          {isSelecting ? <MousePointer2 size={20} /> : <Square size={20} />}
          {isSelecting ? 'Click & Drag to Select' : 'Select Area'}
        </button>
        {selectedArea && (
          <button 
            onClick={() => onAreaSelect?.(null)}
            className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
            title="Clear Selection"
          >
            <Trash2 size={20} />
          </button>
        )}
      </motion.div>

      {/* Ship Detail Panel */}
      <AnimatePresence>
        {selectedShip && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-6 left-20 z-[1000] mt-16 bg-slate-900/95 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-2xl w-80"
          >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{selectedShip.name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">{selectedShip.id}</p>
            </div>
            <button 
              onClick={() => setSelectedShipId(null)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-blue-500/5 rounded-xl border border-blue-500/20">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-blue-500" />
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">AI Confidence</span>
              </div>
              <span className="text-xs font-black text-blue-500">94.2%</span>
            </div>

            {/* Status & Risk */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  selectedShip.status === 'Suspicious' ? 'bg-red-500 animate-pulse' : 
                  selectedShip.status === 'Warning' ? 'bg-amber-500' : 'bg-green-500'
                }`} />
                <span className="text-sm font-bold text-white uppercase tracking-wider">{selectedShip.status}</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Risk Score</p>
                <p className={`text-sm font-bold ${
                  selectedShip.riskScore > 70 ? 'text-red-500' : 
                  selectedShip.riskScore > 40 ? 'text-amber-500' : 'text-green-500'
                }`}>{selectedShip.riskScore}%</p>
              </div>
            </div>

            {/* Telemetry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Gauge size={14} />
                  <span className="text-[10px] uppercase font-bold">Speed</span>
                </div>
                <p className="text-lg font-bold text-white">{selectedShip.speed} <span className="text-xs font-normal text-slate-500">kn</span></p>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Compass size={14} />
                  <span className="text-[10px] uppercase font-bold">Heading</span>
                </div>
                <p className="text-lg font-bold text-white">{selectedShip.heading}°</p>
              </div>
            </div>

            {/* Trajectory & Prediction */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
                <Target size={14} />
                AI Prediction Engine
              </h4>
              
              {prediction ? (
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">ETA: +1 Hour</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Projected coordinates based on current velocity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${prediction.risk === 'Safe' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      <Shield size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Security Outlook</p>
                      <p className={`text-[10px] mt-0.5 font-medium ${prediction.risk === 'Safe' ? 'text-green-400' : 'text-red-400'}`}>
                        {prediction.risk}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/20 border border-slate-800 rounded-xl flex items-center justify-center gap-3">
                  <RefreshCw size={16} className="text-slate-600 animate-spin" />
                  <span className="text-xs text-slate-500">Calculating trajectory...</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => setActiveTab?.('history')}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                <Activity size={14} />
                History
              </button>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                Analyze
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Area Selection Confirmation Dialog */}
      <Dialog open={!!pendingArea} onOpenChange={(open) => !open && setPendingArea(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Area Selection</DialogTitle>
            <DialogDescription className="text-slate-400">
              You have selected a maritime region. Here are the real-time statistics for this area.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Vessels Detected</p>
              <p className="text-3xl font-bold text-white">{areaShips.length}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Avg Fleet Speed</p>
              <p className="text-3xl font-bold text-white">{avgSpeed} <span className="text-sm font-normal text-slate-500">kn</span></p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setPendingArea(null)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (onAreaSelect) onAreaSelect(pendingArea);
                setPendingArea(null);
              }}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur border border-slate-800 p-4 rounded-xl z-[1000] shadow-2xl"
      >
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#10b981">
                <path d="M12 2L18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8L12 2Z" />
              </svg>
            </div>
            <span className="text-xs text-slate-300">Safe Ship</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#f59e0b">
                <path d="M12 2L18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8L12 2Z" />
              </svg>
            </div>
            <span className="text-xs text-slate-300">Warning / Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#ef4444">
                <path d="M12 2L18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8L12 2Z" />
              </svg>
            </div>
            <span className="text-xs text-slate-300">Suspicious / High Risk</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
            <div className="w-4 h-4 border-2 border-red-500 border-dashed bg-red-500/20" />
            <span className="text-xs text-slate-300">Restricted Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 opacity-60" />
            <span className="text-xs text-slate-300">Vessel Path Trail</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Map;
