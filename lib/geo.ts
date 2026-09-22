// Usine Jefferco Pellets Grand Est — Damblain (88320, Vosges)
export const USINE = {
  name: "Jefferco Pellets Grand Est — Damblain (88)",
  lat: 48.146,
  lon: 5.75,
};

export function distanceKm(lat: number, lon: number): number {
  const R = 6371;
  const dLat = ((lat - USINE.lat) * Math.PI) / 180;
  const dLon = ((lon - USINE.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((USINE.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
