import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { useDispatch, useSelector } from "react-redux";
import { getUserData, isLogged } from "@/events/getters";
import { setFavorites } from "@/store/reducers/favoritesSlice";
import { getFavorites } from "@/interceptor/routes";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import SectionHeading from "../SectionHeading/SectionHeading";
import OfferCards from "../Cards/OfferCards";

const Offer = ({ data, onFavoriteChange, isItemFavorited }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleViewAllClick = () => {
    router.push(`/feature-products/${data.slug}`);
  };

  if (!data?.product_details?.length) {
    return null;
  }

  return (
    <div className="my-6 px-0">
      <SectionHeading
        title={data.title}
        shortDescription={data.short_description}
        onShowMoreClick={handleViewAllClick}
      />

      <div className="mt-6 mx-auto px-0 cursor-pointer">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          speed={1200}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          effect="slide"
          breakpoints={{
            380: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 4,
            },
            1280: {
              slidesPerView: 6,
            },
          }}
        >
          {data.product_details.slice(0, 8).map((item, index) => {
            const discount = item.min_max_price.discount_in_percentage;
            return (
              <SwiperSlide key={index}>
                <OfferCards
                  image={item.image_sm}
                  title={item.name}
                  categoryName={item.category_name}
                  rating={item.rating}
                  price={item.variants[0]?.price}
                  specialPrice={item.variants[0]?.special_price}
                  discount={discount}
                  discountedPrice={
                    item.variants[0]?.special_price != 0
                      ? item.variants[0]?.special_price
                      : item.variants[0]?.price
                  }
                  description={item.description}
                  product={item}
                  onFavoriteChange={onFavoriteChange}
                  isFavorite={isItemFavorited(item.id)}
                  indicator={item.indicator}
                  is_spicy={item.is_spicy}
                  best_seller={item.best_seller}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default Offer;
