import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const createShipIcon = (status: string) => {
  const color = status === 'Suspicious' ? '#ef4444' : status === 'Warning' ? '#f59e0b' : '#10b981';
  return L.divIcon({
    className: 'custom-ship-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

interface MapProps {
  ships: any[];
  trails?: Record<string, [number, number][]>;
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

const Map: React.FC<MapProps> = ({ ships, trails = {} }) => {
  return (
    <div className="h-full w-full relative">
      <MapContainer 
        center={[12.75, 80.75]} 
        zoom={8} 
        className="h-full w-full z-0"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <Polygon 
          positions={RESTRICTED_ZONE} 
          pathOptions={{ 
            color: '#ef4444', 
            fillColor: '#ef4444', 
            fillOpacity: 0.2,
            weight: 2,
            dashArray: '5, 10'
          }}
        >
          <LeafletTooltip permanent direction="center" className="bg-transparent border-none shadow-none text-red-500 font-bold text-xs uppercase">
            Restricted Zone – Coast Guard Area
          </LeafletTooltip>
        </Polygon>

        {/* Render Trails */}
        {(Object.entries(trails) as [string, [number, number][]][]).map(([shipId, positions]) => {
          if (positions.length < 2) return null;
          return (
            <Polyline
              key={`trail-${shipId}`}
              positions={positions}
              pathOptions={{
                color: SHIP_COLORS[shipId] || '#94a3b8',
                weight: 3,
                opacity: 0.6,
                lineJoin: 'round'
              }}
            />
          );
        })}

        {ships.map((ship) => (
          <Marker 
            key={ship.id} 
            position={[ship.lat, ship.lon]} 
            icon={createShipIcon(ship.status)}
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
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur border border-slate-800 p-4 rounded-xl z-[1000] shadow-2xl">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-300">Safe Ship</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-300">Warning / Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
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
      </div>
    </div>
  );
};

export default Map;
