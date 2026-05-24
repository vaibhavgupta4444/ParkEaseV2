import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Popup, Marker, ZoomControl, useMapEvents, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { ChevronUp, Crosshair, List, Menu, Search, Navigation } from "lucide-react";
import BrandLogo from "../components/navigation/BrandLogo";
import Sidebar from "../components/navigation/Sidebar";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";
import { getNearbyParkingLots } from "../services/parkingService";
import { getNearbyChargingStations } from "../services/chargingService";
import { getUserLocation } from "../utils/geolocation";
import { formatCurrency, getApiErrorMessage } from "../utils/formatters";
import { fetchNearbyMetroStations } from "../services/metroService";
import { getCityFromCoordinates, cityHasMetro } from "../utils/metroUtils";

const metroIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #E11D48;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-weight: 800;
      font-size: 14px;
      color: white;
      font-family: Inter, sans-serif;
    ">M</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export default function MapHomePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("both");
  const [radius, setRadius] = useState(5);
  const [maxPrice, setMaxPrice] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListOpen, setIsListOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [metroStations, setMetroStations] = useState([]);
  const [showParking, setShowParking] = useState(true);
  const [showEv, setShowEv] = useState(true);
  const [showMetro, setShowMetro] = useState(false);
  const [routeDestination, setRouteDestination] = useState(null);
  
  const metroLat = searchParams.get('lat');
  const metroLng = searchParams.get('lng');
  const metroName = searchParams.get('name');
  const source = searchParams.get('source');

  const fetchFacilities = async (lat, lng) => {
    setLoading(true);
    setLoadError("");
    try {
      const results = [];
      if (filterType === "both" || filterType === "parking") {
        const pRes = await getNearbyParkingLots(lat, lng, { radius, maxPrice: maxPrice || undefined });
        const pList = (pRes.data || []).map(f => ({ ...f, facilityType: "parking" }));
        results.push(...pList);
      }
      if (filterType === "both" || filterType === "ev") {
        const eRes = await getNearbyChargingStations(lat, lng, { radius, maxPrice: maxPrice || undefined });
        const eList = (eRes.data || []).map(f => ({ ...f, facilityType: "ev" }));
        results.push(...eList);
      }
      
      // sort by distance
      results.sort((a, b) => a.distance - b.distance);
      setFacilities(results);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        setSearchLocation([lat, lon]);
        await fetchFacilities(lat, lon);
        
        // Fetch nearby metro stations for the searched location
        const city = await getCityFromCoordinates(lat, lon);
        if (cityHasMetro(city)) {
          const stations = await fetchNearbyMetroStations(lat, lon, 5000);
          setMetroStations(stations);
          if (stations.length > 0) {
            setShowMetro(true);
          } else {
            setShowMetro(false);
          }
        } else {
          setMetroStations([]);
          setShowMetro(false);
        }
      } else {
        toast.error("No facilities found");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const locateUser = async () => {
    try {
      const loc = await getUserLocation();
      setUserLocation([loc.latitude, loc.longitude]);
      setSearchLocation([loc.latitude, loc.longitude]);
      await fetchFacilities(loc.latitude, loc.longitude);
      
      const city = await getCityFromCoordinates(loc.latitude, loc.longitude);
      if (cityHasMetro(city)) {
        const stations = await fetchNearbyMetroStations(loc.latitude, loc.longitude, 5000);
        setMetroStations(stations);
        if (stations.length > 0) setShowMetro(true);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    if (source === 'metro' && metroLat && metroLng) {
      const lat = parseFloat(metroLat);
      const lng = parseFloat(metroLng);
      setSearchLocation([lat, lng]);
      setRadius(0.5); // 500m radius
      fetchFacilities(lat, lng);
      // optionally fetch metro stations around it to show other metros
      fetchNearbyMetroStations(lat, lng, 5000).then(stations => {
        setMetroStations(stations);
        if (stations.length > 0) setShowMetro(true);
      });
    } else {
      locateUser();
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (searchLocation) {
      fetchFacilities(searchLocation[0], searchLocation[1]);
    }
    // eslint-disable-next-line
  }, [filterType, radius, maxPrice]);

  const mapCenter = searchLocation || userLocation || [28.6139, 77.209];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background animate-fadeIn">
      <Sidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} user={user} onLogout={onLogout} />

      <div className="z-50 shrink-0 bg-surface shadow-sm backdrop-blur-md">
        {source === 'metro' && (
          <div className="bg-rose-50 border-b border-rose-100 py-2 px-4 md:px-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-rose-800">
              Showing parking near <strong>{metroName}</strong>
            </p>
            <button 
              onClick={() => {
                setSearchParams({});
                setRadius(5);
                setRouteDestination(null);
                locateUser();
              }}
              className="text-xs font-bold text-rose-600 bg-white border border-rose-200 px-3 py-1 rounded-full hover:bg-rose-50"
            >
              Clear
            </button>
          </div>
        )}
        <div className="flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
             <button
               type="button"
               onClick={() => setIsNavOpen(true)}
               className="flex h-10 w-10 items-center justify-center rounded-lg text-textSecondary transition hover:bg-gray-100 hover:text-primary md:hidden"
               aria-label="Open navigation"
             >
               <Menu size={22} />
             </button>
             <button type="button" onClick={() => navigate("/home")} aria-label="Go to home">
               <BrandLogo />
             </button>
          </div>
          
          <div className="hidden flex-1 max-w-xl mx-8 md:flex">
            <form onSubmit={handleSearch} className="flex relative w-full items-center">
              <input 
                type="text" 
                placeholder="Search area, landmark..." 
                className="field-input rounded-full pr-12"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                required
              />
              <button type="submit" className="absolute right-3 text-textMuted transition hover:text-primary" aria-label="Search">
                 <Search size={18} />
              </button>
            </form>
          </div>

          <div className="hidden items-center gap-4 md:flex">
             <button onClick={() => navigate("/home")} className="text-sm font-semibold text-textSecondary transition hover:text-primary">Home</button>
             <button onClick={() => navigate("/bookings")} className="text-sm font-semibold text-textSecondary transition hover:text-primary">My Bookings</button>
             <button onClick={() => navigate("/profile")} className="text-sm font-semibold text-textSecondary transition hover:text-primary">Profile</button>
             <button onClick={onLogout} className="text-sm font-semibold text-error transition hover:text-red-700">Logout</button>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-4 overflow-x-auto border-t border-border bg-surface px-4 py-2 md:px-6">
           <form onSubmit={handleSearch} className="flex min-w-[220px] items-center md:hidden">
             <input
               type="text"
               placeholder="Search area..."
               className="field-input rounded-full py-2"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               required
             />
           </form>

           <div className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 p-1">
             <button onClick={() => setFilterType("both")} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${filterType === "both" ? "bg-surface text-primary shadow" : "text-textSecondary hover:text-textPrimary"}`}>All</button>
             <button onClick={() => setFilterType("parking")} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${filterType === "parking" ? "bg-surface text-primary shadow" : "text-textSecondary hover:text-textPrimary"}`}>Parking</button>
             <button onClick={() => setFilterType("ev")} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${filterType === "ev" ? "bg-surface text-primary shadow" : "text-textSecondary hover:text-textPrimary"}`}>EV</button>
           </div>
           
           <div className="mx-2 h-6 w-px bg-border"></div>
           
           <div className="flex shrink-0 items-center gap-2">
             <span className="text-xs font-semibold text-textSecondary">Radius:</span>
             <input type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-24 accent-primary" />
             <span className="text-xs font-semibold text-textPrimary">{radius}km</span>
           </div>

           <div className="ml-4 flex shrink-0 items-center gap-2">
             <span className="text-xs font-semibold text-textSecondary">Max Price:</span>
             <input type="number" min={0} placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="field-input w-24 py-1.5" />
           </div>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className={`fixed inset-x-0 bottom-0 z-40 flex h-1/2 flex-col rounded-t-2xl bg-surface shadow-2xl transition-transform duration-300 md:relative md:inset-auto md:h-full md:w-[400px] md:translate-y-0 md:rounded-none md:shadow-none ${isListOpen ? "translate-y-0" : "translate-y-[calc(100%-76px)] md:translate-y-0"}`}>
          <div className="cursor-pointer md:cursor-default" onClick={() => setIsListOpen(!isListOpen)}>
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-border md:hidden" />
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-secondary">Nearby Facilities</h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-primary">{facilities.length}</span>
              </div>
              <ChevronUp size={20} className={`text-textSecondary transition-transform md:hidden ${isListOpen ? "rotate-180" : ""}`} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadError ? (
              <ErrorState message={loadError} onRetry={() => searchLocation && fetchFacilities(searchLocation[0], searchLocation[1])} />
            ) : loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : facilities.length === 0 ? (
              <EmptyState
                icon={<Search size={32} />}
                title="No facilities found"
                description="Try adjusting your filters or searching a different area"
                action={<button type="button" onClick={locateUser} className="btn-primary">Locate Me</button>}
              />
            ) : (
              facilities.map(facility => (
                <div key={facility._id} className="app-card group cursor-pointer" onClick={() => navigate(`/facility/${facility._id}?type=${facility.facilityType}`)}>
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-secondary group-hover:text-primary transition-colors">{facility.name}</h3>
                     <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-textSecondary">
                       {facility.distance} km
                     </span>
                   </div>
                   
                   <div className="flex gap-2 mb-3">
                     {facility.facilityType === "parking" ? (
                       <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-primary">Parking</span>
                     ) : (
                       <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">EV Charging</span>
                     )}
                     <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-warning">{facility.rating || "New"}</span>
                   </div>

                   <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-2 text-sm">
                     <div>
                       <p className="text-xs text-textSecondary">Available</p>
                       <p className="font-bold text-success">{facility.capacity?.available || 0} spots</p>
                     </div>
                     <div>
                       <p className="text-xs text-textSecondary">Price</p>
                       <p className="font-bold text-textPrimary">
                         {formatCurrency(facility.pricing?.hourlyRate || facility.pricing?.rate)}/hr
                       </p>
                     </div>
                   </div>

                   <button className="btn-primary w-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                     View & Book
                   </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="relative z-0 flex-1 bg-gray-200">
          
          {/* Map Layer Toggles */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex bg-white/90 backdrop-blur shadow-lg rounded-full p-1 gap-1 border border-slate-200">
            <button
              onClick={() => setShowParking(!showParking)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${showParking ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Parking
            </button>
            <button
              onClick={() => setShowEv(!showEv)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${showEv ? "bg-green-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              EV Stations
            </button>
            {metroStations.length > 0 && (
              <button
                onClick={() => setShowMetro(!showMetro)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition ${showMetro ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                Metro
              </button>
            )}
          </div>

          <MapContainer center={mapCenter} zoom={source === 'metro' ? 15 : 13} className="h-full w-full" zoomControl={false}>
            <ZoomControl position="topright" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            
            {userLocation && routeDestination && (
              <SimpleRouteLayer start={userLocation} end={routeDestination} />
            )}
            
            {source === 'metro' && metroLat && metroLng && (
              <Circle 
                center={[parseFloat(metroLat), parseFloat(metroLng)]} 
                radius={500} 
                pathOptions={{ color: '#E11D48', fillColor: '#E11D48', fillOpacity: 0.1, dashArray: '5, 10' }} 
              />
            )}

            {userLocation && (
              <Marker
                position={userLocation}
                icon={L.divIcon({
                  html: `<div style="color: #1D4ED8; display: flex; justify-content: center; align-items: center;">
                           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
                         </div>`,
                  className: "custom-pin",
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                  popupAnchor: [0, -32]
                })}
              >
                <Popup>You are here</Popup>
              </Marker>
            )}

            {facilities.map(facility => {
              const coords = facility.location?.coordinates;
              if (!coords) return null;
              const isParking = facility.facilityType === "parking";
              if (isParking && !showParking) return null;
              if (!isParking && !showEv) return null;

              const pinColor = isParking ? "#1D4ED8" : "#16A34A";
              return (
                <Marker
                  key={facility._id}
                  position={[coords[1], coords[0]]}
                  icon={L.divIcon({
                    html: `<div style="color: ${pinColor}; display: flex; justify-content: center; align-items: center;">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
                           </div>`,
                    className: "custom-pin",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                  })}
                  eventHandlers={{
                    click: () => {
                      setSelectedFacility(facility);
                    },
                  }}
                >
                  <Popup>
                    <div className="font-bold">{facility.name}</div>
                    <div className="text-xs text-slate-500">{isParking ? "Parking" : "EV Charging"}</div>
                    <div className="mt-1 text-sm">{facility.capacity?.available} spots available</div>
                  </Popup>
                </Marker>
              )
            })}
            
            {showMetro && metroStations.map(station => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={metroIcon}
              >
                <Popup>
                  <div className="font-bold mb-1 text-sm">{station.name}</div>
                  {station.network && <div className="text-xs text-slate-500">Network: {station.network}</div>}
                  {station.lines && <div className="text-xs text-slate-500">Line: {station.lines}</div>}
                  <button 
                    onClick={() => {
                      setSearchParams({ lat: station.lat, lng: station.lng, name: station.name, source: 'metro' });
                      setRadius(0.5);
                      setRouteDestination(null);
                      setSearchLocation([station.lat, station.lng]);
                      fetchFacilities(station.lat, station.lng);
                    }}
                    className="mt-3 w-full rounded bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
                  >
                    Find Parking Near This Metro
                  </button>
                  <button 
                    onClick={() => setRouteDestination([station.lat, station.lng])}
                    className="mt-2 w-full flex items-center justify-center gap-1 rounded bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    <Navigation size={14} />
                    Show Route to Metro
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <button
            type="button"
            onClick={locateUser}
            className="absolute bottom-24 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-lg transition hover:bg-blue-50 md:bottom-6"
            aria-label="Locate me"
          >
            <Crosshair size={20} />
          </button>

          {/* List button removed in favor of peeking bottom sheet */}

          {selectedFacility && (
            <div className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl bg-surface p-5 shadow-2xl md:left-auto md:right-6 md:bottom-6 md:w-80 md:rounded-xl">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border md:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-secondary">{selectedFacility.name}</h3>
                  <p className="mt-1 text-sm text-textSecondary">{selectedFacility.distance} km away</p>
                </div>
                <button type="button" onClick={() => setSelectedFacility(null)} className="btn-ghost px-2 py-1">
                  Close
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-textSecondary">Available</p>
                  <p className="font-bold text-success">{selectedFacility.capacity?.available || 0}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-textSecondary">Rate</p>
                  <p className="font-bold text-textPrimary">{formatCurrency(selectedFacility.pricing?.hourlyRate || selectedFacility.pricing?.rate)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/facility/${selectedFacility._id}?type=${selectedFacility.facilityType}`)}
                className="btn-primary mt-4 w-full"
              >
                View & Book
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapUpdater({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}


function SimpleRouteLayer({ start, end }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    if (controlRef.current) {
      map.removeControl(controlRef.current);
    }

    controlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: "#E11D48", weight: 4, opacity: 0.8 }]
      },
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      routeWhileDragging: false,
    });

    controlRef.current.addTo(map);

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
      }
    };
  }, [start, end, map]);

  return null;
}
