import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Popup, Circle, CircleMarker, Polyline, useMap, useMapEvents } from "react-leaflet";
import { getNearbyParkingLots, getParkingLotDetails } from "../../services/parkingService";
import { createBooking } from "../../services/bookingService";
import { getUserLocation } from "../../utils/geolocation";
import DetailsModal from "../../components/ui/DetailsModal";
import StripePaymentPanel from "../../components/payment/StripePaymentPanel";

export default function ParkingSearchComponent({ token }) {
  const [userLocation, setUserLocation] = useState(null);
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLot, setSelectedLot] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingTimes, setBookingTimes] = useState({ startTime: "", endTime: "" });
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [sourceLocation, setSourceLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeLoadingId, setRouteLoadingId] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [targetLocation, setTargetLocation] = useState(null);
  const [filters, setFilters] = useState({
    radius: 5,
    maxPrice: null,
    minRating: 0,
  });

  const parkingMarkers = useMemo(() => {
    return parkingLots
      .map((lot) => {
        const [lng, lat] = lot.location?.coordinates || [];
        if (typeof lat !== "number" || typeof lng !== "number") return null;

        const address = [
          lot.location?.address?.street,
          lot.location?.address?.city,
          lot.location?.address?.state,
          lot.location?.address?.zipCode,
        ]
          .filter(Boolean)
          .join(", ");

        return {
          id: lot._id,
          name: lot.name,
          lat,
          lng,
          address,
          distance: lot.distance,
          available: lot.capacity?.available,
        };
      })
      .filter(Boolean);
  }, [parkingLots]);

  const mapCenter = useMemo(() => {
    if (targetLocation) return [targetLocation.latitude, targetLocation.longitude];
    if (userLocation) return [userLocation.latitude, userLocation.longitude];
    if (parkingMarkers.length > 0) return [parkingMarkers[0].lat, parkingMarkers[0].lng];
    return [28.6139, 77.209];
  }, [targetLocation, userLocation, parkingMarkers]);

  /**
   * Handle getting user location and fetching nearby parking lots
   */
  const fetchNearby = async (latitude, longitude, label) => {
    const response = await getNearbyParkingLots(latitude, longitude, {
      radius: filters.radius,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
    });

    setParkingLots(response.data || []);
    setTargetLocation({ latitude, longitude, label });
  };

  const handleSearchNearby = async () => {
    setLoading(true);
    setError("");

    try {
      if (locationQuery.trim()) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(locationQuery)}`
        );
        const data = await response.json();

        if (!data.length) {
          throw new Error("Location not found");
        }

        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);
        const label = data[0].display_name || locationQuery;

        setSourceLocation({ lat, lng, label: "Search location" });
        await fetchNearby(lat, lng, label);
        return;
      }

      const location = await getUserLocation();
      setUserLocation(location);
      setSourceLocation({
        lat: location.latitude,
        lng: location.longitude,
        label: "Your location",
      });
      await fetchNearby(location.latitude, location.longitude, "Your location");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "radius" || name === "minRating" ? parseFloat(value) : value ? parseFloat(value) : null,
    }));
  };

  /**
   * Initial location fetch
   */
  useEffect(() => {
    handleSearchNearby();
  }, []);

  useEffect(() => {
    if (!targetLocation) return undefined;

    const intervalId = window.setInterval(() => {
      fetchNearby(targetLocation.latitude, targetLocation.longitude, targetLocation.label).catch((err) => {
        setError(err.message);
      });
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [targetLocation, filters.radius, filters.maxPrice, filters.minRating]);

  const defaultTimes = useMemo(() => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const toLocalInput = (date) => {
      const offset = date.getTimezoneOffset();
      const local = new Date(date.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
    };
    return { start: toLocalInput(start), end: toLocalInput(end) };
  }, []);

  useEffect(() => {
    if (selectedLot) {
      setBookingTimes({ startTime: defaultTimes.start, endTime: defaultTimes.end });
      setBookingError("");
      setBookingSuccess("");
      setPaymentBooking(null);
      setSelectedSlotId("");
    }
  }, [selectedLot, defaultTimes]);

  useEffect(() => {
    setRoutePath([]);
    setRouteInfo(null);
    setRouteError("");
  }, [selectedLot]);

  const handleViewDetails = async (lot) => {
    setSelectedLot(lot);
    setDetailsError("");
    setDetailsLoading(true);

    try {
      const response = await getParkingLotDetails(lot._id);
      setSelectedLot(response.data || lot);
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleBookingChange = (event) => {
    const { name, value } = event.target;
    setBookingTimes((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookNow = async () => {
    if (!selectedLot) return;

    if (!token) {
      setBookingError("Please login to book a parking spot");
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    setBookingSuccess("");

    try {
      const response = await createBooking(
        {
          bookingType: "parking",
          targetId: selectedLot._id,
          slotId: selectedSlotId || undefined,
          startTime: bookingTimes.startTime,
          endTime: bookingTimes.endTime,
        },
        token
      );

      setPaymentBooking(response.data);
      setBookingSuccess(response.message || "Slot reserved. Complete payment to confirm.");
      await handleSearchNearby();
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setBookingSuccess(`Payment confirmed. Booking reference: ${paymentData.bookingRef}`);
    setPaymentBooking(null);
    handleSearchNearby();
  };

  const handleUseMyLocation = () => {
    if (userLocation) {
      setSourceLocation({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        label: "Your location",
      });
      setTargetLocation({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        label: "Your location",
      });
    }
  };

  const handleMapSourceSelect = (lat, lng) => {
    setSourceLocation({ lat, lng, label: "Selected point" });
  };

  const buildRoute = async (lot) => {
    if (!sourceLocation) {
      setRouteError("Set a route source first");
      return;
    }

    const targetLot = lot || selectedLot;

    if (!targetLot?.location?.coordinates?.length) return;

    const [destLng, destLat] = targetLot.location.coordinates;
    const { lat: srcLat, lng: srcLng } = sourceLocation;

    setRouteLoading(true);
    setRouteLoadingId(targetLot._id || null);
    setRouteError("");

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${srcLng},${srcLat};${destLng},${destLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (!data.routes?.length) {
        throw new Error("Route not found");
      }

      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      setRoutePath(coordinates);
      setRouteInfo({
        distanceKm: (route.distance / 1000).toFixed(2),
        durationMin: Math.round(route.duration / 60),
      });
    } catch (err) {
      setRouteError(err.message || "Unable to fetch route");
    } finally {
      setRouteLoading(false);
      setRouteLoadingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 text-slate-100">
      <h2 className="text-2xl font-semibold">Find Parking Spaces</h2>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-col gap-2 text-sm text-slate-300">
          <label htmlFor="locationQuery" className="font-semibold text-slate-100">Search location:</label>
          <input
            type="text"
            id="locationQuery"
            name="locationQuery"
            placeholder="e.g., Lucknow"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </div>

        <div className="flex flex-col gap-2 text-sm text-slate-300">
          <label htmlFor="radius" className="font-semibold text-slate-100">Radius (km):</label>
          <input
            type="range"
            id="radius"
            name="radius"
            min="1"
            max="50"
            value={filters.radius}
            onChange={handleFilterChange}
            className="h-2 w-40 cursor-pointer appearance-none rounded-full bg-slate-700 accent-emerald-400"
          />
          <span className="text-slate-400">{filters.radius} km</span>
        </div>

        <div className="flex flex-col gap-2 text-sm text-slate-300">
          <label htmlFor="maxPrice" className="font-semibold text-slate-100">Max Price (INR/hr):</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            placeholder="Enter max price"
            value={filters.maxPrice || ""}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </div>

        <div className="flex flex-col gap-2 text-sm text-slate-300">
          <label htmlFor="minRating" className="font-semibold text-slate-100">Min Rating:</label>
          <select
            id="minRating"
            name="minRating"
            value={filters.minRating}
            onChange={handleFilterChange}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          >
            <option value="0">All</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>

        <button
          onClick={handleSearchNearby}
          disabled={loading}
          className="rounded-xl bg-linear-to-r from-emerald-400 to-emerald-600 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Searching..." : "Search Nearby"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-200">
          {error}
        </div>
      )}

      {/* Current location */}
      {userLocation && (
        <div className="mt-4 rounded-lg border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sky-100">
          <p>
             Your Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </p>
        </div>
      )}

      {/* Results */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">Available Parking Lots ({parkingLots.length})</h3>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-100">Route source:</span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200">
              {sourceLocation ? `${sourceLocation.label} (${sourceLocation.lat.toFixed(4)}, ${sourceLocation.lng.toFixed(4)})` : "Not set"}
            </span>
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="rounded-full border border-emerald-400/50 px-3 py-1 text-xs font-semibold text-emerald-200"
            >
              Use my location
            </button>
            <span className="text-xs text-slate-400">Tip: click on map to set source</span>
          </div>
          {routeInfo && (
            <div className="text-xs text-emerald-200">
              {routeInfo.distanceKm} km · {routeInfo.durationMin} min
            </div>
          )}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-slate-300">
            <span className="font-semibold text-slate-100">Nearby map</span>
            <span className="text-xs text-slate-400">Powered by OpenStreetMap</span>
          </div>
          <div className="h-90">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterUpdater center={mapCenter} />
              <MapSourceSelector onSelect={handleMapSourceSelect} />

              {userLocation && (
                <>
                  <CircleMarker
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={7}
                    pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 1 }}
                  >
                    <Popup>Your location</Popup>
                  </CircleMarker>
                  <Circle
                    center={[userLocation.latitude, userLocation.longitude]}
                    radius={filters.radius * 1000}
                    pathOptions={{ color: "#38bdf8", fillColor: "#38bdf8", fillOpacity: 0.08 }}
                  />
                </>
              )}

              {sourceLocation && !(
                  userLocation &&
                  sourceLocation.lat === userLocation.latitude &&
                  sourceLocation.lng === userLocation.longitude
                ) && (
                <CircleMarker
                  center={[sourceLocation.lat, sourceLocation.lng]}
                  radius={6}
                  pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.9 }}
                >
                  <Popup>Route source</Popup>
                </CircleMarker>
              )}

              {routePath.length > 0 && (
                <Polyline positions={routePath} pathOptions={{ color: "#22d3ee", weight: 4 }} />
              )}

              {parkingMarkers.map((marker) => (
                <CircleMarker
                  key={marker.id}
                  center={[marker.lat, marker.lng]}
                  radius={6}
                  pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.9 }}
                >
                  <Popup>
                    <div className="text-sm text-slate-800">
                      <div className="font-semibold text-slate-900">{marker.name}</div>
                      {marker.address && <div className="text-xs text-slate-600">{marker.address}</div>}
                      {marker.distance && <div className="mt-1 text-xs text-slate-500">{marker.distance} km away</div>}
                      {marker.available !== undefined && (
                        <div className="text-xs text-emerald-700">{marker.available} spots available</div>
                      )}
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${marker.lat}&mlon=${marker.lng}#map=18/${marker.lat}/${marker.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
                      >
                        Open in map ↗
                      </a>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {parkingLots.length === 0 && !loading && (
          <p className="mt-4 text-slate-400">No parking lots found in this area</p>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {parkingLots.map((lot) => (
            <div key={lot._id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-card">
              {lot.imageUrl && <img src={lot.imageUrl} alt={lot.name} className="h-48 w-full object-cover" />}

              <div className="p-4">
                <h4 className="text-lg font-semibold">{lot.name}</h4>

                <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                  <span>📍 {lot.distance} km away</span>
                  <span>⭐ {lot.rating} {lot.totalReviews}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Available Spaces</p>
                    <p className="font-semibold text-slate-100">{lot.capacity.available} / {lot.capacity.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Hourly Rate</p>
                    <p className="font-semibold text-slate-100">{lot.pricing.hourlyRate} {lot.pricing.currency}</p>
                  </div>
                </div>

                {lot.amenities.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-slate-400">Amenities</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lot.amenities.map((amenity) => (
                        <span key={amenity} className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-1 text-xs text-sky-200">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 text-sm text-slate-400">
                  {lot.operatingHours?.is24Hours
                    ? "🕐 24 Hours"
                    : `🕐 ${lot.operatingHours?.opens} - ${lot.operatingHours?.closes}`}
                </div>

                <button
                  className="mt-4 w-full rounded-xl bg-linear-to-r from-emerald-400 to-emerald-600 px-4 py-2 text-sm font-semibold text-slate-900"
                  onClick={() => handleViewDetails(lot)}
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => buildRoute(lot)}
                  className="mt-2 w-full rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200"
                >
                  {routeLoading && routeLoadingId === lot._id ? "Routing..." : "Show route"}
                </button>
                {lot.location?.coordinates?.length === 2 && (
                  <a
                    className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200"
                    href={`https://www.openstreetmap.org/?mlat=${lot.location.coordinates[1]}&mlon=${lot.location.coordinates[0]}#map=18/${lot.location.coordinates[1]}/${lot.location.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in map ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DetailsModal
        isOpen={Boolean(selectedLot)}
        title={selectedLot?.name}
        subtitle={selectedLot?.description}
        onClose={() => setSelectedLot(null)}
      >
        {routeError && <p className="text-sm text-rose-200">{routeError}</p>}
        {routeInfo && (
          <p className="text-sm text-emerald-200">Route: {routeInfo.distanceKm} km · {routeInfo.durationMin} min</p>
        )}
        {detailsLoading && <p className="text-sm text-sky-200">Loading details...</p>}
        {detailsError && <p className="text-sm text-rose-200">{detailsError}</p>}

        {selectedLot && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-sm font-semibold text-sky-200">Address</h4>
              <p className="mt-2 text-sm text-slate-200">
                {selectedLot.location?.address?.street}, {selectedLot.location?.address?.city},
                {" "}{selectedLot.location?.address?.state} {selectedLot.location?.address?.zipCode}
              </p>
              {selectedLot.location?.coordinates?.length === 2 && (
                <a
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300"
                  href={`https://www.openstreetmap.org/?mlat=${selectedLot.location.coordinates[1]}&mlon=${selectedLot.location.coordinates[0]}#map=18/${selectedLot.location.coordinates[1]}/${selectedLot.location.coordinates[0]}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in map ↗
                </a>
              )}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-sm font-semibold text-sky-200">Availability</h4>
              <p className="mt-2 text-sm text-slate-200">
                {selectedLot.capacity?.available} available out of {selectedLot.capacity?.total}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-sm font-semibold text-sky-200">Pricing</h4>
              <p className="mt-2 text-sm text-slate-200">
                {selectedLot.pricing?.currency} {selectedLot.pricing?.hourlyRate}/hr
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-sm font-semibold text-sky-200">Operating Hours</h4>
              <p className="mt-2 text-sm text-slate-200">
                {selectedLot.operatingHours?.is24Hours
                  ? "24 Hours"
                  : `${selectedLot.operatingHours?.opens} - ${selectedLot.operatingHours?.closes}`}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-sm font-semibold text-sky-200">Rating</h4>
              <p className="mt-2 text-sm text-slate-200">
                {selectedLot.rating} ({selectedLot.totalReviews} reviews)
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="text-sm font-semibold text-sky-200">Amenities</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {selectedLot.amenities?.length
                  ? selectedLot.amenities.map((amenity) => (
                      <span key={amenity} className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                        {amenity}
                      </span>
                    ))
                  : "No amenities listed"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:col-span-2">
              <h4 className="text-sm font-semibold text-sky-200">Book this spot</h4>
              <div className="mt-3 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                {selectedLot.slots?.length > 0 && (
                  <label className="flex flex-col gap-2 sm:col-span-2">
                    Slot
                    <select
                      value={selectedSlotId}
                      onChange={(event) => setSelectedSlotId(event.target.value)}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    >
                      <option value="">Auto assign best available slot</option>
                      {selectedLot.slots
                        .filter((slot) => slot.isAvailable)
                        .map((slot) => (
                          <option key={slot.slotId} value={slot.slotId}>
                            {slot.slotId} · {slot.type} · {selectedLot.pricing?.currency} {slot.pricePerHour}/hr
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <label className="flex flex-col gap-2">
                  Start time
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={bookingTimes.startTime}
                    onChange={handleBookingChange}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  End time
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={bookingTimes.endTime}
                    onChange={handleBookingChange}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                  />
                </label>
                <div className="sm:col-span-2">
                  {bookingError && <p className="text-sm text-rose-200">{bookingError}</p>}
                  {bookingSuccess && <p className="text-sm text-emerald-200">{bookingSuccess}</p>}
                </div>
                <button
                  className="sm:col-span-2 rounded-xl bg-linear-to-r from-emerald-400 to-emerald-600 px-4 py-2 text-sm font-semibold text-slate-900"
                  onClick={handleBookNow}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Booking..." : "Book Now"}
                </button>
              </div>
            </div>
            {paymentBooking && (
              <div className="md:col-span-2">
                <StripePaymentPanel booking={paymentBooking} token={token} onPaid={handlePaymentSuccess} />
              </div>
            )}
          </div>
        )}
      </DetailsModal>
    </div>
  );
}

function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);

  return null;
}

function MapSourceSelector({ onSelect }) {
  useMapEvents({
    click: (event) => {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}
