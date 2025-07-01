import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { setAddress as setNewAddress } from "@/store/reducers/selectedMapAddressSlice";
import { RiSearch2Line, RiFocus3Line, RiMapPinLine } from "@remixicon/react";
import { toast } from "sonner";
import { is_city_deliverable } from "@/interceptor/routes";
import { changeBranchId } from "@/events/actions";
import { useTranslation } from "react-i18next";
import GoogleMap from "../GoogleMap";
import LocationAutocomplete from "../LocationAutoComplete";

const LocationModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const selectedMapAddress = useSelector((state) => state.selectedCity.value);

  const [selectedLocation, setSelectedLocation] = useState({
    lat: selectedMapAddress?.lat || Number(process.env.NEXT_PUBLIC_LATITUDE),
    lng: selectedMapAddress?.lng || Number(process.env.NEXT_PUBLIC_LONGITUDE),
  });

  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (selectedMapAddress?.lat && selectedMapAddress?.lng) {
      setSelectedLocation({
        lat: selectedMapAddress.lat,
        lng: selectedMapAddress.lng,
      });
    }
  }, [selectedMapAddress]);

  const handleCitySelect = async (cityData) => {
    try {
      const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

      // Handle different input structures from CitySwiper and LocationAutocomplete
      const cityName = cityData.city || cityData.name;
      const latitude = cityData.lat || cityData.latitude;
      const longitude = cityData.lng || cityData.longitude;

      // Check if the city is deliverable
      const delivery = await is_city_deliverable({
        name: demoMode === "true" ? "bhuj" : cityName,
        latitude:
          demoMode === "true" ? process.env.NEXT_PUBLIC_LATITUDE : latitude,
        longitude:
          demoMode === "true" ? process.env.NEXT_PUBLIC_LONGITUDE : longitude,
      });

      if (delivery.error) {
        return toast.error(delivery.message);
      }

      // Update Redux store with the selected city's information
      dispatch(
        setNewAddress({
          city: demoMode === "true" ? "bhuj" : cityName,
          lat:
            demoMode === "true" ? process.env.NEXT_PUBLIC_LATITUDE : latitude,
          lng:
            demoMode === "true" ? process.env.NEXT_PUBLIC_LONGITUDE : longitude,
        })
      );

      // Set the address in the input field
      setAddress(cityName);

      // Update branch ID
      const branch_id = delivery.data[0].branch_id;
      changeBranchId({ branch_id });

      // Navigate to home page
      await router.push("/home");
      return toast.success("City is deliverable!");
    } catch (error) {
      return toast.error(error.message);
    }
  };

  const handleSelect = async (value) => {
    if (!value) {
      console.log("No value selected");

      return;
    }

    setAddress(value);

    try {
      const getPlaceDetails = (placeId) => {
        return new Promise((resolve, reject) => {
          const placesService = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );
          placesService.getDetails(
            {
              placeId,
              fields: ["address_components", "geometry", "formatted_address"],
            },
            (place, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                resolve(place);
              } else {
                reject(new Error(`Place details failed: ${status}`));
              }
            }
          );
        });
      };

      let locationData;

      // Check if value is a Place ID

      if (suggestions.some((suggestion) => suggestion.place_id === value)) {
        try {
          const place = await getPlaceDetails(value);
          locationData = {
            address_components: place.address_components,
            geometry: {
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
            },
          };
        } catch (error) {
          // console.error("Error getting place details:", error);
          toast.error("Failed to get location details");

          return;
        }
      } else {
        // Handle as regular address
        const results = await geocodeByAddress(value);
        if (results.length === 0) {
          toast.error("No location found. Please try a different address.");

          return;
        }
        const latLng = await getLatLng(results[0]);
        locationData = {
          address_components: results[0].address_components,
          geometry: {
            location: latLng,
          },
        };
      }

      // Extract city from location data
      const city = locationData.address_components.find((component) =>
        component.types.includes("locality")
      );

      if (!city?.long_name) {
        toast.error("City not found in selected location");

        return;
      }

      // Check city deliverability
      try {
        const delivery = await is_city_deliverable({
          name: city.long_name,
          latitude: locationData.geometry.location.lat,
          longitude: locationData.geometry.location.lng,
        });

        // Update selected location and map marker
        setSelectedLocation({
          lat: locationData.geometry.location.lat,
          lng: locationData.geometry.location.lng,
        });

        // Update Redux store with new address
        dispatch(
          setNewAddress({
            city: city.long_name,
            lat: locationData.geometry.location.lat,
            lng: locationData.geometry.location.lng,
          })
        );

        if (delivery.error) {
          toast.error("This city is not currently serviceable");

          return;
        }

        // Process successful delivery check
        if (delivery.data && delivery.data[0]) {
          const branch_id = delivery.data[0].branch_id;
          await changeBranchId({ branch_id });
          toast.success("Location set successfully");
          onClose(); // Close the modal
          await router.push("/home");
        } else {
          toast.error("Invalid delivery data received");
        }
      } catch (error) {
        // console.error("Delivery check error:", error);
        toast.error(error.message);
      }
    } catch (error) {
      // console.error("Location processing error:", error);
      toast.error("Error processing location. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      className="rounded"
      backdrop="blur"
      size="xl"
      isDismissable={false}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("select_location")}
            </ModalHeader>
            <ModalBody>
              {/* Location Search */}
              <div className="w-full max-w-[600px] mx-auto">
                {/* Location Search */}
                <LocationAutocomplete onCitySelect={handleCitySelect} />

                {/* Google Map */}
                <div className="mt-4 w-full">
                  <GoogleMap
                    center={selectedLocation}
                    onMarkerMove={(newPosition) => console.log(newPosition)}
                    zoom={12}
                    height="450px"
                    GpsBtn={false}
                    onGpsBtnClick={(position) => console.log(position)}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className="rounded"
              >
                {t("close")}
              </Button>
              <Button
                color="primary"
                onPress={() => handleSelect(address)}
                className="rounded"
              >
                {t("confirm")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LocationModal;
