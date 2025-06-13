import { Loader } from "@googlemaps/js-api-loader";

// You'll need to set your Google Maps API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

class MapsService {
  constructor() {
    this.loader = null;
    this.isLoaded = false;
    this.maps = null;
    this.geocoder = null;
    this.directionsService = null;
    this.directionsRenderer = null;
  }

  // Initialize Google Maps API
  async initialize() {
    if (this.isLoaded) {
      return this.maps;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.warn(
        "Google Maps API key not provided. Map features will be disabled.",
      );
      return null;
    }

    try {
      this.loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places", "geometry"],
      });

      this.maps = await this.loader.load();
      this.isLoaded = true;

      // Initialize services
      this.geocoder = new this.maps.Geocoder();
      this.directionsService = new this.maps.DirectionsService();
      this.directionsRenderer = new this.maps.DirectionsRenderer();

      console.log("✅ Google Maps API loaded successfully");
      return this.maps;
    } catch (error) {
      console.error("❌ Failed to load Google Maps API:", error);
      return null;
    }
  }

  // Create a map instance
  async createMap(element, options = {}) {
    await this.initialize();

    if (!this.maps) {
      return null;
    }

    const defaultOptions = {
      zoom: 13,
      center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      ...options,
    };

    return new this.maps.Map(element, defaultOptions);
  }

  // Geocode an address
  async geocodeAddress(address) {
    await this.initialize();

    if (!this.geocoder) {
      throw new Error("Google Maps not available");
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            formattedAddress: results[0].formatted_address,
            placeId: results[0].place_id,
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  // Reverse geocode coordinates
  async reverseGeocode(lat, lng) {
    await this.initialize();

    if (!this.geocoder) {
      throw new Error("Google Maps not available");
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve({
            address: results[0].formatted_address,
            placeId: results[0].place_id,
            components: results[0].address_components,
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  // Calculate directions between two points
  async calculateDirections(origin, destination, travelMode = "DRIVING") {
    await this.initialize();

    if (!this.directionsService) {
      throw new Error("Google Maps not available");
    }

    return new Promise((resolve, reject) => {
      this.directionsService.route(
        {
          origin,
          destination,
          travelMode: this.maps.TravelMode[travelMode],
          unitSystem: this.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
        },
        (result, status) => {
          if (status === "OK") {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        },
      );
    });
  }

  // Display directions on a map
  async displayDirections(map, origin, destination, travelMode = "DRIVING") {
    try {
      const directionsResult = await this.calculateDirections(
        origin,
        destination,
        travelMode,
      );

      this.directionsRenderer.setMap(map);
      this.directionsRenderer.setDirections(directionsResult);

      return directionsResult;
    } catch (error) {
      console.error("Failed to display directions:", error);
      throw error;
    }
  }

  // Get current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    });
  }

  // Create a marker
  createMarker(map, position, options = {}) {
    if (!this.maps) {
      return null;
    }

    const defaultOptions = {
      position,
      map,
      ...options,
    };

    return new this.maps.Marker(defaultOptions);
  }

  // Create an info window
  createInfoWindow(content, options = {}) {
    if (!this.maps) {
      return null;
    }

    return new this.maps.InfoWindow({
      content,
      ...options,
    });
  }

  // Setup autocomplete for address input
  async setupAddressAutocomplete(inputElement, options = {}) {
    await this.initialize();

    if (!this.maps) {
      return null;
    }

    const defaultOptions = {
      types: ["address"],
      fields: ["place_id", "formatted_address", "geometry"],
      ...options,
    };

    const autocomplete = new this.maps.places.Autocomplete(
      inputElement,
      defaultOptions,
    );

    return autocomplete;
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    if (!this.maps) {
      return null;
    }

    const distance = this.maps.geometry.spherical.computeDistanceBetween(
      new this.maps.LatLng(point1.lat, point1.lng),
      new this.maps.LatLng(point2.lat, point2.lng),
    );

    return {
      meters: distance,
      kilometers: distance / 1000,
      miles: distance * 0.000621371,
    };
  }

  // Check if API is available
  isAvailable() {
    return this.isLoaded && !!this.maps;
  }
}

// Create and export a singleton instance
export const mapsService = new MapsService();
export default mapsService;
