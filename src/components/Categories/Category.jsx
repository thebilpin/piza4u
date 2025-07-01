import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { TypeAnimation } from "react-type-animation";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";

// icons
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import CategoryCard from "../Cards/CategoryCard";

const Category = () => {
  const { t } = useTranslation();

  const homeStoreData = useSelector((state) => state.homepage);
  const categories = homeStoreData.categories;
  const router = useRouter();
  const swiperRef = React.useRef(null); 
  const [isBeginning, setIsBeginning] = useState(true); 
  const [isEnd, setIsEnd] = useState(false); 

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleReachBeginning = () => {
    setIsBeginning(true);
  };

  const handleReachEnd = () => {
    setIsEnd(true);
  };

  const handleFromBeginning = () => {
    setIsBeginning(false);
  };

  const handleFromEnd = () => {
    setIsEnd(false);
  };

  return (
    <div className="relative">
      <div className="relative flex items-center justify-between w-full px-0 py-2">
        <h2 className="text-md sm:text-2xl font-bold sm:mx-auto mx-0 text-start sm:text-center flex-1">
          {t("we_offer_premium_categories")}
        </h2>

        <div className="flex flex-row gap-2">
          <button
            className={`transition text-white rounded-full ${
              isBeginning ? "bg-gray-300" : "bg-gray-500"
            } p-1 sm:p-2`}
            onClick={handlePrev}
          >
            <RiArrowLeftLine className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            className={`transition text-white rounded-full ${
              isEnd ? "bg-gray-300" : "bg-gray-500"
            } p-1 sm:p-2`}
            onClick={handleNext}
          >
            <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <Swiper
        ref={swiperRef}
        slidesPerView={9}
        spaceBetween={6}
        modules={[Autoplay]}
        pagination={{
          clickable: true,
        }}
        onReachBeginning={handleReachBeginning}
        onReachEnd={handleReachEnd}
        onSlidePrevTransitionStart={handleFromEnd}
        onSlideNextTransitionStart={handleFromBeginning}
        breakpoints={{
          320: {
            slidesPerView: 3,
          },
          640: {
            slidesPerView: 6,
          },
          1024: {
            slidesPerView: 9,
          },
        }}
      >
        {categories.map((category, index) => {
          return (
            <SwiperSlide key={category.id}>
              <div className="col-span-1 my-4">
                <CategoryCard category={category} />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Category;
