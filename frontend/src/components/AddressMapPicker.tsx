"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { parseOsmAddress } from "@/lib/parseOsmAddress";

const DEFAULT_CENTER = { lat: -6.0027, lng: 106.0116 };

export type AddressFromMap = {
  lat: number;
  lng: number;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kode_pos: string;
  detail_alamat: string;
};

type SearchResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
};

type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;
type LeafletNS = typeof import("leaflet");

interface AddressMapPickerProps {
  onPick: (address: AddressFromMap) => void;
}

export default function AddressMapPicker({ onPick }: AddressMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<LeafletNS | null>(null);
  const aliveRef = useRef(true);
  const onPickRef = useRef(onPick);
  const setPinRef = useRef<(lat: number, lng: number, skipReverse?: boolean) => void>(() => {});

  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState("");
  const [pinned, setPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  const applyAddress = useCallback(
    (lat: number, lng: number, address: Record<string, string>, displayName?: string) => {
      const parsed = parseOsmAddress(address, displayName);
      onPickRef.current({
        lat,
        lng,
        provinsi: parsed.provinsi,
        kota: parsed.kota,
        kecamatan: parsed.kecamatan,
        kode_pos: parsed.kode_pos,
        detail_alamat: parsed.detail_alamat,
      });
      setPinned(true);
    },
    []
  );

  const reverseGeocodeRef = useRef<(lat: number, lng: number) => Promise<void>>(async () => {});

  reverseGeocodeRef.current = async (lat: number, lng: number) => {
    setGeocoding(true);
    setError("");
    try {
      const res = await fetch(
        `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membaca lokasi");
      if (!aliveRef.current) return;
      if (!data.address && !data.display_name) {
        throw new Error("Lokasi tidak dikenali. Coba geser pin sedikit atau isi manual.");
      }
      applyAddress(lat, lng, data.address || {}, data.display_name);
    } catch (err: unknown) {
      if (!aliveRef.current) return;
      setError(err instanceof Error ? err.message : "Gagal membaca lokasi");
    } finally {
      if (aliveRef.current) setGeocoding(false);
    }
  };

  const focusMapOn = (map: LeafletMap, lat: number, lng: number) => {
    map.whenReady(() => {
      if (!aliveRef.current || mapInstanceRef.current !== map) return;
      try {
        map.invalidateSize();
        map.panTo([lat, lng], { animate: false });
        if (map.getZoom() < 16) map.setZoom(16);
      } catch {
        /* map sudah di-unmount */
      }
    });
  };

  setPinRef.current = (lat: number, lng: number, skipReverse = false) => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L || !aliveRef.current) return;

    map.whenReady(() => {
      if (!aliveRef.current || mapInstanceRef.current !== map) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          void reverseGeocodeRef.current(pos.lat, pos.lng);
        });
        markerRef.current = marker;
      }

      focusMapOn(map, lat, lng);
      if (!skipReverse) void reverseGeocodeRef.current(lat, lng);
    });
  };

  useEffect(() => {
    aliveRef.current = true;
    let map: LeafletMap | null = null;

    (async () => {
      if (!mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      leafletRef.current = L;

      if (!aliveRef.current || !mapRef.current) return;
      if (mapRef.current.dataset.leafletInit === "1") return;
      mapRef.current.dataset.leafletInit = "1";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(mapRef.current).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e) => {
        setPinRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;

      map.whenReady(() => {
        if (!aliveRef.current || mapInstanceRef.current !== map || !map) return;
        map.invalidateSize();
        setLoading(false);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!aliveRef.current || mapInstanceRef.current !== map || !map) return;
            map.panTo([pos.coords.latitude, pos.coords.longitude], { animate: false });
          },
          () => undefined,
          { enableHighAccuracy: false, timeout: 8000 }
        );
      }
    })().catch(() => {
      if (aliveRef.current) {
        setError("Gagal memuat peta");
        setLoading(false);
      }
    });

    return () => {
      aliveRef.current = false;
      markerRef.current = null;
      if (map) {
        map.off();
        map.remove();
      }
      mapInstanceRef.current = null;
      leafletRef.current = null;
      if (mapRef.current) {
        mapRef.current.dataset.leafletInit = "";
        mapRef.current.replaceChildren();
      }
    };
  }, []);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (q.length < 3) return;

    setSearching(true);
    setError("");
    setSearchResults([]);

    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pencarian gagal");
      setSearchResults(data.results || []);
      if (!data.results?.length) {
        setError("Alamat tidak ditemukan. Coba kata kunci lain.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pencarian gagal");
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setPinRef.current(lat, lng, true);
    if (item.address) {
      applyAddress(lat, lng, item.address, item.display_name);
    } else {
      void reverseGeocodeRef.current(lat, lng);
    }
    setSearchResults([]);
    setSearchQuery(item.display_name.split(",").slice(0, 2).join(","));
  };

  return (
    <div className="address-map-picker space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="font-bold text-secondary uppercase tracking-wider text-[10px]">
          Pin Lokasi di Peta
        </label>
        {pinned && !geocoding && (
          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
            Lokasi dipilih
          </span>
        )}
        {geocoding && (
          <span className="text-[10px] font-bold text-primary bg-primary-container px-2 py-0.5 rounded border border-primary/20 flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" />
            Mengisi alamat...
          </span>
        )}
      </div>

      <div className="relative flex">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSearch();
            }
          }}
          placeholder="Cari alamat (contoh: Jl. Sudirman Jakarta)..."
          className="w-full pl-9 pr-20 py-2.5 border border-surface-container rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary bg-white"
        />
        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={searching || searchQuery.trim().length < 3}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-md hover:brightness-95 disabled:opacity-50"
        >
          {searching ? "..." : "Cari"}
        </button>
      </div>

      {searchResults.length > 0 && (
        <ul className="border border-surface-container rounded-lg bg-white shadow-sm overflow-hidden max-h-40 overflow-y-auto">
          {searchResults.map((item) => (
            <li key={item.place_id}>
              <button
                type="button"
                onClick={() => selectSearchResult(item)}
                className="w-full text-left px-3 py-2.5 text-xs text-on-surface hover:bg-primary-container border-b border-surface-container last:border-b-0 flex items-start gap-2"
              >
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative rounded-xl border border-surface-container">
        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/80 pointer-events-none rounded-xl">
            <Loader2 size={22} className="animate-spin text-primary" />
          </div>
        )}
        <div ref={mapRef} className="address-map-canvas rounded-xl" role="application" aria-label="Peta OpenStreetMap" />
      </div>

      <p className="text-[10px] text-secondary leading-relaxed">
        Gratis — pakai OpenStreetMap. Cari alamat, klik peta, atau geser pin untuk mengisi form otomatis.
      </p>

      {error && <p className="text-[10px] text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
