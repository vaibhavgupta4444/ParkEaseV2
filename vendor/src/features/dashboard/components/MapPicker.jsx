import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { getMapCenter } from "../utils";

export default function MapPicker({ lat, lng, onPick }) {
  return (
    <div className="sm:col-span-2">
      <div className="mb-2 text-xs text-slate-500">Tap on map to set location</div>
      <div className="h-56 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={getMapCenter(lat, lng)} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <VendorMapCenter center={getMapCenter(lat, lng)} />
          <VendorMapPicker onSelect={onPick} />
          {lat && lng && (
            <CircleMarker
              center={[Number(lat), Number(lng)]}
              radius={6}
              pathOptions={{ color: "#2563eb", fillColor: "#06b6d4", fillOpacity: 0.9 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

function VendorMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center);
  }, [center, map]);
  return null;
}

function VendorMapPicker({ onSelect }) {
  useMapEvents({
    click: (event) => onSelect(event.latlng.lat, event.latlng.lng),
  });
  return null;
}
