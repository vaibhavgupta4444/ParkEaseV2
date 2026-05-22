import ChargingStation from "../models/ChargingStation.js";

/**
 * Get nearby EV charging stations based on user location
 * Query params: latitude, longitude, radius (in km), chargerType, maxPrice, minRating
 */
export const getNearbyChargingStations = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, chargerType, maxPrice, minRating = 0 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        },
      },
      isActive: true,
      rating: { $gte: parseFloat(minRating) },
    };

    if (chargerType) {
      query.chargerTypes = { $in: [chargerType] };
    }

    if (maxPrice) {
      query["pricing.rate"] = { $lte: parseFloat(maxPrice) };
    }

    const chargingStations = await ChargingStation.find(query)
      .select(
        "name location chargerTypes capacity pricing amenities rating imageUrl operatingHours provider"
      )
      .limit(50);

    // Calculate distance from user location for each charging station
    const stationsWithDistance = chargingStations.map((station) => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        station.location.coordinates[1],
        station.location.coordinates[0]
      );
      return {
        ...station.toObject(),
        distance: distance.toFixed(2), // Distance in km
      };
    });

    return res.status(200).json({
      message: "Nearby charging stations retrieved",
      data: stationsWithDistance,
      count: stationsWithDistance.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get charging station details by ID
 */
export const getChargingStationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const chargingStation = await ChargingStation.findById(id);

    if (!chargingStation) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    return res.status(200).json({
      message: "Charging station details retrieved",
      data: chargingStation,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all charging stations (for admin/discovery)
 */
export const getAllChargingStations = async (req, res) => {
  try {
    const { page = 1, limit = 10, chargerType, minRating = 0 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { isActive: true, rating: { $gte: parseFloat(minRating) } };

    if (chargerType) {
      query.chargerTypes = { $in: [chargerType] };
    }

    const chargingStations = await ChargingStation.find(query)
      .select(
        "name location chargerTypes capacity pricing amenities rating imageUrl provider"
      )
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChargingStation.countDocuments(query);

    return res.status(200).json({
      message: "Charging stations retrieved",
      data: chargingStations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get charging stations owned by the logged-in vendor
 */
export const getMyChargingStations = async (req, res) => {
  try {
    const stations = await ChargingStation.find({ owner: req.userId })
      .select(
        "name location chargerTypes chargerType speedKw capacity pricing pricePerSession slots amenities rating imageUrl operatingHours provider description isActive createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Vendor charging stations retrieved",
      data: stations,
      count: stations.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new charging station (admin/owner only)
 */
export const createChargingStation = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      chargerTypes,
      chargerType,
      speedKw,
      capacity,
      pricing,
      pricePerSession,
      connectorDetails,
      amenities,
      operatingHours,
      provider,
      imageUrl,
      isActive,
    } = req.body;

    if (!name || !location || !chargerTypes || !capacity || !pricing) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newChargingStation = await ChargingStation.create({
      name,
      description,
      location,
      chargerTypes,
      chargerType,
      speedKw,
      capacity,
      pricing,
      pricePerSession,
      connectorDetails,
      amenities,
      operatingHours,
      provider,
      imageUrl,
      isActive,
      owner: req.userId,
    });

    return res.status(201).json({
      message: "Charging station created successfully",
      data: newChargingStation,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update charging station (owner only)
 */
export const updateChargingStation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      location,
      capacity,
      pricing,
      chargerTypes,
      chargerType,
      speedKw,
      amenities,
      connectorDetails,
      operatingHours,
      provider,
      imageUrl,
      isActive,
      pricePerSession,
    } = req.body;

    const chargingStation = await ChargingStation.findById(id);

    if (!chargingStation) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    if (chargingStation.owner?.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this charging station" });
    }

    if (name) chargingStation.name = name;
    if (description !== undefined) chargingStation.description = description;
    if (location) chargingStation.location = location;
    if (capacity) chargingStation.capacity = capacity;
    if (pricing) chargingStation.pricing = pricing;
    if (chargerTypes) chargingStation.chargerTypes = chargerTypes;
    if (chargerType !== undefined) chargingStation.chargerType = chargerType;
    if (speedKw !== undefined) chargingStation.speedKw = speedKw;
    if (amenities) chargingStation.amenities = amenities;
    if (connectorDetails) chargingStation.connectorDetails = connectorDetails;
    if (operatingHours) chargingStation.operatingHours = operatingHours;
    if (provider !== undefined) chargingStation.provider = provider;
    if (imageUrl !== undefined) chargingStation.imageUrl = imageUrl;
    if (isActive !== undefined) chargingStation.isActive = isActive;
    if (pricePerSession !== undefined) chargingStation.pricePerSession = pricePerSession;

    await chargingStation.save();

    return res.status(200).json({
      message: "Charging station updated successfully",
      data: chargingStation,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete charging station (owner only)
 */
export const deleteChargingStation = async (req, res) => {
  try {
    const { id } = req.params;
    const chargingStation = await ChargingStation.findById(id);

    if (!chargingStation) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    if (chargingStation.owner?.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this charging station" });
    }

    await chargingStation.deleteOne();

    return res.status(200).json({ message: "Charging station deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Helper function to calculate distance between two coordinates
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
