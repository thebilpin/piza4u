"use client";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Radio,
  RadioGroup,
  Checkbox,
  Accordion,
  AccordionItem,
  Pagination,
  CardFooter,
} from "@heroui/react";
import {
  updateAddress,
  removeUserAddress,
  addAddress,
  getUserAddress,
} from "@/interceptor/routes";
import { setUserAddresses } from "@/store/reducers/userAddressSlice";
import { toast } from "sonner";

// icons
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiMap2Line,
  RiSettings2Line,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { clearDeliveryAddress } from "@/store/reducers/selectedDeliverySlice";
import LocationAutocomplete from "../LocationAutoComplete";
import GoogleMap from "../GoogleMap";

const AddressSelector = ({
  addresses = [],
  selectedAddressId = null,
  onAddressSelect,
  showAddNew = true,
  itemsPerPage = 6,
  userId,
  isCartPage = false,
  compact = false,
}) => {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const [currentSelectedId, setCurrentSelectedId] = useState(selectedAddressId);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLocation, setSelectedLocation] = useState({
    lat: Number(process.env.NEXT_PUBLIC_LATITUDE),
    lng: Number(process.env.NEXT_PUBLIC_LONGITUDE),
  });

  const initialAddressState = {
    user_id: userId,
    mobile: "",
    address: "",
    type: "Home",
    landmark: "",
    area: "",
    pincode: "",
    city: "",
    latitude: "",
    longitude: "",
    is_default: false,
  };

  const [newAddress, setNewAddress] = useState(initialAddressState);

  const totalPages = Math.ceil(addresses.length / itemsPerPage);

  const getPaginatedAddresses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return addresses.slice(startIndex, endIndex);
  };

  const extractAddressComponents = (addressComponents) => {
    let addressData = {
      address: "",
      area: "",
      city: "",
      pincode: "",
      latitude: "",
      longitude: "",
    };

    let addressParts = {
      street_number: "",
      route: "",
      sublocality_level_2: "",
      sublocality_level_1: "",
      locality: "",
      administrative_area_level_2: "",
      administrative_area_level_1: "",
      country: "",
      postal_code: "",
    };

    addressComponents.forEach((component) => {
      const types = component.types;

      types.forEach((type) => {
        if (addressParts.hasOwnProperty(type)) {
          addressParts[type] = component.long_name;
        }
      });

      if (types.includes("postal_code")) {
        addressData.pincode = component.long_name;
      }
      if (types.includes("locality")) {
        addressData.city = component.long_name;
      }
      if (types.includes("sublocality_level_1")) {
        addressData.area = component.long_name;
      }
    });

    const streetAddress = [addressParts.street_number, addressParts.route]
      .filter(Boolean)
      .join(" ");

    const area = [
      addressParts.sublocality_level_2,
      addressParts.sublocality_level_1,
    ]
      .filter(Boolean)
      .join(", ");

    addressData.address = [
      streetAddress,
      area,
      addressParts.locality,
      addressParts.administrative_area_level_1,
      addressParts.postal_code,
      addressParts.country,
    ]
      .filter(Boolean)
      .join(", ");

    if (!addressData.address.trim()) {
      addressData.address =
        addressComponents[0]?.long_name || "Address not found";
    }

    if (!addressData.area) {
      addressData.area =
        addressParts.sublocality_level_1 ||
        addressParts.sublocality_level_2 ||
        addressParts.administrative_area_level_2 ||
        "";
    }

    if (!addressData.city) {
      addressData.city =
        addressParts.locality || addressParts.administrative_area_level_2 || "";
    }

    return addressData;
  };

  // Function to handle location selection from LocationAutocomplete
  const handleLocationSelect = ({ city, lat, lng, selectedAddress }) => {
    if (!lat || !lng) return;

    setSelectedLocation({ lat, lng });

    if (selectedAddress) {
      // For when a place is selected from autocomplete
      reverseGeocode(lat, lng);
    }
  };

  // Function to handle marker movement on map
  const handleMarkerMove = async ({ lat, lng }) => {
    setSelectedLocation({ lat, lng });
    await reverseGeocode(lat, lng);
  };

  // Reverse geocoding function using browser's Google Maps API
  const reverseGeocode = async (lat, lng) => {
    if (!window.google?.maps) {
      toast.error("Google Maps API not loaded");
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });

      if (response?.results?.[0]) {
        const place = response.results[0];
        const addressData = extractAddressComponents(place.address_components);
        addressData.latitude = lat.toString();
        addressData.longitude = lng.toString();

        if (isAddingNew) {
          setNewAddress((prev) => ({
            ...prev,
            ...addressData,
          }));
        } else if (editingAddress) {
          setEditingAddress((prev) => ({
            ...prev,
            ...addressData,
          }));
        }
      }
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
      toast.error("Failed to fetch address details");
    }
  };

  useEffect(() => {
    const defaultAddress = addresses.find((addr) => addr.is_default === "1");
    if (defaultAddress && !currentSelectedId) {
      setCurrentSelectedId(defaultAddress.id);
      if (onAddressSelect) {
        onAddressSelect(defaultAddress.id);
      }

      // Set map location to default address coordinates if available
      if (defaultAddress.latitude && defaultAddress.longitude) {
        setSelectedLocation({
          lat: Number(defaultAddress.latitude),
          lng: Number(defaultAddress.longitude),
        });
      }
    }
  }, [addresses, currentSelectedId, onAddressSelect]);

  // function for default address and select address
  const handleAddressSelect = async (id) => {
    try {
      const selectedAddress = addresses.find((addr) => addr.id === id);
      if (!selectedAddress) return;

      if (isCartPage) {
        // In cart page, just update the selection without changing default status
        setCurrentSelectedId(id);
        if (onAddressSelect) onAddressSelect(id);

        // Update map location if coordinates exist
        if (selectedAddress.latitude && selectedAddress.longitude) {
          setSelectedLocation({
            lat: Number(selectedAddress.latitude),
            lng: Number(selectedAddress.longitude),
          });
        }
      } else {
        // Original logic for address management page
        if (currentSelectedId === id) {
          if (selectedAddress.is_default === "1") {
            toast.error("Cannot unselect default address");
            return;
          }
          setCurrentSelectedId(null);
          if (onAddressSelect) onAddressSelect(null);
        } else {
          setCurrentSelectedId(id);
          if (onAddressSelect) onAddressSelect(id);

          const updatedAddress = {
            ...selectedAddress,
            is_default: "1",
          };

          const response = await updateAddress(updatedAddress);

          if (!response.error) {
            const promises = addresses
              .filter((addr) => addr.id !== id && addr.is_default === "1")
              .map((addr) =>
                updateAddress({
                  ...addr,
                  is_default: "0",
                })
              );

            await Promise.all(promises);

            const addressResponse = await getUserAddress({
              user_id: selectedAddress.user_id,
            });
            if (!addressResponse.error) {
              dispatch(setUserAddresses(addressResponse.data));
              toast.success("Default address updated successfully");
            }
          } else {
            toast.error(response.message);
          }
        }
      }
    } catch (error) {
      console.error("Error updating address selection:", error);
      toast.error("Failed to update address");
    }

    const selectedAddress = addresses.find((addr) => addr.id === id);
    if (selectedAddress?.latitude && selectedAddress?.longitude) {
      setSelectedLocation({
        lat: Number(selectedAddress.latitude),
        lng: Number(selectedAddress.longitude),
      });
    }
  };

  const handleEditClick = (address) => {
    setEditingAddress({
      ...address,
      is_default: address.is_default === "1",
    });
    setIsAddingNew(false);

    if (address.latitude && address.longitude) {
      setSelectedLocation({
        lat: Number(address.latitude),
        lng: Number(address.longitude),
      });
    }
  };

  const handleAddNewClick = () => {
    setIsAddingNew(true);
    setEditingAddress(null);
    setNewAddress(initialAddressState);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isAddingNew) {
      setNewAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditingAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateAddress = async () => {
    const requiredFields = ["address", "area", "city", "pincode", "mobile"];
    const missingFields = requiredFields.filter(
      (field) => !editingAddress[field] || editingAddress[field].trim() === ""
    );

    if (missingFields.length > 0) {
      const missingFieldsText = missingFields
        .map((field) => t(field))
        .join(", ");
      toast.error(
        `Please fill in the following required fields: ${missingFieldsText}`
      );
      return;
    }

    try {
      const addressToUpdate = {
        ...editingAddress,
        is_default: editingAddress.is_default ? "1" : "0",
      };

      const response = await updateAddress(addressToUpdate);
      if (!response.error) {
        // After successful update, fetch fresh address list
        const addressResponse = await getUserAddress({ user_id: userId });
        if (!addressResponse.error) {
          dispatch(setUserAddresses(addressResponse.data));
        }
        setEditingAddress(null);
        toast.success("Address updated successfully");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
    }
  };

  const handleAddAddress = async () => {
    const requiredFields = ["address", "area", "city", "pincode", "mobile"];
    const missingFields = requiredFields.filter(
      (field) => !newAddress[field] || newAddress[field].trim() === ""
    );

    if (missingFields.length > 0) {
      const missingFieldsText = missingFields
        .map((field) => t(field))
        .join(", ");
      toast.error(
        `Please fill in the following required fields: ${missingFieldsText}`
      );
      return;
    }

    try {
      const response = await addAddress(newAddress);
      if (!response.error) {
        // After successful addition, fetch fresh address list
        const addressResponse = await getUserAddress({ user_id: userId });
        if (!addressResponse.error) {
          dispatch(setUserAddresses(addressResponse.data));
        }
        setIsAddingNew(false);
        setNewAddress(initialAddressState);
        toast.success("Address added successfully");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      // Check if this is the last address
      const isLastAddress = addresses.length === 1;

      const response = await removeUserAddress({ id });
      if (!response.error) {
        // Directly update the Redux store to reflect the deletion
        let updatedAddresses;
        if (isLastAddress) {
          // If it's the last address, set the addresses to an empty array
          updatedAddresses = [];
        } else {
          // Otherwise, filter out the deleted address
          updatedAddresses = addresses.filter((addr) => addr.id !== id);
        }

        // Dispatch the updated addresses to Redux
        dispatch(setUserAddresses(updatedAddresses));

        // Reset current selected address if the deleted address was selected
        if (currentSelectedId === id) {
          setCurrentSelectedId(null);
          if (onAddressSelect) {
            onAddressSelect(null);
          }
        }
        dispatch(clearDeliveryAddress());
        toast.success("Address deleted successfully");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-6">
        <Card className="w-full rounded-lg shadow-md">
          <CardHeader className="px-6 py-4 flex flex-wrap justify-between items-center border-b dark:border-gray-600">
            <div className="flex items-center gap-3">
              <RiMap2Line className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-bold">{t("delivery_address")}</h3>
            </div>
            {showAddNew && (
              <Button
                color="primary"
                variant="solid"
                onPress={handleAddNewClick}
                className="rounded-lg font-semibold hover:bg-primary-600 transition-colors mt-2 md:mt-0"
                startContent={<RiAddLine className="w-5 h-5" />}
              >
                {t("add_address")}
              </Button>
            )}
          </CardHeader>

          <CardBody className="px-6 py-6">
            {/* Address Form Section */}
            {(isAddingNew || editingAddress) && (
              <div className="mb-6 rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                <h4 className="text-xl font-semibold mb-6">
                  {isAddingNew ? t("add_address") : t("edit_address")}
                </h4>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Form Inputs Section */}
                  <div className="md:col-span-2 grid grid-cols-1 gap-4">
                    <div className="col-span-1">
                      <LocationAutocomplete
                        onCitySelect={handleLocationSelect}
                        defaultValue={
                          isAddingNew
                            ? newAddress.address
                            : editingAddress?.address
                        }
                      />
                    </div>
                    <Input
                      isRequired
                      label={t("address")}
                      placeholder={t("enter_address")}
                      name="address"
                      value={
                        isAddingNew
                          ? newAddress.address
                          : editingAddress?.address
                      }
                      onChange={handleInputChange}
                      className="rounded-lg"
                    />
                    <Input
                      isRequired
                      label={t("area")}
                      placeholder={t("enter_area")}
                      name="area"
                      value={
                        isAddingNew ? newAddress.area : editingAddress?.area
                      }
                      onChange={handleInputChange}
                      className="rounded-lg"
                    />
                    <Input
                      isRequired
                      label={t("city")}
                      placeholder={t("enter_city")}
                      name="city"
                      value={
                        isAddingNew ? newAddress.city : editingAddress?.city
                      }
                      onChange={handleInputChange}
                      className="rounded-lg"
                    />
                    <Input
                      isRequired
                      label={t("pincode")}
                      placeholder={t("enter_pincode")}
                      name="pincode"
                      value={
                        isAddingNew
                          ? newAddress.pincode
                          : editingAddress?.pincode
                      }
                      onChange={handleInputChange}
                      className="rounded-lg"
                    />
                    <Input
                      isRequired
                      label={t("mobile")}
                      placeholder={t("enter_mobile_number")}
                      name="mobile"
                      value={
                        isAddingNew ? newAddress.mobile : editingAddress?.mobile
                      }
                      onChange={handleInputChange}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Address Type and Default Checkbox Section */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        {t("address_type")}
                      </label>
                      <RadioGroup
                        value={
                          isAddingNew ? newAddress.type : editingAddress?.type
                        }
                        onValueChange={(value) =>
                          handleInputChange({ target: { name: "type", value } })
                        }
                        orientation="horizontal"
                        className="flex gap-4"
                      >
                        {["Home", "Work", "Other"].map((type) => (
                          <Radio key={type} value={type}>
                            {type}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </div>
                    <Checkbox
                      isSelected={
                        isAddingNew
                          ? newAddress.is_default
                          : editingAddress?.is_default
                      }
                      onValueChange={(checked) =>
                        handleInputChange({
                          target: { name: "is_default", value: checked },
                        })
                      }
                    >
                      {t("default_address")}
                    </Checkbox>
                  </div>
                </div>

                {/* Map Section */}
                <div className="mt-6 h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                  <GoogleMap
                    center={selectedLocation}
                    zoom={15}
                    onMarkerMove={handleMarkerMove}
                    height="300px"
                    GpsBtn={false}
                    onGpsBtnClick={async (newCenter) => {
                      setSelectedLocation(newCenter);
                      await reverseGeocode(newCenter.lat, newCenter.lng);
                    }}
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() =>
                      isAddingNew
                        ? setIsAddingNew(false)
                        : setEditingAddress(null)
                    }
                    className="rounded-lg font-semibold hover:bg-red-100 transition-colors"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={
                      isAddingNew ? handleAddAddress : handleUpdateAddress
                    }
                    className="rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                  >
                    {isAddingNew ? t("add_address") : t("update_address")}
                  </Button>
                </div>
              </div>
            )}

            {/* Address List Section */}
            <div className="space-y-6">
              {getPaginatedAddresses().map((address) => (
                <div
                  key={address.id}
                  className={`p-6 rounded-lg border bg-white dark:bg-gray-900 transition-all duration-200 ${
                    currentSelectedId === address.id
                      ? "border-primary bg-primary-50 dark:bg-gray-800"
                      : "border-gray-200 dark:border-gray-600 hover:border-primary hover:shadow-md"
                  } ${compact ? "w-full" : "w-full md:w-[calc(50%-1rem)]"}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <Checkbox
                      isSelected={currentSelectedId === address.id}
                      onChange={() => handleAddressSelect(address.id)}
                    >
                      <div className="flex flex-col gap-2">
                        <span className="font-semibold text-lg flex items-center gap-2">
                          {address.type}
                          {address.is_default === "1" && (
                            <span className="text-xs bg-primary-100 text-primary px-2 py-1 rounded-full">
                              {t("default")}
                            </span>
                          )}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {address.address}
                          {address.landmark && `, ${address.landmark}`}
                          {`, ${address.area}`}
                          {`, ${address.city} - ${address.pincode}`}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Mobile: {address.mobile}
                        </p>
                      </div>
                    </Checkbox>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        color="primary"
                        variant="flat"
                        onPress={() => handleEditClick(address)}
                        className="rounded-full hover:bg-primary-100 transition-colors"
                      >
                        <RiEdit2Line className="w-5 h-5" />
                      </Button>
                      <Button
                        isIconOnly
                        color="danger"
                        variant="flat"
                        onPress={() => handleDeleteAddress(address.id)}
                        className="rounded-full hover:bg-red-100 transition-colors"
                      >
                        <RiDeleteBinLine className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {getPaginatedAddresses().length === 0 && (
                <div className="text-center py-6">
                  <p className="">
                    {t("no_address_found")}
                  </p>
                </div>
              )}
            </div>
          </CardBody>

          {/* Pagination */}
          <CardFooter className="px-6 py-4">
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                  color="primary"
                  showControls
                  showShadow
                  className="flex items-center gap-2"
                />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AddressSelector;
