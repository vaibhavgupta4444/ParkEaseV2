const METRO_CITIES = [
  'delhi', 'mumbai', 'bangalore', 'bengaluru', 'chennai',
  'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'lucknow',
  'jaipur', 'kochi', 'nagpur', 'noida', 'gurugram', 'gurgaon'
];

export function cityHasMetro(cityName) {
  if (!cityName) return true; // if unknown, try anyway
  return METRO_CITIES.some(city =>
    cityName.toLowerCase().includes(city)
  );
}

export async function getCityFromCoordinates(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.address?.city || data?.address?.town || data?.address?.county || null;
  } catch (error) {
    console.warn("Reverse geocoding failed:", error);
    return null;
  }
}
