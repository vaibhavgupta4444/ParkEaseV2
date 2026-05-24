import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { ShieldCheck, CreditCard, ArrowLeft, AlertCircle, Smartphone } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [upiId, setUpiId] = useState("");
  const [upiPaying, setUpiPaying] = useState(false);

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

  const handleUpiPay = async () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    setUpiPaying(true);
    try {
      // Create order if not already created
      let orderId = paymentOrder?.id;
      if (!orderId) {
        const order = await createPaymentOrder(booking._id, token);
        orderId = order.data.id;
      }
      
      // We're mocking the UPI payment success here. In a real app, you'd integrate with Razorpay/Stripe UPI.
      const verified = await verifyPayment(
        { bookingId: booking._id, paymentIntentId: orderId || "mock_upi_intent" },
        token
      );
      
      toast.success("UPI Payment successful!");
      navigate(`/bookings/${booking._id}`, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "UPI payment failed");
    } finally {
      setUpiPaying(false);
    }
  };

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
        <div className="mb-6 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              paymentMethod === "card" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard size={18} /> Card
            </div>
          </button>
          <button
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              paymentMethod === "upi" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setPaymentMethod("upi")}
          >
            <div className="flex items-center justify-center gap-2">
              <Smartphone size={18} /> UPI
            </div>
          </button>
        </div>

        {paymentMethod === "card" && (
          <>
            <div className="mb-5 flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              <h3 className="font-bold text-secondary">Card Details</h3>
            </div>

            {orderLoading && (
              <div className="rounded-xl border border-border bg-gray-50 p-4 text-sm font-medium text-textSecondary">
                Preparing secure payment...
              </div>
            )}

            {!orderLoading && !setupError && paymentOrder && stripePromise ? (
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
            ) : (
              !orderLoading && (
                <MockCardForm
                  booking={booking}
                  facility={facility}
                  finalPrice={finalPrice}
                  navigate={navigate}
                  token={token}
                  setupError={setupError}
                />
              )
            )}
        </>
        )}

        {paymentMethod === "upi" && (
          <div className="animate-fadeIn">
            <div className="mb-5 flex items-center justify-center">
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=parkease@upi&pn=ParkEase&am=${booking.totalPrice}&cu=INR`} 
                  alt="UPI QR Code" 
                  className="h-32 w-32 object-contain"
                />
              </div>
            </div>
            <p className="mb-4 text-center text-sm font-medium text-slate-600">Scan QR or enter UPI ID to pay</p>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="username@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleUpiPay}
                disabled={upiPaying || !upiId.trim()}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3.5"
              >
                {upiPaying
                  ? <><LoadingSpinner /> Processing...</>
                  : <><ShieldCheck size={18} /> Pay {formatCurrency(booking.totalPrice)}</>}
              </button>
              <button
                type="button"
                onClick={() => navigate("/bookings", { replace: true })}
                disabled={upiPaying}
                className="btn-ghost w-full py-3 text-textSecondary"
              >
                Cancel Payment
              </button>
            </div>
          </div>
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
      navigate(`/bookings/${booking._id}`, { replace: true });
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

function MockCardForm({ booking, facility, finalPrice, navigate, token, setupError }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [paying, setPaying] = useState(false);

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(\d{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) {
      setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setExpiry(val);
    }
  };

  const handleCvcChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) setCvc(val);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    if (expiry.length !== 5) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }
    if (cvc.length < 3) {
      toast.error("Please enter a valid CVC");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter cardholder name");
      return;
    }

    setPaying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const verified = await verifyPayment(
        { bookingId: booking._id, paymentIntentId: "mock_card_" + Date.now() },
        token
      );
      toast.success("Payment confirmed (Demo/Sandbox Mode)!");
      navigate(`/bookings/${booking._id}`, { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4 animate-fadeIn">
      {setupError && (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-600" />
          <div>
            <span className="font-bold">Sandbox Active:</span> Stripe keys unconfigured or offline. You can test with any mock card details below.
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Card Number</label>
        <div className="relative">
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={handleCardNumberChange}
            className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-wider"
            required
          />
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
          <input
            type="text"
            placeholder="MM/YY"
            value={expiry}
            onChange={handleExpiryChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CVC / CVV</label>
          <input
            type="password"
            placeholder="123"
            value={cvc}
            onChange={handleCvcChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cardholder Name</label>
        <input
          type="text"
          placeholder="Cardholder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <button
          type="submit"
          disabled={paying}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3.5"
        >
          {paying ? (
            <><LoadingSpinner /> Processing...</>
          ) : (
            <><ShieldCheck size={18} /> Pay {formatCurrency(booking.totalPrice)}</>
          )}
        </button>
      </div>
    </form>
  );
}
