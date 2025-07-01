import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

const GoogleMap = ({
  center,
  onMarkerMove,
  zoom = 12,
  height = "500px",
  onGpsBtnClick = () => {},
  GpsBtn = false,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ensure center coordinates are valid numbers
  const getValidCenter = useCallback(() => {
    return {
      lat:
        typeof center?.lat === "number" && isFinite(center.lat)
          ? center.lat
          : 0,
      lng:
        typeof center?.lng === "number" && isFinite(center.lng)
          ? center.lng
          : 0,
    };
  }, [center]);

  // Initialize map only once when Google Maps API is loaded
  const initializeMap = useCallback(() => {
    if (!window.google?.maps || !mapRef.current || map) return;

    const validCenter = getValidCenter();

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: validCenter,
      zoom: zoom,
      zoomControl: true,
      fullscreenControl: true,
      streetViewControl: false,
      mapTypeControl: true,
    });

    const markerInstance = new window.google.maps.Marker({
      position: validCenter,
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    });

    // Event Listeners
    markerInstance.addListener("dragend", (event) => {
      const position = event.latLng;
      onMarkerMove?.({ lat: position.lat(), lng: position.lng() });
    });

    mapInstance.addListener("click", (event) => {
      markerInstance.setPosition(event.latLng);
      onMarkerMove?.({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    });

    if (GpsBtn) {
      const controlButton = document.createElement("button");
      controlButton.innerHTML =
        '<span class="material-icons">gps_fixed</span> Current Location';
      controlButton.className = "custom-map-control-button";
      controlButton.type = "button";
      controlButton.addEventListener("click", () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newCenter = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              mapInstance.panTo(newCenter);
              markerInstance.setPosition(newCenter);
              onGpsBtnClick(newCenter);
            },
            (error) => {
              toast.error("Unable to retrieve your location");
              console.error("Geolocation error:", error);
            }
          );
        } else {
          toast.error("Geolocation not supported by your browser");
        }
      });

      mapInstance.controls[window.google.maps.ControlPosition.TOP_CENTER].push(
        controlButton
      );
    }

    setMap(mapInstance);
    setMarker(markerInstance);
  }, [center, zoom, GpsBtn, onMarkerMove, onGpsBtnClick, getValidCenter]);

  // Check if Google Maps API is loaded
  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
    } else {
      const checkGoogleMaps = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);
      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  // Initialize map when API is loaded
  useEffect(() => {
    if (isLoaded && !map) {
      initializeMap();
    }
  }, [isLoaded, initializeMap, map]);

  // Update map center when prop changes
  useEffect(() => {
    if (map && marker && center) {
      // Validate coordinates before updating map and marker
      if (
        typeof center.lat === "number" &&
        isFinite(center.lat) &&
        typeof center.lng === "number" &&
        isFinite(center.lng)
      ) {
        try {
          map.panTo(center);
          marker.setPosition(center);
        } catch (error) {
          console.error("Error updating map position:", error);
        }
      }
    }
  }, [center, map, marker]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
    };
  }, [map]);

  return (
    <div ref={mapRef} style={{ height, width: "100%" }}>
      {!isLoaded && "Loading map..."}
    </div>
  );
};

export default React.memo(GoogleMap);
