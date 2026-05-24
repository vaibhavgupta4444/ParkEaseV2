import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Navigation, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const getMapCenter = (lat, lng) => {
  if (lat && lng) return [Number(lat), Number(lng)];
  return [28.6139, 77.2090]; // Default center (New Delhi)
};

export default function MapPicker({ lat, lng, onLocationUpdate }) {
  const [loading, setLoading] = useState(false);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      if (data && data.address) {
        return {
          street: data.address.road || data.address.suburb || data.address.neighbourhood || "",
          city: data.address.city || data.address.town || data.address.state_district || "",
          state: data.address.state || "",
          zipCode: data.address.postcode || "",
        };
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
    return null;
  };

  const handleMapClick = async (newLat, newLng) => {
    setLoading(true);
    const address = await reverseGeocode(newLat, newLng);
    onLocationUpdate(newLat.toFixed(6), newLng.toFixed(6), address);
    setLoading(false);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        onLocationUpdate(latitude.toFixed(6), longitude.toFixed(6), address);
        setLoading(false);
        toast.success("Location updated via GPS");
      },
      (err) => {
        setLoading(false);
        toast.error("Please allow location access or tap on the map to set location manually");
      }
    );
  };

  return (
    <div className="sm:col-span-2">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500">Tap on map to set exact location</div>
        <button
          type="button"
          onClick={handleGPS}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
          Use My Current Location
        </button>
      </div>
      <div className="h-56 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={getMapCenter(lat, lng)} zoom={13} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <VendorMapCenter center={getMapCenter(lat, lng)} />
          <VendorMapPicker onSelect={handleMapClick} />
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
