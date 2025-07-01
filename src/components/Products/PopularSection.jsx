import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import OfferCards from "../../components/Cards/OfferCards";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { setFavorites } from "@/store/reducers/favoritesSlice";
import { getFavorites } from "@/interceptor/routes";
import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "@/events/getters";
import { Tooltip } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import SectionHeading from "../SectionHeading/SectionHeading";

const PopularSection = ({ data, onFavoriteChange, isItemFavorited }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const groupItems = (items, groupSize) => {
    return items.reduce((acc, item, index) => {
      if (index % groupSize === 0) {
        acc.push([]);
      }
      acc[acc.length - 1].push(item);
      return acc;
    }, []);
  };

  const groupedData = groupItems(data, 6);

  const WaveBackground = () => {
    const generateWavePath = (yOffset, amplitude, frequency) => {
      let path = `M 0 ${yOffset} `;
      for (let x = 0; x <= 100; x += 1) {
        const y = yOffset + Math.sin(x * frequency) * amplitude;
        path += `L ${x} ${y} `;
      }
      return path;
    };

    return (
      <svg
        className="absolute top-0 left-0 w-full h-32"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        style={{ zIndex: 0 }}
      >
        <path
          d={generateWavePath(20, 5, 0.3)}
          stroke="#FFA07A"
          strokeWidth="1.0"
          fill="none"
          opacity="0.3"
        />
        <path
          d={generateWavePath(30, 3, 0.5)}
          stroke="#D3D3D3"
          strokeWidth="1.0"
          fill="none"
          opacity="0.4"
        />
        <path
          d={generateWavePath(40, 4, 0.4)}
          stroke="#FFA07A"
          strokeWidth="1.0"
          fill="none"
          opacity="0.3"
        />
        <path
          d={generateWavePath(50, 6, 0.2)}
          stroke="#D3D3D3"
          strokeWidth="1.0"
          fill="none"
          opacity="0.4"
        />
      </svg>
    );
  };

  const handleViewAllClick = () => {
    router.push(`/products`);
  };

  return (
    <div className="relative mx-auto px-4 py-8 bg-[#f1eedb] full-width pb-12">
      <WaveBackground />

      <SectionHeading
        title={t("todays_favorites")}
        shortDescription="The most-loved picks of the day."
        onShowMoreClick={handleViewAllClick}
      />

      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        speed={1200}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        effect="slide"
        pagination={true}
      >
        {groupedData.map((slideItems, slideIndex) => (
          <SwiperSlide key={slideIndex}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8">
              {slideItems.map((item, index) => (
                <OfferCards
                  key={index}
                  image={item.image_sm}
                  title={item.name}
                  categoryName={item.category_name}
                  rating={item.rating}
                  price={item.variants[0]?.price}
                  specialPrice={item.variants[0].special_price}
                  discount={item.min_max_price.discount_in_percentage}
                  discountedPrice={
                    item.variants[0].special_price != 0
                      ? item.variants[0].special_price
                      : item.variants[0].price
                  }
                  description={item.description}
                  product={item}
                  onFavoriteChange={onFavoriteChange}
                  isFavorite={isItemFavorited(item.id)}
                  indicator={item.indicator}
                  is_spicy={item.is_spicy}
                  best_seller={item.best_seller}
                />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PopularSection;
