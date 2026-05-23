import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import L from "leaflet";
import "leaflet-routing-machine";
import { Crosshair, ExternalLink, MapPin, Navigation, QrCode, X } from "lucide-react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { formatDistance, formatDuration, haversineDistance } from "../../utils/haversine";

const userIcon = L.divIcon({
  className: "",
  html: `
    <div class="user-location-dot">
      <div class="pulse-ring"></div>
      <div class="pulse-ring delay"></div>
      <div class="blue-dot"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `<div class="parking-destination-pin">P</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const defaultPosition = { lat: 28.6139, lng: 77.209 };

function getInstructionText(instruction) {
  if (!instruction) return "Continue toward your parking spot";
  return instruction.text || instruction.road || instruction.type || "Continue on route";
}

function midpoint(a, b) {
  return [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
}

const routeStyles = {
  fastest: {
    color: "#2563EB",
    halo: "#BFDBFE",
    label: "Fastest route highlighted",
  },
  shortest: {
    color: "#059669",
    halo: "#A7F3D0",
    label: "Shortest route highlighted",
  },
};

function RoutingLayer({ userPosition, destination, routeType, arrived, onRouteFound, onRoutePoint }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!userPosition || !destination || arrived) return undefined;

    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(userPosition.lat, userPosition.lng), L.latLng(destination.lat, destination.lng)],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: routeStyles[routeType].color, weight: 3, opacity: 0.25 }],
      },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      routeWhileDragging: false,
      useZoomParameter: true,
      showAlternatives: routeType === "shortest",
      altLineOptions: {
        styles: [{ color: "#94A3B8", weight: 3, opacity: 0.25 }],
      },
    });

    control.on("routesfound", (event) => {
      const routes = event.routes || [];
      const selectedRoute =
        routeType === "shortest"
          ? [...routes].sort((a, b) => (a.summary?.totalDistance || 0) - (b.summary?.totalDistance || 0))[0]
          : routes[0];

      if (selectedRoute) {
        onRouteFound({
          distance: selectedRoute.summary?.totalDistance || 0,
          duration: selectedRoute.summary?.totalTime || 0,
          instructions: selectedRoute.instructions || [],
          coordinates: (selectedRoute.coordinates || []).map((point) => [point.lat, point.lng]),
        });
        onRoutePoint(userPosition);
      }
    });

    control.addTo(map);
    controlRef.current = control;

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [arrived, destination, map, onRouteFound, onRoutePoint, routeType, userPosition]);

  return null;
}

function MapAutoFit({ userPosition, destination, followMode, arrived }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition || !destination) return;

    if (arrived) {
      map.setView([destination.lat, destination.lng], 18, { animate: true });
      return;
    }

    const bounds = L.latLngBounds([
      [userPosition.lat, userPosition.lng],
      [destination.lat, destination.lng],
    ]);
    map.fitBounds(bounds, { padding: [56, 96], maxZoom: 16 });
  }, [arrived, destination, map, userPosition]);

  useEffect(() => {
    if (followMode && userPosition && !arrived) {
      map.panTo([userPosition.lat, userPosition.lng], { animate: true });
    }
  }, [arrived, followMode, map, userPosition]);

  return null;
}

export function GoogleMapsButton({ destination, className = "" }) {
  return (
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-blue-50 ${className}`}
    >
      <ExternalLink size={14} />
      Open in Google Maps
    </a>
  );
}

export default function NavigationMap({ destination, bookingRef, slotId, className = "" }) {
  const [userPosition, setUserPosition] = useState(null);
  const [displayPosition, setDisplayPosition] = useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const [geoError, setGeoError] = useState("");
  const [route, setRoute] = useState({ distance: 0, duration: 0, instructions: [] });
  const [routeType, setRouteType] = useState("fastest");
  const [lastRoutePoint, setLastRoutePoint] = useState(null);
  const [followMode, setFollowMode] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const watchRef = useRef(null);
  const animationRef = useRef(null);
  const retryTimerRef = useRef(null);

  const remainingDistance = useMemo(() => {
    if (!displayPosition) return null;
    return haversineDistance(displayPosition.lat, displayPosition.lng, destination.lat, destination.lng);
  }, [destination.lat, destination.lng, displayPosition]);

  const nextInstruction = route.instructions[0];
  const selectedRouteStyle = routeStyles[routeType];

  const setAnimatedPosition = useCallback((nextPosition) => {
    setUserPosition(nextPosition);
    setDisplayPosition((previous) => {
      if (!previous) return nextPosition;

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      const start = performance.now();
      const from = previous;

      const animate = (time) => {
        const progress = Math.min((time - start) / 1000, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayPosition({
          lat: from.lat + (nextPosition.lat - from.lat) * eased,
          lng: from.lng + (nextPosition.lng - from.lng) * eased,
        });
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
      return previous;
    });
  }, []);

  const handlePosition = useCallback(
    (position) => {
      const nextPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setGeoError("");
      setAnimatedPosition(nextPosition);

      const distance = haversineDistance(nextPosition.lat, nextPosition.lng, destination.lat, destination.lng);
      if (distance < 50) {
        setArrived(true);
      }
    },
    [destination.lat, destination.lng, setAnimatedPosition]
  );

  const handleGeoError = useCallback((error) => {
    if (error.code === error.PERMISSION_DENIED) {
      setGeoError("PERMISSION_DENIED");
      return;
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      setGeoError("POSITION_UNAVAILABLE");
      toast.error("Could not determine your location. Check GPS signal.");
      return;
    }
    if (error.code === error.TIMEOUT) {
      setGeoError("TIMEOUT");
      toast.error("Location request timed out. Retrying...");
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("NOT_SUPPORTED");
      return;
    }

    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = navigator.geolocation.watchPosition(handlePosition, handleGeoError, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 3000,
    });
  }, [handleGeoError, handlePosition]);

  useEffect(() => {
    const timer = window.setTimeout(startTracking, 0);
    return () => {
      window.clearTimeout(timer);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    };
  }, [startTracking]);

  useEffect(() => {
    if (geoError !== "TIMEOUT") return undefined;
    retryTimerRef.current = window.setTimeout(startTracking, 3000);
    return () => {
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    };
  }, [geoError, startTracking]);

  useEffect(() => {
    if (!userPosition || !lastRoutePoint || arrived) return;
    const distanceMoved = haversineDistance(userPosition.lat, userPosition.lng, lastRoutePoint.lat, lastRoutePoint.lng);
    if (distanceMoved > 50) {
      window.setTimeout(() => setLastRoutePoint(null), 0);
    }
  }, [arrived, lastRoutePoint, userPosition]);

  const geocodeManualAddress = async (event) => {
    event.preventDefault();
    if (!manualAddress.trim()) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`);
      const data = await response.json();
      if (!data?.length) {
        toast.error("Could not find that location");
        return;
      }
      setGeoError("");
      setAnimatedPosition({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
    } catch {
      toast.error("Could not geocode the location");
    }
  };

  const mapPosition = displayPosition || defaultPosition;
  const hasPosition = Boolean(displayPosition);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-slate-100 ${className}`}>
      {geoError && !hasPosition ? (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <MapPin className="mb-3 h-10 w-10 text-primary" />
          {geoError === "PERMISSION_DENIED" && (
            <>
              <p className="font-bold text-secondary">Location access is needed to navigate to your parking spot</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={startTracking} className="btn-primary">Retry</button>
                <GoogleMapsButton destination={destination} />
              </div>
              <form onSubmit={geocodeManualAddress} className="mt-4 flex w-full max-w-md gap-2">
                <input value={manualAddress} onChange={(event) => setManualAddress(event.target.value)} className="field-input" placeholder="Enter your current address" />
                <button type="submit" className="btn-secondary">Use</button>
              </form>
            </>
          )}
          {geoError === "POSITION_UNAVAILABLE" && (
            <>
              <p className="font-bold text-secondary">Could not determine your location. Check GPS signal.</p>
              <button type="button" onClick={startTracking} className="btn-primary mt-4">Retry</button>
            </>
          )}
          {geoError === "TIMEOUT" && <p className="font-bold text-secondary">Location request timed out. Retrying...</p>}
          {geoError === "NOT_SUPPORTED" && (
            <>
              <p className="font-bold text-secondary">Your browser does not support navigation.</p>
              <GoogleMapsButton destination={destination} className="mt-4" />
            </>
          )}
        </div>
      ) : (
        <>
          <MapContainer
            center={midpoint(mapPosition, destination)}
            zoom={14}
            zoomControl={false}
            className="h-full min-h-[400px] w-full navigation-map-height"
          >
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ZoomControl position="topright" />
            <MapAutoFit userPosition={displayPosition} destination={destination} followMode={followMode} arrived={arrived} />
            {displayPosition && (
              <Marker position={[displayPosition.lat, displayPosition.lng]} icon={userIcon} />
            )}
            <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-bold">{destination.name}</p>
                  <p className="text-xs">{destination.address}</p>
                  {remainingDistance !== null && <p className="text-xs font-semibold">{formatDistance(remainingDistance)} away</p>}
                </div>
              </Popup>
            </Marker>
            {route.coordinates?.length ? (
              <>
                <Polyline positions={route.coordinates} pathOptions={{ color: selectedRouteStyle.halo, weight: 11, opacity: 0.9 }} />
                <Polyline positions={route.coordinates} pathOptions={{ color: selectedRouteStyle.color, weight: 6, opacity: 0.95 }} />
              </>
            ) : null}
            {displayPosition && !arrived && !lastRoutePoint && (
              <RoutingLayer
                userPosition={displayPosition}
                destination={destination}
                routeType={routeType}
                arrived={arrived}
                onRouteFound={setRoute}
                onRoutePoint={setLastRoutePoint}
              />
            )}
          </MapContainer>

          <button
            type="button"
            onClick={() => setFollowMode((value) => !value)}
            className={`absolute right-4 top-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full border bg-white shadow-lg transition ${followMode ? "border-primary text-primary" : "border-border text-textSecondary"}`}
            aria-label="Toggle follow mode"
          >
            <Crosshair size={18} />
          </button>

          {arrived && (
            <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/25 p-4 md:p-6">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
                <h3 className="text-xl font-black text-secondary">You have arrived at your parking!</h3>
                <p className="mt-2 text-sm text-textSecondary">Slot: {slotId} · Ref: {bookingRef}</p>
                {showQr && (
                  <div className="mx-auto mt-5 flex h-44 w-44 items-center justify-center rounded-xl bg-secondary p-4 text-white">
                    <div>
                      <QrCode className="mx-auto mb-2 h-12 w-12" />
                      <p className="break-all text-xs text-white/70">PARKEASE-{bookingRef}</p>
                    </div>
                  </div>
                )}
                <div className="mt-5 flex gap-3">
                  <button type="button" onClick={() => setShowQr((value) => !value)} className="btn-secondary flex-1">Show QR Code</button>
                  <button type="button" onClick={() => window.location.assign("/bookings")} className="btn-primary flex-1">Done</button>
                </div>
              </div>
            </div>
          )}

          <div
            className={`absolute bottom-0 left-0 right-0 z-[1000] rounded-t-2xl bg-white p-4 shadow-lg transition-transform md:translate-y-0 ${
              expanded ? "translate-y-0" : "translate-y-[calc(100%-88px)] md:translate-y-0"
            }`}
            onTouchStart={(event) => {
              event.currentTarget.dataset.startY = String(event.touches[0].clientY);
            }}
            onTouchEnd={(event) => {
              const startY = Number(event.currentTarget.dataset.startY || 0);
              const endY = event.changedTouches[0].clientY;
              if (startY - endY > 40) setExpanded(true);
              if (endY - startY > 40) setExpanded(false);
            }}
          >
            <div 
              className="cursor-pointer md:cursor-default" 
              onClick={() => setExpanded(!expanded)}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 md:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-textSecondary">Navigating to:</p>
                  <h3 className="font-black text-secondary">{destination.name}</h3>
                  <p className="mt-1 text-sm text-textSecondary">
                    {formatDistance(remainingDistance ?? route.distance)} away · ~{formatDuration(route.duration)}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(false);
                  }} 
                  className="md:hidden p-2 -mr-2" 
                  aria-label="Minimize directions"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {["fastest", "shortest"].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRouteType(value);
                    setLastRoutePoint(null);
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    routeType === value ? "border-primary bg-blue-50 text-primary" : "border-border text-textSecondary hover:bg-slate-50"
                  }`}
                >
                  {value === "fastest" ? "Fastest Route" : "Shortest Route"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold" style={{ color: selectedRouteStyle.color }}>
              {selectedRouteStyle.label}
            </p>

            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
              <span className="font-bold text-secondary">Next:</span>{" "}
              <span className="text-textSecondary">{getInstructionText(nextInstruction)}</span>
              {nextInstruction?.distance ? <span className="ml-2 font-semibold text-primary">({formatDistance(nextInstruction.distance)})</span> : null}
            </div>

            {expanded && (
              <ol className="mt-3 max-h-56 space-y-2 overflow-y-auto text-sm">
                {route.instructions.map((instruction, index) => (
                  <li key={`${instruction.index}-${index}`} className={`flex gap-3 rounded-lg p-2 ${index === 0 ? "bg-blue-50 text-primary" : "text-textSecondary"}`}>
                    <Navigation size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">{getInstructionText(instruction)}</p>
                      <p className="text-xs">{formatDistance(instruction.distance || 0)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </div>
  );
}
