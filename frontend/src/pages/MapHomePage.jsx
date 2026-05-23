import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Popup, CircleMarker, ZoomControl, useMapEvents } from "react-leaflet";
import { ChevronUp, Crosshair, List, Menu, Search } from "lucide-react";
import BrandLogo from "../components/navigation/BrandLogo";
import Sidebar from "../components/navigation/Sidebar";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";
import { getNearbyParkingLots } from "../services/parkingService";
import { getNearbyChargingStations } from "../services/chargingService";
import { getUserLocation } from "../utils/geolocation";
import { formatCurrency, getApiErrorMessage } from "../utils/formatters";

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
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    locateUser();
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
             <button type="button" onClick={() => navigate("/map")} aria-label="Go to map home">
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
        <div className={`fixed inset-x-0 bottom-0 z-40 flex h-1/2 flex-col rounded-t-2xl bg-surface shadow-2xl transition-transform duration-300 md:relative md:inset-auto md:h-full md:w-[400px] md:translate-y-0 md:rounded-none md:shadow-none ${isListOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}>
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-border md:hidden" />
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-bold text-secondary">Nearby Facilities</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-primary">{facilities.length}</span>
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
          <MapContainer center={mapCenter} zoom={13} className="h-full w-full" zoomControl={false}>
            <ZoomControl position="topright" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            
            {userLocation && (
              <CircleMarker
                center={userLocation}
                radius={16}
                pathOptions={{ color: "#FFFFFF", fillColor: "#1D4ED8", fillOpacity: 1, weight: 3 }}
              >
                <Popup>You are here</Popup>
              </CircleMarker>
            )}

            {facilities.map(facility => {
              const coords = facility.location?.coordinates;
              if (!coords) return null;
              const isParking = facility.facilityType === "parking";
              return (
                <CircleMarker
                  key={facility._id}
                  center={[coords[1], coords[0]]}
                  radius={16}
                  pathOptions={{ 
                    color: "#FFFFFF", 
                    fillColor: isParking ? "#1D4ED8" : "#16A34A", 
                    fillOpacity: 1, 
                    weight: 3 
                  }}
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
                </CircleMarker>
              )
            })}
          </MapContainer>

          <button
            type="button"
            onClick={locateUser}
            className="absolute bottom-24 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-lg transition hover:bg-blue-50 md:bottom-6"
            aria-label="Locate me"
          >
            <Crosshair size={20} />
          </button>

          <button 
            className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-secondary px-6 py-3 font-bold text-white shadow-xl md:hidden"
            onClick={() => setIsListOpen(!isListOpen)}
          >
            {isListOpen ? <ChevronUp size={18} /> : <List size={18} />}
            {isListOpen ? "Hide List" : "Show List"}
          </button>

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
