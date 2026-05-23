import { useLocation, useNavigate } from "react-router-dom";
import { Check, QrCode } from "lucide-react";
import NavigationMap, { GoogleMapsButton } from "../components/map/NavigationMap";
import { formatCurrency, formatDateTime } from "../utils/formatters";

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentData, facility, selectedSlot, startTime, endTime, finalPrice } = location.state || {};
  const qrCodeData = paymentData?.bookingRef ? `PARKEASE-${paymentData.bookingRef}` : "";
  const coordinates = facility?.location?.coordinates;
  const destination = coordinates?.length
    ? {
        lat: coordinates[1],
        lng: coordinates[0],
        name: facility.name,
        address: [facility.location?.address?.street, facility.location?.address?.city, facility.location?.address?.state]
          .filter(Boolean)
          .join(", "),
      }
    : null;

  if (!paymentData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-4">No Booking Found</h2>
        <button onClick={() => navigate("/map")} className="text-blue-600 underline">Go to Maps</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 animate-fadeIn">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
         
         <div className="relative bg-success p-8 text-center text-white">
            <div className="relative z-10 mb-4 flex justify-center font-bold">
               <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-success shadow-lg">
                  <Check className="h-10 w-10" />
               </div>
            </div>
            <h1 className="relative z-10 mb-2 text-3xl font-bold">Booking Confirmed!</h1>
            <p className="relative z-10 font-medium text-white/80">Thank you for choosing ParkEase</p>
         </div>

         <div className="p-8">
            <div className="mb-8 flex flex-col items-center justify-center border-b border-dashed border-border pb-8">
               <p className="mb-2 text-sm font-bold uppercase tracking-wide text-textSecondary">Booking Reference</p>
               <h2 className="font-mono text-4xl font-bold tracking-wider text-secondary">{paymentData.bookingRef}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="rounded-xl border border-border bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-textSecondary">Facility</p>
                  <p className="font-bold text-textPrimary">{facility?.name}</p>
               </div>
               <div className="rounded-xl border border-border bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-textSecondary">Slot</p>
                  <p className="text-lg font-bold text-textPrimary">{selectedSlot?.slotId}</p>
               </div>
               <div className="rounded-xl border border-border bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-textSecondary">Check In</p>
                  <p className="font-semibold text-textPrimary">{formatDateTime(startTime)}</p>
               </div>
               <div className="rounded-xl border border-border bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase text-textSecondary">Check Out</p>
                  <p className="font-semibold text-textPrimary">{formatDateTime(endTime)}</p>
               </div>
            </div>
            <p className="mb-6 text-center text-xl font-bold text-primary">{formatCurrency(finalPrice)}</p>

            <div className="mb-8 flex flex-col items-center justify-center rounded-xl border border-border bg-gray-50 p-6">
               <p className="mb-4 text-sm font-bold text-textSecondary">Show this QR Code at Entry</p>
               <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                  <div className="flex h-48 w-48 items-center justify-center bg-secondary p-4 text-center text-white">
                     <div>
                       <QrCode className="mx-auto mb-2 h-14 w-14 text-white" />
                       <p className="mt-2 break-all font-mono text-xs text-white/70">{qrCodeData}</p>
                     </div>
                  </div>
               </div>
            </div>

            {destination && (
              <div className="mt-8 border-t border-border pt-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-black text-secondary">Navigate to Your Parking Slot</h2>
                  <GoogleMapsButton destination={destination} />
                </div>
                <NavigationMap
                  destination={destination}
                  bookingRef={paymentData.bookingRef}
                  slotId={selectedSlot?.slotId}
                  className="h-[calc(100vh-280px)] min-h-[400px]"
                />
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button onClick={() => navigate("/bookings")} className="btn-secondary flex-1">
                View My Bookings
              </button>
              <button onClick={() => navigate("/map")} className="btn-primary flex-1">
                Go to Home
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}
