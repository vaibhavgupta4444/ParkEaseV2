import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../components/ui/BackButton";
import ErrorState from "../components/ui/ErrorState";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import NavigationMap, { GoogleMapsButton } from "../components/map/NavigationMap";
import { getBookingNavigation } from "../services/bookingService";
import { getApiErrorMessage } from "../utils/formatters";

export default function NavigatePage({ token }) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [navigationData, setNavigationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getBookingNavigation(bookingId, token)
      .then((response) => {
        if (active) setNavigationData(response.data);
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingId, token]);

  const destination = useMemo(() => {
    const coordinates = navigationData?.facility?.location?.coordinates;
    if (!coordinates?.length) return null;
    return {
      lat: coordinates[1],
      lng: coordinates[0],
      name: navigationData.facility.name,
      address: navigationData.facility.address,
    };
  }, [navigationData]);

  if (loading) {
    return (
      <div className="page-shell flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="page-shell">
        <BackButton label="Back to My Bookings" to="/bookings" />
        <div className="mt-6">
          <ErrorState message={error || "Navigation details unavailable"} />
          <button type="button" onClick={() => navigate("/bookings")} className="btn-primary mt-4">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <BackButton label="Back to My Bookings" to="/bookings" />
          <div>
            <h1 className="text-2xl font-black text-secondary">Navigate to Parking</h1>
            <p className="text-sm text-textSecondary">Ref: {navigationData.bookingRef} · Slot: {navigationData.slotId}</p>
          </div>
        </div>
        <GoogleMapsButton destination={destination} />
      </div>

      <NavigationMap
        destination={destination}
        bookingRef={navigationData.bookingRef}
        slotId={navigationData.slotId}
        className="h-[calc(100dvh-180px)] min-h-[520px]"
      />
    </div>
  );
}
