import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { mapsService } from "../services/maps";

const AddressInput = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  onCoordinatesChange,
  showCurrentLocation = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    initializeAutocomplete();
    return () => {
      if (autocompleteRef.current) {
        mapsService.maps?.event?.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, []);

  const initializeAutocomplete = async () => {
    try {
      if (!inputRef.current) return;

      const autocomplete = await mapsService.setupAddressAutocomplete(
        inputRef.current,
        {
          types: ["address"],
          fields: ["place_id", "formatted_address", "geometry"],
        },
      );

      if (autocomplete) {
        autocompleteRef.current = autocomplete;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (place.geometry && place.geometry.location) {
            const coords = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };

            setCoordinates(coords);
            onChange(place.formatted_address || "");
            onCoordinatesChange?.(coords);
            setError("");
          }
        });
      }
    } catch (error) {
      console.warn("Google Maps not available, using fallback address input");
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce geocoding for manual input
    debounceRef.current = setTimeout(async () => {
      if (inputValue.length > 3 && !autocompleteRef.current) {
        await handleManualGeocoding(inputValue);
      }
    }, 500);
  };

  const handleManualGeocoding = async (address) => {
    if (!mapsService.isAvailable()) return;

    try {
      setIsLoading(true);
      const result = await mapsService.geocodeAddress(address);

      setCoordinates({
        lat: result.lat,
        lng: result.lng,
      });

      onCoordinatesChange?.({
        lat: result.lat,
        lng: result.lng,
      });

      setError("");
    } catch (error) {
      console.error("Geocoding failed:", error);
      setError("Could not find this address");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError("");

      const location = await mapsService.getCurrentLocation();
      const address = await mapsService.reverseGeocode(
        location.lat,
        location.lng,
      );

      setCoordinates(location);
      onChange(address.address);
      onCoordinatesChange?.(location);
    } catch (error) {
      console.error("Location error:", error);
      setError("Could not get your current location");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          />

          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
          )}

          {showCurrentLocation && !isLoading && (
            <button
              type="button"
              onClick={getCurrentLocation}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {coordinates && (
          <p className="mt-1 text-xs text-gray-500">
            📍 Location confirmed: {coordinates.lat.toFixed(6)},{" "}
            {coordinates.lng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressInput;
