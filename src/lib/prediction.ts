/**
 * AI Prediction Module
 * Calculates future position based on current trajectory
 */

export function predictFuture(lat: number, lon: number, speed: number, heading: number) {
  // Time interval: 5 minutes
  const timeMinutes = 5;
  const timeHours = timeMinutes / 60;

  // Distance in nautical miles (assuming speed is in knots)
  // 1 knot = 1 nautical mile per hour
  const distance = speed * timeHours;

  // Convert heading to radians (0 is North, clockwise)
  const headingRad = (heading * Math.PI) / 180;

  // Approximate conversion: 1 degree lat = 60 nautical miles
  // 1 degree lon = 60 * cos(lat) nautical miles
  const deltaLat = (distance * Math.cos(headingRad)) / 60;
  const deltaLon = (distance * Math.sin(headingRad)) / (60 * Math.cos((lat * Math.PI) / 180));

  const future_lat = lat + deltaLat;
  const future_lon = lon + deltaLon;

  return {
    future_lat: parseFloat(future_lat.toFixed(6)),
    future_lon: parseFloat(future_lon.toFixed(6))
  };
}
