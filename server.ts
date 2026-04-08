import express from 'express';
import cors from 'cors';
import { predictFuture } from './src/lib/prediction';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock Ship Data - Generating ships only in water zones (Arabian Sea, Bay of Bengal, Indian Ocean)
const shipNames = ['Ever Given', 'Blue Whale', 'Ocean Nomad', 'Arctic Star', 'Sea Spirit', 'Marine Voyager', 'Pacific Queen', 'Atlantic King', 'Global Trader', 'Wave Runner', 'Deep Sea', 'Horizon', 'Starlight', 'Poseidon', 'Neptune', 'Titan', 'Explorer', 'Navigator', 'Discovery', 'Endeavour'];

const WATER_ZONES = [
  { lat: [5, 22], lon: [60, 72] },  // Arabian Sea
  { lat: [5, 20], lon: [82, 95] },  // Bay of Bengal
  { lat: [-5, 5], lon: [60, 95] }   // Central Indian Ocean
];

let ships = shipNames.map((name, i) => {
  const zone = WATER_ZONES[i % WATER_ZONES.length];
  return {
    id: `S-${100 + i}`,
    name: name,
    lat: zone.lat[0] + Math.random() * (zone.lat[1] - zone.lat[0]),
    lon: zone.lon[0] + Math.random() * (zone.lon[1] - zone.lon[0]),
    speed: 5 + Math.random() * 15,
    heading: Math.floor(Math.random() * 360),
    status: 'Safe',
    riskScore: Math.floor(Math.random() * 30)
  };
});

const RESTRICTED_ZONE = [
  [12.0, 80.0],
  [13.5, 80.0],
  [13.5, 81.5],
  [12.0, 81.5]
];

function isInside(point: [number, number], polygon: number[][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

app.get('/api/ships', (req, res) => {
  res.json(ships);
});

app.post('/api/analyze', (req, res) => {
  const { ship } = req.body;
  let alerts = [];
  let status = 'Safe';
  let riskScore = 0;

  // Speed check
  if (ship.speed < 5) {
    alerts.push({ type: 'Suspicious Stop', severity: 'MEDIUM', timestamp: new Date().toISOString() });
    riskScore += 30;
  }

  // Zone check
  if (isInside([ship.lat, ship.lon], RESTRICTED_ZONE)) {
    alerts.push({ type: 'Unauthorized Entry', severity: 'CRITICAL', timestamp: new Date().toISOString() });
    status = 'Suspicious';
    riskScore += 60;
  }

  if (riskScore > 70) status = 'Suspicious';
  else if (riskScore > 40) status = 'Warning';

  res.json({ alerts, status, riskScore });
});

app.post('/api/predict-future', (req, res) => {
  const { lat, lon, speed, heading } = req.body;
  const prediction = predictFuture(lat, lon, speed, heading);
  
  const willEnterRestricted = isInside([prediction.future_lat, prediction.future_lon], RESTRICTED_ZONE);
  
  res.json({
    ...prediction,
    risk: willEnterRestricted ? "Will Enter Restricted Zone" : "Safe"
  });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const path = await import('path');
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
