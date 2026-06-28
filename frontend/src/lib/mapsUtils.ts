/** Pusat peta default (Cilegon) — selaras dengan AddressMapPicker */
export const DEFAULT_MAP_CENTER = { lat: -6.0027, lng: 106.0116 };

export function googleMapsPinUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function osmEmbedUrl(lat: number, lng: number, zoom = 16): string {
  const delta = 0.008;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function parseCoord(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function resolveMapCoords(input: {
  shipLat?: unknown;
  shipLng?: unknown;
  alamatLat?: unknown;
  alamatLng?: unknown;
  isPickup?: boolean;
}): { lat: number; lng: number } | null {
  if (input.isPickup) return DEFAULT_MAP_CENTER;

  const shipLat = parseCoord(input.shipLat);
  const shipLng = parseCoord(input.shipLng);
  if (shipLat != null && shipLng != null) return { lat: shipLat, lng: shipLng };

  const alamatLat = parseCoord(input.alamatLat);
  const alamatLng = parseCoord(input.alamatLng);
  if (alamatLat != null && alamatLng != null) return { lat: alamatLat, lng: alamatLng };

  return null;
}
