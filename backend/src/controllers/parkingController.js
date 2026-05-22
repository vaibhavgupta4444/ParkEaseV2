import ParkingLot from "../models/ParkingLot.js";

/**
 * Get nearby parking lots based on user location
 * Query params: latitude, longitude, radius (in km), maxPrice, minRating
 */
export const getNearbyParkingLots = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, maxPrice, minRating = 0 } = req.query;

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

    if (maxPrice) {
      query["pricing.hourlyRate"] = { $lte: parseFloat(maxPrice) };
    }

    const parkingLots = await ParkingLot.find(query)
      .select("name location pricing capacity amenities rating imageUrl operatingHours")
      .limit(50);

    // Calculate distance from user location for each parking lot
    const lotsWithDistance = parkingLots.map((lot) => {
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        lot.location.coordinates[1],
        lot.location.coordinates[0]
      );
      return {
        ...lot.toObject(),
        distance: distance.toFixed(2), // Distance in km
      };
    });

    return res.status(200).json({
      message: "Nearby parking lots retrieved",
      data: lotsWithDistance,
      count: lotsWithDistance.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get parking lot details by ID
 */
export const getParkingLotDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const parkingLot = await ParkingLot.findById(id);

    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    return res.status(200).json({
      message: "Parking lot details retrieved",
      data: parkingLot,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all parking lots (for admin/discovery)
 */
export const getAllParkingLots = async (req, res) => {
  try {
    const { page = 1, limit = 10, minRating = 0 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const parkingLots = await ParkingLot.find({ isActive: true, rating: { $gte: parseFloat(minRating) } })
      .select("name location pricing capacity amenities rating imageUrl")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ParkingLot.countDocuments({ isActive: true });

    return res.status(200).json({
      message: "Parking lots retrieved",
      data: parkingLots,
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
 * Get parking lots owned by the logged-in vendor
 */
export const getMyParkingLots = async (req, res) => {
  try {
    const lots = await ParkingLot.find({ owner: req.userId })
      .select("name location pricing capacity slots amenities rating imageUrl operatingHours description isActive createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Vendor parking lots retrieved",
      data: lots,
      count: lots.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Create a new parking lot (admin/owner only)
 */
export const createParkingLot = async (req, res) => {
  try {
    const { name, description, location, pricing, capacity, amenities, operatingHours, imageUrl, isActive } = req.body;

    if (!name || !location || !pricing || !capacity) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newParkingLot = await ParkingLot.create({
      name,
      location,
      description,
      pricing,
      capacity,
      amenities,
      operatingHours,
      imageUrl,
      isActive,
      owner: req.userId,
    });

    return res.status(201).json({
      message: "Parking lot created successfully",
      data: newParkingLot,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update parking lot (owner only)
 */
export const updateParkingLot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, capacity, pricing, amenities, operatingHours, imageUrl, isActive } = req.body;

    const parkingLot = await ParkingLot.findById(id);

    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    if (parkingLot.owner?.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to update this parking lot" });
    }

    if (name) parkingLot.name = name;
    if (description !== undefined) parkingLot.description = description;
    if (location) parkingLot.location = location;
    if (capacity) parkingLot.capacity = capacity;
    if (pricing) parkingLot.pricing = pricing;
    if (amenities) parkingLot.amenities = amenities;
    if (operatingHours) parkingLot.operatingHours = operatingHours;
    if (imageUrl !== undefined) parkingLot.imageUrl = imageUrl;
    if (isActive !== undefined) parkingLot.isActive = isActive;

    await parkingLot.save();

    return res.status(200).json({
      message: "Parking lot updated successfully",
      data: parkingLot,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete parking lot (owner only)
 */
export const deleteParkingLot = async (req, res) => {
  try {
    const { id } = req.params;
    const parkingLot = await ParkingLot.findById(id);

    if (!parkingLot) {
      return res.status(404).json({ message: "Parking lot not found" });
    }

    if (parkingLot.owner?.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to delete this parking lot" });
    }

    await parkingLot.deleteOne();

    return res.status(200).json({ message: "Parking lot deleted successfully" });
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
