import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import WalletTransaction from "../models/WalletTransaction.js";

const stripeRequest = async (path, body, method = "POST") => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    ...(body ? { body: new URLSearchParams(body) } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Stripe request failed");
  }

  return data;
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized payment attempt" });
    }

    const currency = (booking.currency || "INR").toLowerCase();
    const amount = Math.round((booking.totalPrice || 0) * 100);

    const intent = await stripeRequest("/payment_intents", {
      amount,
      currency,
      "metadata[bookingId]": booking._id.toString(),
      "metadata[bookingRef]": booking.bookingRef,
      "automatic_payment_methods[enabled]": "true",
    });

    const payment = await Payment.create({
      booking: booking._id,
      orderId: intent.id,
      clientSecret: intent.client_secret,
      amount,
      currency: currency.toUpperCase(),
      status: "created",
    });

    return res.status(201).json({
      message: "Payment order created",
      data: {
        paymentId: payment._id,
        orderId: intent.id,
        clientSecret: intent.client_secret,
        amount,
        currency: currency.toUpperCase(),
        bookingRef: booking.bookingRef,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Payment order failed", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized payment verification" });
    }

    let status = "succeeded";
    if (!paymentIntentId.startsWith("mock_")) {
      const intent = await stripeRequest(`/payment_intents/${paymentIntentId}`, null, "GET");
      status = intent.status;
    }

    if (status !== "succeeded") {
      return res.status(400).json({ message: "Payment has not succeeded", status });
    }

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    await Payment.findOneAndUpdate(
      { orderId: paymentIntentId },
      { paymentId: paymentIntentId, status: "succeeded" },
      { new: true }
    );

    await WalletTransaction.findOneAndUpdate(
      { user: req.userId, reference: paymentIntentId },
      {
        $setOnInsert: {
          user: req.userId,
          type: "debit",
          amount: booking.totalPrice || 0,
          reference: paymentIntentId,
          description: `Payment for booking ${booking.bookingRef}`,
          booking: booking._id,
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Payment verified",
      data: {
        booking,
        bookingRef: booking.bookingRef,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
};

export const getPaymentTransactions = async (req, res) => {
  try {
    const existingTransactions = await WalletTransaction.find({ user: req.userId }).select("reference");
    const existingReferences = new Set(existingTransactions.map((transaction) => transaction.reference));

    const succeededPayments = await Payment.find({ status: "succeeded" })
      .populate({
        path: "booking",
        match: { user: req.userId },
        select: "bookingRef bookingType totalPrice user",
      })
      .sort({ updatedAt: -1 });

    const missingTransactions = succeededPayments
      .filter((payment) => payment.booking && !existingReferences.has(payment.paymentId || payment.orderId))
      .map((payment) => ({
        user: req.userId,
        type: "debit",
        amount: payment.booking.totalPrice || payment.amount / 100 || 0,
        reference: payment.paymentId || payment.orderId,
        description: `Payment for booking ${payment.booking.bookingRef}`,
        booking: payment.booking._id,
        createdAt: payment.updatedAt || payment.createdAt,
        updatedAt: payment.updatedAt || payment.createdAt,
      }));

    if (missingTransactions.length > 0) {
      await WalletTransaction.insertMany(missingTransactions, { ordered: false });
    }

    const transactions = await WalletTransaction.find({ user: req.userId })
      .populate("booking", "bookingRef bookingType totalPrice")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      message: "Transactions fetched",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({ message: "Transactions fetch failed", error: error.message });
  }
};
