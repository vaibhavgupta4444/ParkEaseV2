import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../ui/LoadingSpinner";
import { createPaymentOrder, verifyPayment } from "../../services/paymentService";
import { formatCurrency, getApiErrorMessage } from "../../utils/formatters";

let stripePromise;

const loadStripe = () => {
  if (window.Stripe) {
    return Promise.resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
  }

  if (!stripePromise) {
    stripePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY));
      script.onerror = () => reject(new Error("Unable to load Stripe"));
      document.head.appendChild(script);
    });
  }

  return stripePromise;
};

export default function StripePaymentPanel({ booking, token, onPaid }) {
  const cardRef = useRef(null);
  const stripeRef = useRef(null);
  const cardElementRef = useRef(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const setupPayment = async () => {
      if (!booking?._id || !token) return;

      setLoading(true);
      setError("");

      try {
        if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
          throw new Error("VITE_STRIPE_PUBLISHABLE_KEY is not configured");
        }

        const order = await createPaymentOrder(booking._id, token);
        const stripe = await loadStripe();
        const elements = stripe.elements({ clientSecret: order.data.clientSecret });
        const card = elements.create("card", {
          style: {
            base: {
              color: "#0f172a",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "16px",
              "::placeholder": { color: "#94a3b8" },
            },
            invalid: { color: "#e11d48" },
          },
        });

        if (!mounted) return;

        card.mount(cardRef.current);
        stripeRef.current = stripe;
        cardElementRef.current = card;
        setPaymentOrder(order.data);
        setReady(true);
      } catch (err) {
        const message = getApiErrorMessage(err);
        if (mounted) {
          setError(message);
          toast.error(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    setupPayment();

    return () => {
      mounted = false;
      cardElementRef.current?.unmount();
    };
  }, [booking?._id, token]);

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await stripeRef.current.confirmCardPayment(paymentOrder.clientSecret, {
        payment_method: {
          card: cardElementRef.current,
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const verified = await verifyPayment(
        { bookingId: booking._id, paymentIntentId: result.paymentIntent.id },
        token
      );
      toast.success("Payment verified successfully");
      onPaid?.(verified.data);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-primary">Payment</h4>
          <p className="mt-1 text-sm text-textSecondary">
            {formatCurrency(booking?.totalPrice)} · Ref {booking?.bookingRef}
          </p>
        </div>
        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-warning">
          Pending
        </span>
      </div>

      <div ref={cardRef} className="mt-4 rounded-xl border border-border bg-surface px-3 py-3" />

      {error && <p className="field-error">{error}</p>}
      {loading && <p className="mt-3 text-sm text-textSecondary">Preparing secure payment...</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={!ready || loading}
        className="btn-primary mt-4 flex w-full items-center justify-center gap-2"
      >
        {loading && <LoadingSpinner />}
        {loading ? "Processing..." : "Pay and confirm booking"}
      </button>
    </div>
  );
}
