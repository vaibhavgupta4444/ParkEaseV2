export const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee";
export const CHARGER_TYPES = ["Type 1", "Type 2", "CCS", "CHAdeMO", "GB/T"];
export const EV_AMENITIES = ["waiting area", "restrooms", "cafe nearby", "wifi", "fast charging"];

export const emptyParkingForm = {
  name: "",
  description: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  lat: "",
  lng: "",
  hourlyRate: "",
  currency: "INR",
  total: "",
  available: "",
  amenities: "",
  is24Hours: false,
  opens: "",
  closes: "",
  imageUrl: "",
  isActive: true,
};

export const emptyChargingForm = {
  name: "",
  description: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  lat: "",
  lng: "",
  chargerTypes: [],
  speedKw: 22,
  total: "",
  available: "",
  pricePerKwh: "",
  pricePerSession: "",
  currency: "INR",
  amenities: [],
  provider: "",
  is24Hours: false,
  opens: "",
  closes: "",
  imageUrl: "",
  isActive: true,
};

export const emptyCoupon = {
  code: "",
  discountType: "percentage",
  value: "",
  expiryDate: "",
  maxUses: 100,
};

export const emptyProfile = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  businessAddress: "",
  gstNumber: "",
  bankDetails: { accountHolder: "", accountNumber: "", ifsc: "", bankName: "" },
  documents: [],
};
