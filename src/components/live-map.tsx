import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

const ORIGIN: [number, number] = [-19.9515, -43.993];
const DESTINATION: [number, number] = [-19.928, -44.0];
const CAR_POSITION: [number, number] = [
  ORIGIN[0] + (DESTINATION[0] - ORIGIN[0]) * 0.6,
  ORIGIN[1] + (DESTINATION[1] - ORIGIN[1]) * 0.6,
];

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

function dotIcon(L: typeof import("leaflet"), color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:12px;height:12px;border-radius:999px;background:${color};box-shadow:0 0 0 4px ${color}33"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function carIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:26px;height:26px;border-radius:999px;background:#7c3aed;box-shadow:0 4px 12px rgba(124,58,237,.55)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14l-1.5-6.5a2 2 0 0 0-2-1.5H8.5a2 2 0 0 0-2 1.5L5 17Z"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="17" r="1.5"/></svg></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function LiveMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((mod) => {
      const L = mod.default ?? mod;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      });
      map.fitBounds([ORIGIN, DESTINATION], { padding: [28, 28] });
      mapRef.current = map;

      L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
      L.polyline([ORIGIN, DESTINATION], { color: "#7c3aed", weight: 4, opacity: 0.85 }).addTo(map);
      L.marker(ORIGIN, { icon: dotIcon(L, "#19885d") }).addTo(map);
      L.marker(DESTINATION, { icon: dotIcon(L, "#7c3aed") }).addTo(map);
      L.marker(CAR_POSITION, { icon: carIcon(L) }).addTo(map);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-40 w-full overflow-hidden rounded-2xl"
      role="img"
      aria-label="Mapa com o trajeto entre a Estação Gameleira e a PUC Minas Coração Eucarístico"
    />
  );
}
