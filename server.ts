import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import logger from './server/config/logger';
import apiRoutes from './server/routes';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// API Routes
app.use('/api', apiRoutes);

// Socket.io for Real-time telemetry
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Mock telemetry broadcast
setInterval(() => {
  io.emit('vessel_update', {
    timestamp: new Date(),
    // In a real app, this would be live data from a stream or DB
  });
}, 5000);

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`SeaGuard Server running on http://localhost:${PORT}`);
});
