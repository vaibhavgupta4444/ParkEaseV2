/**
 * Get nearby metro stations from Overpass API
 * Query params: latitude, longitude, radius (in meters)
 */
export const getNearbyMetroStations = async (req, res) => {
  try {
    const { latitude, longitude, radius = 2000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const query = `
      [out:json][timeout:10];
      (
        node["station"="subway"](around:${radius},${latitude},${longitude});
        node["railway"="station"]["subway"="yes"](around:${radius},${latitude},${longitude});
        node["railway"="subway_entrance"](around:${radius},${latitude},${longitude});
        node["public_transport"="station"]["train"="yes"](around:${radius},${latitude},${longitude});
      );
      out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "User-Agent": "ParkEase/1.0 (contact@parkease.com)",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API responded with status ${response.status}`);
    }

    const data = await response.json();

    const formattedStations = (data.elements || []).map((station) => ({
      id: station.id,
      name: station.tags?.name || station.tags?.["name:en"] || "Metro Station",
      lat: station.lat,
      lng: station.lon,
      operator: station.tags?.operator || null,
      network: station.tags?.network || null,
      lines: station.tags?.lines || station.tags?.line || null,
    }));

    return res.status(200).json({
      message: "Metro stations retrieved successfully",
      data: formattedStations,
    });
  } catch (error) {
    console.error("Metro fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch metro stations", error: error.message });
  }
};
