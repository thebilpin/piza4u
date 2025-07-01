"use client";
import React, { useState, useEffect } from "react";
import {
  Image as NextImage,
  Button,
  Autocomplete,
  AutocompleteItem,
  CardHeader,
  Card,
  CardBody,
  Spinner,
  Input,
} from "@heroui/react";
import { useLoadScript } from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { useSelector, useDispatch } from "react-redux";
import { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { get_cities, is_city_deliverable } from "../interceptor/routes";
import { setAddress as setNewAddress } from "../store/reducers/selectedMapAddressSlice";
import { changeBranchId } from "../events/actions";
import { useRouter } from "next/router";
import { toast } from "sonner";
import CTAMobileAppDownload from "@/components/CTAMobileAppDownload/CTAMobileAppDownload";
import Image from "next/image";

// icons

import {
  RiFocus3Line,
  RiGpsLine,
  RiMapPin2Line,
  RiSearch2Line,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import {
  Parallax,
  ParallaxBanner,
  ParallaxProvider,
} from "react-scroll-parallax";
import { ThemeSwitch } from "@/components/theme-switch";
import CitySwiper from "@/components/CitySwiper/CitySwiper";
import LocationAutocomplete from "@/components/LocationAutoComplete";

const CoverPage = () => {
  const { t } = useTranslation();

  const settings = useSelector((state) => state.settings.value);
  const { theme } = useTheme();
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [cities, setCities] = React.useState([]);
  const [bannerImage, setBannerImage] = useState(
    "/assets/images/CoverBanner.png"
  );
  const dispatch = useDispatch();
  const router = useRouter();

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

  const isDarkMode = theme === "dark";

  const logoSrc = isDarkMode
    ? settings?.web_settings?.[0]?.light_logo
    : settings?.web_settings?.[0]?.logo;

  const mainImage = settings?.web_settings?.[0]?.landing_page_main_image
    ? settings.web_settings[0].landing_page_main_image
    : "/assets/images/CoverBanner.png";

  const mainTitle = settings?.web_settings?.[0]?.landing_page_main_title;

  const mainDescription = settings?.web_settings?.[0]?.landing_page_description;

  const storyTitle = settings?.web_settings?.[0]?.story_section_tile;

  const storyDescription =
    settings?.web_settings?.[0]?.story_section_description;

  useEffect(() => {
    if (settings?.web_settings?.[0]?.landing_page_main_image) {
      setBannerImage(settings.web_settings[0].landing_page_main_image);
    }
  }, [settings]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await get_cities();
        if (res?.error) {
          setCities([]);
        } else {
          setCities(res.data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      }
    };

    fetchCities();
  }, []);

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <Spinner color="primary" label="Loading..." />
      </div>
    );
  }

  const handleCitySelect = async (cityData) => {
    try {
      const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

      // Handle different input structures from CitySwiper and LocationAutocomplete
      const cityName = cityData.city || cityData.name;
      const latitude = Number(cityData.lat) || Number(cityData.latitude);
      const longitude = Number(cityData.lng) || Number(cityData.longitude);

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
  return (
    <ParallaxProvider>
      <div className="relative w-full full-width h-screen">
        <ParallaxBanner
          layers={[
            {
              image: bannerImage,
              speed: -20,
              scale: [1.0, 1.2],
              opacity: [1, 0.8],
              translateY: [0, 50],
              shouldAlwaysCompleteAnimation: true,
              expanded: false,
            },
          ]}
          className="min-h-screen relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50 z-[1]" />

          <div className="absolute top-0 left-0 right-0 z-[2] flex justify-between items-center p-4 md:p-6 text-white px-4 md:px-32">
            <div className="flex items-center">
              {settings && (
                <div className="px-2 py-1 rounded-md">
                  <Image
                    src={logoSrc}
                    alt="eRestro Single Vendor Logo"
                    width={140}
                    height={40}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-16 left-0 right-0 z-[2] px-4 md:px-32 pb-16 md:pb-24">
            <Parallax translateY={[-20, 20]} className="w-full">
              <div className="w-full max-w-[90%] md:max-w-4xl space-y-4 md:space-y-6">
                {mainTitle ? (
                  <h1 className="text-3xl md:text-5xl font-bold text-white">
                    {mainTitle}
                  </h1>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-5xl font-bold text-white">
                      {t("taste_the_difference")}
                    </h1>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                      {t("explore")}
                      <span className="text-primary-500"> {t("our_menu")}</span>
                    </h2>
                  </>
                )}

                <p className="text-base md:text-lg text-gray-200">
                  {mainDescription == ""
                    ? t("where_each_plate")
                    : mainDescription}
                </p>

                <div className="w-full md:w-96 mt-6">
                  <LocationAutocomplete onCitySelect={handleCitySelect} />
                </div>
                <CitySwiper cities={cities} onCitySelect={handleCitySelect} />
              </div>
            </Parallax>
          </div>
        </ParallaxBanner>

        <div className="relative z-10 py-12 px-4 md:px-8 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-24 md:w-32 lg:w-56">
            <Image
              src="/coverpage/pan.svg"
              alt="decorative-pan"
              width={300}
              height={300}
              objectFit="contain"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-24 md:w-32 lg:w-40">
            <Image
              src="/coverpage/leaves-cover-page.svg"
              alt="decorative-plate"
              width={200}
              height={200}
              objectFit="contain"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 md:w-28 lg:w-96">
            <Image
              src="/coverpage/garlic-cover-page.svg"
              alt="decorative-spoon"
              width={400}
              height={400}
              objectFit="contain"
            />
          </div>
          <div className="absolute top-0 right-0 w-16 md:w-20 lg:w-40">
            <Image
              src="/coverpage/pleant2-cover-page.svg"
              alt="decorative-new"
              width={200}
              height={200}
              objectFit="contain"
            />
          </div>

          {/* Content Section */}
          <div className="max-w-7xl mx-auto relative z-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
              {storyTitle == "" ? t("our_culinary_journey") : storyTitle}
            </h2>
            <p className="text-center max-w-xl mx-auto mb-12  text-sm md:text-base">
              {storyDescription == ""
                ? t("rooted_in_passion")
                : storyDescription}
            </p>

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Fast Delivery",
                  description:
                    "We promptly deliver your order directly to your door.",
                  image: "/assets/images/fast.png",
                },
                {
                  title: "Online Ordering",
                  description:
                    "Delight your guests with our flavors and presentation.",
                  image: "/assets/images/order-food.png",
                },
                {
                  title: "Catering",
                  description:
                    "Explore menus and order with ease using our online ordering service.",
                  image: "/assets/images/catering.png",
                },
              ].map((service, index) => (
                <Card
                  key={index}
                  isPressable
                  className="shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="flex flex-col items-center pt-6">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={80}
                      height={80}
                      className="mb-4"
                      objectFit="contain"
                    />
                  </CardHeader>
                  <CardBody className="text-center">
                    <h3 className="text-lg md:text-xl font-bold mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm md:text-base">
                      {service.description}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <CTAMobileAppDownload />
      </div>
    </ParallaxProvider>
  );
};

export default CoverPage;
