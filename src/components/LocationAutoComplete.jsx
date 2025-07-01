import { useState, useEffect, useRef, useCallback } from "react";

import { RiCrosshair2Fill, RiSearch2Line } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import debounce from "lodash/debounce";
import { Button } from "@heroui/button";
import { useTheme } from "next-themes";
import { Input } from "@heroui/input";
import { toast } from "sonner";

const LocationAutocomplete = ({
  latitude = Number(process.env.NEXT_PUBLIC_LATITUDE),
  longitude = Number(process.env.NEXT_PUBLIC_LONGITUDE),
  onCitySelect = () => {},
  hideLocationIcon = false,
  maxWidth = 600,
  defaultValue = "",
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputWrapperRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const placesLibRef = useRef(null);
  const geocoderRef = useRef(null);
  const listRef = useRef(null);
  const theme = useTheme();
  const { t } = useTranslation();
  // Load the Places and Geocoding libraries once when the component is mounted
  useEffect(() => {
    const loadLibraries = async () => {
      if (typeof google !== "undefined") {
        try {
          // Load Places library
          const { AutocompleteSuggestion, AutocompleteSessionToken } =
            await google.maps.importLibrary("places");

          const sessionToken = new AutocompleteSessionToken();
          placesLibRef.current = { AutocompleteSuggestion };
          sessionTokenRef.current = sessionToken;

          // Load Geocoding library
          const { Geocoder } = await google.maps.importLibrary("geocoding");
          geocoderRef.current = new Geocoder();

          console.log("Libraries loaded successfully");
        } catch (error) {
          toast.error(`Error loading Google Maps libraries: ${error.message}`);
          console.error("Error loading Google Maps libraries:", error);
        }
      }
    };

    loadLibraries();
  }, []);

  // Debounced function to handle input changes and fetch autocomplete suggestions
  const fetchSuggestions = useCallback(
    async (value) => {
      if (!value || value.length < 3 || !placesLibRef.current) {
        setSuggestions([]);
        return;
      }

      setLoading(true);

      try {
        const request = {
          input: value,
          sessionToken: sessionTokenRef.current,
          locationBias: {
            center: { lat: latitude, lng: longitude },
            radius: 50000, // 50km radius
          },
        };

        const autocompleteResponse =
          await placesLibRef.current.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            request
          );

        // More flexible suggestion extraction
        const suggestionsData =
          autocompleteResponse?.suggestions || autocompleteResponse?.data || [];

        // Validate suggestions
        if (Array.isArray(suggestionsData)) {
          setSuggestions(suggestionsData);
        } else {
          console.error("Unexpected suggestions format:", suggestionsData);
          toast.error("Unable to fetch location suggestions");
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Detailed Autocomplete Error:", error);
        toast.error(
          `Error fetching autocomplete suggestions: ${error.message}`
        );
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [latitude, longitude]
  );

  // Create a debounced version of the fetchSuggestions function
  const debouncedFetchSuggestions = useRef(
    debounce(fetchSuggestions, 300)
  ).current;

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedFetchSuggestions(value); // Call the debounced function
  };

  // Handle selection of a suggestion
  const handleSelectSuggestion = useCallback(
    async (suggestion) => {
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location"],
        });

        const cityName =
          place.displayName ||
          place.formattedAddress ||
          suggestion.placePrediction.text.text;

        // Extract latitude and longitude by calling the methods
        const lat = place.location.lat(); // Call the lat() method
        const lng = place.location.lng(); // Call the lng() method

        setInputValue(cityName);
        setSuggestions([]);

        // Call onCitySelect with the city name, latitude, and longitude
        onCitySelect({ city: cityName, lat, lng, selectedAddress: suggestion });
      } catch (error) {
        toast.error(`Error fetching place details: ${error.message}`);
        console.error("Error fetching place details:", error);
      }
    },
    [onCitySelect]
  );

  // Reverse geocode to get city name from coordinates
  const reverseGeocode = useCallback(async (lat, lng) => {
    if (!geocoderRef.current) {
      toast.error("Geocoding service not available");
      return null;
    }

    try {
      const response = await geocoderRef.current.geocode({
        location: { lat, lng },
      });

      if (
        response.results &&
        Array.isArray(response.results) &&
        response.results.length > 0
      ) {
        let cityName = null;
        for (const result of response.results) {
          // Check if address_components is an array
          if (Array.isArray(result.address_components)) {
            // First try to find a result with locality component (city)
            if (!cityName) {
              for (const component of result.address_components) {
                if (component.types.includes("locality")) {
                  cityName = component.long_name; // Use long_name instead of longText
                  break;
                }
              }
            }

            // If no city found, look for sublocality as fallback
            if (!cityName) {
              for (const component of result.address_components) {
                if (component.types.includes("sublocality")) {
                  cityName = component.long_name; // Use long_name instead of longText
                  break;
                }
              }
            }

            // If still no match, use formatted address as last resort
            if (cityName) break;
          }
        }

        return cityName || response.results[0].formatted_address; // Use formatted_address instead of formattedAddress
      }
      return null;
    } catch (error) {
      toast.error(`Reverse geocoding failed: ${error.message}`);
      console.error("Reverse geocoding error:", error);
      return null;
    }
  }, []);

  // Handle keyboard navigation for suggestions
  const handleKeyDown = useCallback(
    (e) => {
      if (suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          Math.min(prevIndex + 1, suggestions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else if (e.key === "Escape") {
        setSuggestions([]);
        setHighlightedIndex(-1);
      }
    },
    [suggestions, highlightedIndex, handleSelectSuggestion]
  );

  // Scroll to the highlighted item in the list
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const listItems = listRef.current.querySelectorAll("li");
      const highlightedItem = listItems[highlightedIndex];

      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex, suggestions]);

  const handleCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Get city name using reverse geocoding
          const cityName = await reverseGeocode(latitude, longitude);

          if (cityName) {
            setInputValue(cityName);
            // Call onCitySelect with cityName and coordinates when GPS button is clicked
            onCitySelect({ city: cityName, lat: latitude, lng: longitude });
          } else {
            // Fallback to coordinates if city name couldn't be found
            const fallbackCity = `Lat: ${latitude}, Lng: ${longitude}`;
            setInputValue(fallbackCity);
            // Call onCitySelect with the fallback coordinates
            onCitySelect({ city: false, lat: latitude, lng: longitude });
          }

          setLoading(false);
        },
        (error) => {
          setLoading(false);
          toast.error(`Error getting current location: ${error.message}`);
          console.error("Error getting current location:", error);
        }
      );
    } else {
      setLoading(false);
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="relative w-full" style={{ maxWidth: `${maxWidth}px` }}>
      <Input
        type="text"
        placeholder="Type to choose a location"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full"
        startContent={
          <RiSearch2Line className="w-9 group-focus-within:text-primary-500 transition-colors" size={20} />
        }
        endContent={
          !hideLocationIcon ? (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={handleCurrentLocation}
              className="text-primary-500"
            >
              <RiCrosshair2Fill size={20} />
            </Button>
          ) : null
        }
      />

      {loading && (
        <div className="absolute z-50 w-full p-2">
          <div className="w-full h-1 bg-primary-500 animate-pulse"></div>
        </div>
      )}

      {suggestions?.length > 0 && !loading && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full max-h-[300px] overflow-y-auto 
        bg-white border rounded-md shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`p-2 cursor-pointer hover:bg-primary-100
            ${highlightedIndex === index ? "bg-primary-100" : ""}`}
            >
              {suggestion.placePrediction.text.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
