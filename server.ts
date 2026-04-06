import express from 'express';
import cors from 'cors';
import { predictFuture } from './src/lib/prediction';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock Ship Data
let ships = [
  { id: 'S-101', name: 'Ever Given', lat: 12.5, lon: 80.5, speed: 12, heading: 45, status: 'Safe', riskScore: 10 },
  { id: 'S-102', name: 'Blue Whale', lat: 13.0, lon: 81.0, speed: 8, heading: 180, status: 'Safe', riskScore: 15 },
  { id: 'S-103', name: 'Ocean Nomad', lat: 12.2, lon: 80.2, speed: 4, heading: 90, status: 'Suspicious', riskScore: 75 },
  { id: 'S-104', name: 'Arctic Star', lat: 13.8, lon: 80.8, speed: 15, heading: 270, status: 'Safe', riskScore: 5 },
];

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
