/**
 * Fetches the user's current coordinates and resolves a human-readable 
 * local area/ward location name using reverse geocoding via OpenStreetMap.
 */
export const getWardByLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch address details from location service.');
          }

          const data = await response.json();
          const address = data.address || {};

          // Extract the closest specific local neighborhood indicator
          const localArea = 
            address.suburb || 
            address.neighbourhood || 
            address.quarter || 
            address.city_district || 
            address.municipality ||
            address.city;

          if (localArea) {
            resolve(localArea);
          } else {
            reject(new Error('Could not automatically determine a specific location for this spot.'));
          }
        } catch (error) {
          reject(new Error('Error identifying local area. Please enter your ward location manually.'));
        }
      },
      (geoError) => {
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            reject(new Error('Location access denied. Please allow permissions or enter manually.'));
            break;
          case geoError.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case geoError.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown geolocation error occurred.'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};