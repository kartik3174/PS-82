import { Request, Response } from 'express';
import logger from '../config/logger';

// Mock data for now, will be replaced by Firestore in production
let ships = [
  { id: 'S-101', name: 'Ever Given', lat: 12.5, lon: 80.5, speed: 12, heading: 45, status: 'Safe', riskScore: 10 },
  { id: 'S-102', name: 'Blue Whale', lat: 15.2, lon: 85.1, speed: 8, heading: 120, status: 'Warning', riskScore: 45 },
  { id: 'S-103', name: 'Sea Voyager', lat: 14.8, lon: 82.3, speed: 15, heading: 210, status: 'Safe', riskScore: 15 },
  { id: 'S-104', name: 'Oceanic Express', lat: 13.1, lon: 81.2, speed: 18, heading: 30, status: 'Suspicious', riskScore: 82 },
  { id: 'S-105', name: 'Pacific Star', lat: 16.5, lon: 84.7, speed: 10, heading: 180, status: 'Safe', riskScore: 5 },
  { id: 'S-106', name: 'Arctic Tern', lat: 11.2, lon: 79.8, speed: 14, heading: 90, status: 'Safe', riskScore: 12 },
  { id: 'S-107', name: 'Marlin Quest', lat: 17.4, lon: 86.2, speed: 22, heading: 315, status: 'Warning', riskScore: 55 },
  { id: 'S-108', name: 'Coral Queen', lat: 15.8, lon: 81.5, speed: 5, heading: 15, status: 'Safe', riskScore: 20 },
  { id: 'S-109', name: 'Deep Sea Explorer', lat: 13.9, lon: 83.4, speed: 3, heading: 270, status: 'Warning', riskScore: 48 },
  { id: 'S-110', name: 'Golden Horizon', lat: 12.1, lon: 85.9, speed: 11, heading: 60, status: 'Safe', riskScore: 8 },
  { id: 'S-111', name: 'Silver Wave', lat: 14.2, lon: 80.1, speed: 16, heading: 135, status: 'Safe', riskScore: 14 },
  { id: 'S-112', name: 'Emerald Isle', lat: 16.9, lon: 82.8, speed: 9, heading: 225, status: 'Safe', riskScore: 11 },
  { id: 'S-113', name: 'Ruby Runner', lat: 11.5, lon: 84.2, speed: 19, heading: 350, status: 'Suspicious', riskScore: 75 },
  { id: 'S-114', name: 'Sapphire Spirit', lat: 15.5, lon: 86.8, speed: 13, heading: 105, status: 'Safe', riskScore: 9 },
  { id: 'S-115', name: 'Diamond Drifter', lat: 13.4, lon: 79.2, speed: 7, heading: 255, status: 'Warning', riskScore: 42 },
  { id: 'S-116', name: 'Pearl Pilot', lat: 17.8, lon: 84.1, speed: 20, heading: 40, status: 'Safe', riskScore: 18 },
  { id: 'S-117', name: 'Amber Anchor', lat: 12.8, lon: 81.9, speed: 4, heading: 195, status: 'Safe', riskScore: 25 },
  { id: 'S-118', name: 'Crystal Cruiser', lat: 14.5, lon: 85.5, speed: 17, heading: 85, status: 'Safe', riskScore: 13 },
  { id: 'S-119', name: 'Jade Jumper', lat: 16.2, lon: 80.7, speed: 21, heading: 330, status: 'Suspicious', riskScore: 88 },
  { id: 'S-120', name: 'Opal Observer', lat: 11.9, lon: 83.1, speed: 6, heading: 150, status: 'Safe', riskScore: 22 },
  { id: 'S-121', name: 'Topaz Tracker', lat: 15.1, lon: 82.5, speed: 12, heading: 20, status: 'Safe', riskScore: 10 },
  { id: 'S-122', name: 'Quartz Quest', lat: 13.7, lon: 86.1, speed: 15, heading: 285, status: 'Safe', riskScore: 16 },
  { id: 'S-123', name: 'Beryl Boat', lat: 17.1, lon: 79.5, speed: 8, heading: 170, status: 'Warning', riskScore: 52 },
  { id: 'S-124', name: 'Zircon Zephyr', lat: 12.3, lon: 84.8, speed: 14, heading: 55, status: 'Safe', riskScore: 7 },
  { id: 'S-125', name: 'Garnet Guard', lat: 14.9, lon: 81.6, speed: 18, heading: 240, status: 'Safe', riskScore: 19 },
];

export const getShips = async (req: Request, res: Response) => {
  try {
    res.json(ships);
  } catch (error) {
    logger.error('Error fetching ships:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const analyzeShip = async (req: Request, res: Response) => {
  const { ship } = req.body;
  // Basic analysis logic (will be enhanced with AI in frontend)
  let status = 'Safe';
  let riskScore = 0;
  
  if (ship.speed < 2) riskScore += 30;
  if (riskScore > 20) status = 'Warning';

  res.json({ status, riskScore, alerts: [] });
};

export const predictFuture = async (req: Request, res: Response) => {
  const { lat, lon, speed, heading } = req.body;
  
  // Simple linear prediction for demo
  const headingRad = (heading * Math.PI) / 180;
  const future_lat = lat + (speed * 0.1 * Math.cos(headingRad));
  const future_lon = lon + (speed * 0.1 * Math.sin(headingRad));
  
  res.json({
    future_lat,
    future_lon,
    risk: speed > 15 ? 'Warning' : 'Safe'
  });
};
