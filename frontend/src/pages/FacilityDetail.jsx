import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, CheckCircle, Image, Plug, Star } from "lucide-react";
import { getParkingLotDetails } from "../services/parkingService";
import { getChargingStationDetails } from "../services/chargingService";
import BackButton from "../components/ui/BackButton";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";
import { formatCurrency, getApiErrorMessage } from "../utils/formatters";

export default function FacilityDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") || "parking"; // parking or ev

  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState(() => {
     const d = new Date();
     d.setMinutes(0,0,0);
     return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = useState(() => {
     const d = new Date();
     d.setHours(d.getHours() + 1);
     d.setMinutes(0,0,0);
     return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = type === "parking" 
            ? await getParkingLotDetails(id) 
            : await getChargingStationDetails(id);
        setFacility(res.data);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, type]);

  if (loading) {
    return (
      <div className="page-shell">
        <Skeleton className="h-12 w-64" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <BackButton label="Back to Map" to="/map" />
        <ErrorState message={error} />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="page-shell">
        <BackButton label="Back to Map" to="/map" />
        <ErrorState message="Facility not found" />
      </div>
    );
  }

  const isParking = type === "parking";

  // Calculate live price based on duration and selected slot
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
  const baseRate = selectedSlot?.pricePerHour || facility.pricing?.hourlyRate || facility.pricing?.rate || 0;
  // Apply a basic peak multiplier logic (mock)
  const isPeak = start.getHours() >= 17 && start.getHours() <= 21;
  let totalPrice = hours * baseRate;
  if (isPeak) totalPrice *= 1.25; // 25% peak surcharge

  const handleBookNext = () => {
     if (!selectedSlot) {
         toast.error("Please select a slot from the grid");
         return;
     }
     navigate(`/booking/confirm`, {
         state: {
             facility,
             type,
             selectedSlot,
             startTime,
             endTime,
             hours,
             totalPrice,
             baseRate,
             isPeak
         }
     });
  };

  return (
    <div className="min-h-screen bg-background pb-20 animate-fadeIn">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-surface px-6 py-4 shadow-sm">
         <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-textSecondary transition hover:bg-blue-50 hover:text-primary" aria-label="Back">
             <ArrowLeft size={18} />
         </button>
         <div>
            <h1 className="text-xl font-bold text-secondary">{facility.name}</h1>
            <p className="text-sm text-textSecondary">
               {facility.location?.address?.street}, {facility.location?.address?.city}
            </p>
         </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-3">
         
         {/* Main Details (Images + Info + Grid) */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery */}
            <div className="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
               <div className="relative h-64 w-full bg-gray-200 md:h-96">
                  {facility.imageUrl ? (
                     <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover" />
                  ) : (
                     <div className="flex h-full w-full flex-col items-center justify-center text-textMuted">
                        <Image className="mb-2 h-10 w-10" />
                        <span>No images available</span>
                     </div>
                  )}
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 font-bold text-textPrimary shadow-sm backdrop-blur">
                     <Star className="h-4 w-4 fill-warning text-warning" /> {facility.rating || "New"}
                  </div>
               </div>
               
               {/* Quick Info Bar */}
               <div className="flex divide-x divide-border border-t border-border">
                  <div className="flex-1 p-4 text-center">
                     <p className="mb-1 text-xs font-bold uppercase tracking-wide text-textSecondary">Status</p>
                     <p className="font-bold text-success">Open Now</p>
                  </div>
                  <div className="flex-1 p-4 text-center">
                     <p className="mb-1 text-xs font-bold uppercase tracking-wide text-textSecondary">Available</p>
                     <p className="font-bold text-textPrimary">{facility.capacity?.available} / {facility.capacity?.total}</p>
                  </div>
                  <div className="flex-1 p-4 text-center hidden sm:block">
                     <p className="mb-1 text-xs font-bold uppercase tracking-wide text-textSecondary">Rate</p>
                     <p className="font-bold text-textPrimary">{formatCurrency(facility.pricing?.hourlyRate || facility.pricing?.rate)}/hr</p>
                  </div>
               </div>
            </div>

            {/* Amenities */}
            <div className="app-card">
               <h3 className="mb-4 text-lg font-bold text-secondary">Amenities & Features</h3>
               <div className="flex flex-wrap gap-3">
                  {facility.amenities?.map((amenity, idx) => (
                     <span key={idx} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-textPrimary">
                        <CheckCircle className="h-4 w-4 text-success" /> {amenity}
                     </span>
                  ))}
                  {facility.chargerTypes?.map((ct, idx) => (
                     <span key={idx} className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-primary">
                        <Plug className="h-4 w-4" /> {ct}
                     </span>
                  ))}
               </div>
            </div>

            {/* Slot View Grid Component */}
            <div className="app-card">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-secondary">Select your {isParking ? "Spot" : "Charger"}</h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                     <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500"></div> Available</span>
                     <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-rose-500"></div> Occupied</span>
                     <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-500"></div> Maint.</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {facility.slots?.length > 0 ? (
                     facility.slots.map(slot => {
                        let statusColor = "bg-green-100 text-green-700 border-green-100 hover:bg-success hover:text-white hover:border-success cursor-pointer";
                        let isAvail = true;
                        if (!slot.isAvailable) {
                           statusColor = "bg-red-50 text-textMuted border-red-100 cursor-not-allowed";
                           isAvail = false;
                        } else if (slot.status === "maintenance") {
                           statusColor = "bg-yellow-50 text-warning border-yellow-100 cursor-not-allowed";
                           isAvail = false;
                        }

                        const isSelected = selectedSlot?.slotId === slot.slotId;
                        if (isSelected) statusColor = "bg-secondary text-white border-secondary shadow-md transform scale-105";

                        return (
                           <button 
                              key={slot._id || slot.slotId}
                              disabled={!isAvail}
                              onClick={() => setSelectedSlot(slot)}
                              className={`flex h-16 flex-col items-center justify-center rounded-xl border-2 transition-all ${statusColor}`}
                           >
                              <span className="font-bold">{slot.slotId}</span>
                              <span className="text-[10px] opacity-80">{slot.type}</span>
                           </button>
                        );
                     })
                  ) : (
                     <div className="col-span-full py-8 text-center text-textSecondary">
                        Visual slot map is not configured for this facility.
                     </div>
                  )}
               </div>
            </div>

         </div>

         {/* Right Booking Panel */}
         <div className="space-y-6">
            <div className="sticky top-24 rounded-xl border border-border bg-surface p-6 shadow-xl">
               <h3 className="mb-6 border-b border-border pb-4 text-xl font-bold text-secondary">Booking Details</h3>
               
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="field-label">Check In</label>
                     <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="field-input" />
                  </div>
                  <div>
                     <label className="field-label">Check Out</label>
                     <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="field-input" />
                  </div>
               </div>

               {selectedSlot ? (
                  <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                     <p className="text-sm text-blue-800 font-medium flex justify-between">
                        <span>Selected Slot:</span>
                        <span className="font-bold">{selectedSlot.slotId} ({selectedSlot.type})</span>
                     </p>
                  </div>
               ) : (
                  <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 text-center text-sm text-slate-500">
                     Please select a slot from the grid.
                  </div>
               )}

               <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600 text-sm">
                     <span>Duration</span>
                     <span className="font-bold text-slate-900">{hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-sm">
                     <span>Base Rate</span>
                     <span className="font-bold text-slate-900">{facility.pricing?.currency} {baseRate}/hr</span>
                  </div>
                  {isPeak && (
                     <div className="flex justify-between text-rose-600 text-sm">
                        <span>Peak Surcharge</span>
                        <span className="font-bold">+ 25%</span>
                     </div>
                  )}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                     <span className="text-slate-900 font-bold">Total Amount</span>
                     <span className="text-2xl font-bold text-primary">
                        {formatCurrency(totalPrice > 0 ? totalPrice : 0)}
                     </span>
                  </div>
               </div>

               <button 
                  onClick={handleBookNext}
                  className="btn-primary w-full py-3"
               >
                  Continue to Booking
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
