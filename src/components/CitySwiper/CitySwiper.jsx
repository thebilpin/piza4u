import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { RiMapPin2Line } from "@remixicon/react";
import { motion } from "framer-motion";
import "swiper/css";

const CitySwiper = ({ cities, onCitySelect }) => {
  // Create our own media query functionality
  const [isMd, setIsMd] = React.useState(false);
  const [isSm, setIsSm] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  React.useEffect(() => {
    // Setup media queries
    const mdQuery = window.matchMedia("(min-width: 768px)");
    const smQuery = window.matchMedia(
      "(min-width: 640px) and (max-width: 767px)"
    );

    const updateMediaQueries = () => {
      setIsMd(mdQuery.matches);
      setIsSm(smQuery.matches);
    };

    // Initial check
    updateMediaQueries();

    // Add listeners
    mdQuery.addEventListener("change", updateMediaQueries);
    smQuery.addEventListener("change", updateMediaQueries);

    // Cleanup
    return () => {
      mdQuery.removeEventListener("change", updateMediaQueries);
      smQuery.removeEventListener("change", updateMediaQueries);
    };
  }, []);

  if (!cities?.length) {
    return null;
  }

  const getFullSlidesCount = () => {
    if (isMd) return 6.5;
    if (isSm) return 3.5;
    return 2.5;
  };

  return (
    <div className="mt-2 mb-3 w-full relative">
      <div className="relative w-full flex flex-wrap items-start">
        <Swiper
          spaceBetween={12}
          slidesPerView={getFullSlidesCount()}
          centeredSlides={false} // Ensure it doesn't shift slides
          style={{
            paddingRight: "1px",
            width: "100%",
            height: "auto",
          }}
          className="w-full h-auto"
        >
          {cities.map((city, index) => (
            <SwiperSlide key={city.id} className="w-auto h-auto">
              <Card
                as={motion.div}
                whileTap={{ scale: 0.98 }}
                isHoverable
                isPressable
                className={`cursor-pointer transition-all duration-200 h-full min-w-[100px] max-w-[120px] backdrop-blur-sm bg-opacity-80 border border-gray-200/20 ${
                  activeIndex === index
                    ? "bg-primary-500/10 border-primary-500/50"
                    : "bg-black/30 hover:bg-black/20"
                }`}
                onClick={() => {
                  setActiveIndex(index);
                  onCitySelect(city);
                }}
              >
                <CardBody className="p-2">
                  <div className="flex items-center justify-center gap-1 min-h-[16px]">
                    <RiMapPin2Line
                      size={14}
                      className={
                        activeIndex === index
                          ? "text-primary-500"
                          : "text-primary-500"
                      }
                    />
                    <span
                      className={`text-xs font-medium text-center overflow-hidden text-ellipsis whitespace-nowrap ${
                        activeIndex === index
                          ? "text-primary-500"
                          : "text-primary-500"
                      }`}
                    >
                      {city.name}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CitySwiper;
