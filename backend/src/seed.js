import dotenv from "dotenv";
import mongoose from "mongoose";
import ParkingLot from "./models/ParkingLot.js";
import ChargingStation from "./models/ChargingStation.js";

dotenv.config();

const parkingLots = [
  {
    name: "Sultanpur Central Parking",
    description: "Covered parking near the market area.",
    location: {
      type: "Point",
      coordinates: [82.0808, 26.2878],
      address: {
        street: "Civil Lines Road",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    pricing: {
      hourlyRate: 20,
      dailyRate: 120,
      monthlyRate: 1600,
      currency: "INR",
    },
    capacity: {
      total: 120,
      available: 48,
      reserved: 10,
    },
    amenities: ["24/7 surveillance", "covered parking", "lighting"],
    operatingHours: {
      opens: "06:00",
      closes: "23:00",
      is24Hours: false,
    },
    rating: 4.2,
    totalReviews: 86,
    imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a",
  },
  {
    name: "Awadh City Deck",
    description: "Multi-level deck with fast entry/exit.",
    location: {
      type: "Point",
      coordinates: [82.0611, 26.2914],
      address: {
        street: "Station Road",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    pricing: {
      hourlyRate: 18,
      dailyRate: 110,
      monthlyRate: 1500,
      currency: "INR",
    },
    capacity: {
      total: 90,
      available: 36,
      reserved: 8,
    },
    amenities: ["24/7 surveillance", "lighting", "fast entry/exit"],
    operatingHours: {
      opens: "05:30",
      closes: "22:30",
      is24Hours: false,
    },
    rating: 4.0,
    totalReviews: 62,
    imageUrl: "https://images.unsplash.com/photo-1503362516536-635e272c3c4c",
  },
  {
    name: "Gomti View Lot",
    description: "Open-air parking near riverfront.",
    location: {
      type: "Point",
      coordinates: [82.0894, 26.2765],
      address: {
        street: "Gomti Nagar Extension",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    pricing: {
      hourlyRate: 15,
      dailyRate: 90,
      monthlyRate: 1300,
      currency: "INR",
    },
    capacity: {
      total: 70,
      available: 29,
      reserved: 5,
    },
    amenities: ["lighting", "wheelchair accessible"],
    operatingHours: {
      opens: "06:30",
      closes: "22:00",
      is24Hours: false,
    },
    rating: 3.8,
    totalReviews: 41,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
  },
  {
    name: "Lucknow Bypass Lot",
    description: "High-capacity lot close to the bypass.",
    location: {
      type: "Point",
      coordinates: [82.0692, 26.2698],
      address: {
        street: "NH-330",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    pricing: {
      hourlyRate: 16,
      dailyRate: 95,
      monthlyRate: 1350,
      currency: "INR",
    },
    capacity: {
      total: 100,
      available: 40,
      reserved: 7,
    },
    amenities: ["lighting", "fast entry/exit"],
    operatingHours: {
      opens: "06:00",
      closes: "23:00",
      is24Hours: false,
    },
    rating: 4.1,
    totalReviews: 74,
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
  },
  {
    name: "Sultanpur North Hub (6 km)",
    description: "Parking hub about 6 km from the center.",
    location: {
      type: "Point",
      coordinates: [82.1334, 26.3370],
      address: {
        street: "NH-731",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    pricing: {
      hourlyRate: 14,
      dailyRate: 80,
      monthlyRate: 1200,
      currency: "INR",
    },
    capacity: {
      total: 80,
      available: 33,
      reserved: 4,
    },
    amenities: ["24/7 surveillance", "lighting"],
    operatingHours: {
      opens: "05:00",
      closes: "22:00",
      is24Hours: false,
    },
    rating: 3.9,
    totalReviews: 35,
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
  {
    name: "Sultanpur South Hub (6 km)",
    description: "Spacious lot about 6 km from the center.",
    location: {
      type: "Point",
      coordinates: [82.0134, 26.2290],
      address: {
        street: "Kadipur Road",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    pricing: {
      hourlyRate: 14,
      dailyRate: 80,
      monthlyRate: 1200,
      currency: "INR",
    },
    capacity: {
      total: 85,
      available: 30,
      reserved: 4,
    },
    amenities: ["lighting", "wheelchair accessible"],
    operatingHours: {
      opens: "05:30",
      closes: "22:30",
      is24Hours: false,
    },
    rating: 3.7,
    totalReviews: 28,
    imageUrl: "https://images.unsplash.com/photo-1504805572947-34fad45aed93",
  },
];

const chargingStations = [
  {
    name: "Sultanpur EV Plaza",
    description: "Fast chargers near the main market.",
    location: {
      type: "Point",
      coordinates: [82.0786, 26.2849],
      address: {
        street: "Shivaji Nagar",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    chargerTypes: ["Level 2", "DC Fast Charging", "CCS"],
    capacity: {
      total: 16,
      available: 6,
      reserved: 2,
    },
    pricing: {
      type: "per_kwh",
      rate: 12,
      currency: "INR",
    },
    connectorDetails: [
      { type: "CCS", available: 4, reserved: 1 },
      { type: "Type 2", available: 2, reserved: 1 },
    ],
    amenities: ["wifi", "charging lounge", "restroom"],
    operatingHours: {
      opens: "00:00",
      closes: "23:59",
      is24Hours: true,
    },
    rating: 4.4,
    totalReviews: 48,
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    provider: "ChargeUp",
  },
  {
    name: "Awadh EV Hub",
    description: "Reliable Level 2 chargers near the bus stand.",
    location: {
      type: "Point",
      coordinates: [82.0629, 26.2886],
      address: {
        street: "Bus Stand Road",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    chargerTypes: ["Level 2", "CCS"],
    capacity: {
      total: 12,
      available: 4,
      reserved: 1,
    },
    pricing: {
      type: "per_hour",
      rate: 45,
      currency: "INR",
    },
    connectorDetails: [
      { type: "Type 2", available: 3, reserved: 1 },
      { type: "CCS", available: 1, reserved: 0 },
    ],
    amenities: ["parking nearby"],
    operatingHours: {
      opens: "06:00",
      closes: "22:30",
      is24Hours: false,
    },
    rating: 4.1,
    totalReviews: 32,
    imageUrl: "https://images.unsplash.com/photo-1495562569060-2eec283d3391",
    provider: "AwadhCharge",
  },
  {
    name: "Gomti EV Point",
    description: "Compact charging near riverfront parking.",
    location: {
      type: "Point",
      coordinates: [82.0902, 26.2744],
      address: {
        street: "Gomti Nagar",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    chargerTypes: ["Level 1", "Level 2"],
    capacity: {
      total: 10,
      available: 5,
      reserved: 1,
    },
    pricing: {
      type: "per_hour",
      rate: 30,
      currency: "INR",
    },
    connectorDetails: [
      { type: "Type 1", available: 3, reserved: 1 },
      { type: "Type 2", available: 2, reserved: 0 },
    ],
    amenities: ["parking nearby"],
    operatingHours: {
      opens: "06:00",
      closes: "21:00",
      is24Hours: false,
    },
    rating: 3.9,
    totalReviews: 21,
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    provider: "GomtiCharge",
  },
  {
    name: "Sultanpur EV Express",
    description: "Fast charging with lounge amenities.",
    location: {
      type: "Point",
      coordinates: [82.0668, 26.2742],
      address: {
        street: "NH-330",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    chargerTypes: ["DC Fast Charging", "CCS", "CHAdeMO"],
    capacity: {
      total: 14,
      available: 6,
      reserved: 2,
    },
    pricing: {
      type: "per_kwh",
      rate: 14,
      currency: "INR",
    },
    connectorDetails: [
      { type: "CCS", available: 4, reserved: 1 },
      { type: "CHAdeMO", available: 2, reserved: 1 },
    ],
    amenities: ["wifi", "charging lounge", "fast charging"],
    operatingHours: {
      opens: "00:00",
      closes: "23:59",
      is24Hours: true,
    },
    rating: 4.3,
    totalReviews: 58,
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    provider: "ExpressCharge",
  },
  {
    name: "Sultanpur North EV (6 km)",
    description: "Charging hub about 6 km from the center.",
    location: {
      type: "Point",
      coordinates: [82.1334, 26.3370],
      address: {
        street: "NH-731",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    chargerTypes: ["Level 2", "DC Fast Charging", "CCS"],
    capacity: {
      total: 18,
      available: 7,
      reserved: 2,
    },
    pricing: {
      type: "per_kwh",
      rate: 13,
      currency: "INR",
    },
    connectorDetails: [
      { type: "CCS", available: 5, reserved: 1 },
      { type: "Type 2", available: 2, reserved: 1 },
    ],
    amenities: ["restroom", "fast charging"],
    operatingHours: {
      opens: "00:00",
      closes: "23:59",
      is24Hours: true,
    },
    rating: 4.1,
    totalReviews: 40,
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    provider: "NorthCharge",
  },
  {
    name: "Sultanpur South EV (6 km)",
    description: "Charging hub about 6 km from the center.",
    location: {
      type: "Point",
      coordinates: [82.0134, 26.2290],
      address: {
        street: "Kadipur Road",
        city: "Sultanpur",
        state: "UP",
        zipCode: "228001",
      },
    },
    chargerTypes: ["Level 1", "Level 2"],
    capacity: {
      total: 12,
      available: 5,
      reserved: 1,
    },
    pricing: {
      type: "per_hour",
      rate: 35,
      currency: "INR",
    },
    connectorDetails: [
      { type: "Type 1", available: 3, reserved: 1 },
      { type: "Type 2", available: 2, reserved: 0 },
    ],
    amenities: ["parking nearby"],
    operatingHours: {
      opens: "06:00",
      closes: "21:30",
      is24Hours: false,
    },
    rating: 3.8,
    totalReviews: 27,
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    provider: "SouthCharge",
  },
];

const seed = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in the environment");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding");

    await ParkingLot.deleteMany({});
    await ChargingStation.deleteMany({});

    await ParkingLot.insertMany(parkingLots);
    await ChargingStation.insertMany(chargingStations);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
