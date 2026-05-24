export async function fetchNearbyMetroStations(lat, lng, radiusMeters = 2000) {
  const query = `
    [out:json][timeout:10];
    (
      node["station"="subway"](around:${radiusMeters},${lat},${lng});
      node["railway"="station"]["subway"="yes"](around:${radiusMeters},${lat},${lng});
      node["railway"="subway_entrance"](around:${radiusMeters},${lat},${lng});
      node["public_transport"="station"]["train"="yes"](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });

    if (!response.ok) {
      throw new Error("Overpass API failed");
    }

    const data = await response.json();

    return data.elements.map(station => ({
      id: station.id,
      name: station.tags?.name || station.tags?.['name:en'] || 'Metro Station',
      lat: station.lat,
      lng: station.lon,
      operator: station.tags?.operator || null,
      network: station.tags?.network || null,
      lines: station.tags?.lines || station.tags?.line || null,
    }));
  } catch (error) {
    console.warn('Metro fetch failed:', error);
    return []; // gracefully fallback to empty
  }
}
