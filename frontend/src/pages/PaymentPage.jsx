import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { ShieldCheck, CreditCard, ArrowLeft, AlertCircle } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { createPaymentOrder, verifyPayment } from "../services/paymentService";
import { getApiErrorMessage, formatCurrency, formatDateTime } from "../utils/formatters";
import { getBookingById } from "../services/bookingService";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const isStripeConfigured =
  stripePublishableKey && stripePublishableKey !== "pk_test_your_key" && stripePublishableKey.startsWith("pk_");
const stripePromise = isStripeConfigured ? loadStripe(stripePublishableKey) : null;

export default function PaymentPage({ token }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.paymentBooking || location.state?.booking || null);
  const { facility, finalPrice } = location.state || {};

  const [bookingLoading, setBookingLoading] = useState(!booking);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    if (booking || !token || !id) return;
    let active = true;
    setBookingLoading(true);
    getBookingById(id, token)
      .then((res) => {
        if (active) setBooking(res.data);
      })
      .catch((err) => {
        if (active) toast.error(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setBookingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [booking, id, token]);

  useEffect(() => {
    if (!booking || !token) return;
    if (booking.paymentStatus === "paid") {
      toast.error("This booking is already paid.");
      navigate("/bookings", { replace: true });
      return;
    }

    let active = true;
    setSetupError("");
    setPaymentOrder(null);
    setOrderLoading(true);

    const setupPayment = async () => {
      try {
        if (!isStripeConfigured) {
          throw new Error("Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env.");
        }

        const order = await createPaymentOrder(booking._id, token);
        if (active) setPaymentOrder(order.data);
      } catch (err) {
        if (active) setSetupError(getApiErrorMessage(err));
      } finally {
        if (active) setOrderLoading(false);
      }
    };

    setupPayment();
    return () => {
      active = false;
    };
  }, [booking, navigate, token]);

  if (bookingLoading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle size={40} className="text-error" />
        <p className="font-semibold text-textPrimary">Booking not found.</p>
        <button onClick={() => navigate("/bookings")} className="btn-primary">
          Back to My Bookings
        </button>
      </div>
    );
  }

  const facilityInfo = facility || booking.parkingLot || booking.chargingStation;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12 animate-fadeIn">
      <button
        type="button"
        onClick={() => navigate("/bookings")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Bookings
      </button>

      <h1 className="mb-2 text-2xl font-bold text-secondary">Complete Payment</h1>
      <p className="mb-8 text-sm text-textSecondary">Secure payment powered by Stripe</p>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-textSecondary">
              {booking.bookingType === "parking" ? "Parking Facility" : "EV Charging Station"}
            </p>
            <h2 className="mt-1 text-lg font-bold text-secondary">{facilityInfo?.name || "Facility"}</h2>
            <p className="mt-0.5 text-sm text-textSecondary">
              Slot <strong>{booking.slotId}</strong> &middot; Ref <strong>{booking.bookingRef}</strong>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-textSecondary">Total</p>
            <p className="text-3xl font-black text-primary">{formatCurrency(booking.totalPrice)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3">
          <div>
            <p className="text-xs text-textSecondary">Entry</p>
            <p className="text-sm font-semibold text-textPrimary">{formatDateTime(booking.startTime)}</p>
          </div>
          <div>
            <p className="text-xs text-textSecondary">Exit</p>
            <p className="text-sm font-semibold text-textPrimary">{formatDateTime(booking.endTime)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          <h3 className="font-bold text-secondary">Card Details</h3>
        </div>

        {setupError && (
          <div className="mt-4 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-error" />
            <div>
              <p className="text-sm font-semibold text-error">Payment unavailable</p>
              <p className="mt-1 text-xs text-red-700">{setupError}</p>
            </div>
          </div>
        )}

        {orderLoading && !setupError && (
          <div className="rounded-xl border border-border bg-gray-50 p-4 text-sm font-medium text-textSecondary">
            Preparing secure payment...
          </div>
        )}

        {!setupError && paymentOrder && stripePromise && (
          <Elements stripe={stripePromise}>
            <StripeCardForm
              booking={booking}
              facility={facility}
              finalPrice={finalPrice}
              navigate={navigate}
              paymentOrder={paymentOrder}
              token={token}
            />
          </Elements>
        )}

        <p className="mt-4 text-center text-xs text-textMuted">
          Your payment info is encrypted and never stored on our servers.
        </p>
      </div>
    </div>
  );
}

function StripeCardForm({ booking, facility, finalPrice, navigate, paymentOrder, token }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardComplete, setCardComplete] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [paying, setPaying] = useState(false);

  const cardOptions = useMemo(
    () => ({
      hidePostalCode: true,
      style: {
        base: {
          color: "#0F172A",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "16px",
          lineHeight: "26px",
          "::placeholder": { color: "#94A3B8" },
        },
        invalid: { color: "#DC2626" },
      },
    }),
    []
  );

  const handlePay = async () => {
    const card = elements?.getElement(CardElement);
    if (!stripe || !elements || !card || !paymentOrder) {
      setStripeError("Payment form is still loading. Please wait a moment.");
      return;
    }

    if (!cardComplete) {
      setStripeError("Please enter complete card details.");
      return;
    }

    setPaying(true);
    setStripeError("");

    try {
      const result = await stripe.confirmCardPayment(paymentOrder.clientSecret, {
        payment_method: { card },
      });
      if (result.error) throw new Error(result.error.message);

      const verified = await verifyPayment(
        { bookingId: booking._id, paymentIntentId: result.paymentIntent.id },
        token
      );
      toast.success("Payment confirmed!");
      navigate("/booking/success", {
        state: {
          paymentData: verified.data,
          facility: facility || booking.parkingLot || booking.chargingStation,
          selectedSlot: { slotId: booking.slotId, type: booking.bookingType },
          startTime: booking.startTime,
          endTime: booking.endTime,
          finalPrice: finalPrice || booking.totalPrice,
        },
        replace: true,
      });
    } catch (err) {
      const message = getApiErrorMessage(err);
      setStripeError(message);
      toast.error(message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <div
        className={`rounded-xl border bg-gray-50 px-4 py-4 transition-shadow hover:shadow-sm focus-within:shadow-sm ${
          stripeError ? "border-error" : "border-border"
        }`}
        style={{ minHeight: 56 }}
      >
        <CardElement
          options={cardOptions}
          onChange={(event) => {
            setCardComplete(Boolean(event.complete));
            setStripeError(event.error?.message || "");
          }}
        />
      </div>

      {stripeError && <p className="mt-2 text-sm font-medium text-error">{stripeError}</p>}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handlePay}
          disabled={!stripe || paying}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3.5"
        >
          {paying
            ? <><LoadingSpinner /> Processing...</>
            : <><ShieldCheck size={18} /> Pay {formatCurrency(booking.totalPrice)}</>}
        </button>
        <button
          type="button"
          onClick={() => navigate("/bookings", { replace: true })}
          disabled={paying}
          className="btn-ghost w-full py-3 text-textSecondary"
        >
          Cancel Payment
        </button>
      </div>
    </>
  );
}
